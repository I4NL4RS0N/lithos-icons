// Builds dist/: a self-contained gallery page (data inlined) plus raw SVGs for direct linking.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';
import { GRID, SIZES } from './lib/kit.mjs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const index = JSON.parse(readFileSync('data/index.json', 'utf8'));
const out = 'dist';
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });
cpSync('icons', join(out, 'icons'), { recursive: true });
cpSync('flags', join(out, 'flags'), { recursive: true });

// Code-drawn concepts are redrawn live in the browser; only maps and flags ship as strings.
const concepts = index.map((c) => {
  const geo = c.kind === 'country' || c.kind === 'region';
  const flag = c.flag || null; // 'own' | 'flag-icons' | null; flag files are loaded as images, not inlined
  const rf = join('data/research', `${c.id}.json`);
  const decision = existsSync(rf) ? JSON.parse(readFileSync(rf, 'utf8')).decision : null;
  return { id: c.id, name: c.name, kind: c.kind, parent: c.parent || null, keywords: c.keywords || [], metaphor: c.metaphor,
    reduction: c.reduction, iso2: c.iso2 || null, m49: c.m49 || null, rationale: decision?.rationale || null, geo, flag };
});
// Map outlines are too many to inline: one JSON per size (id → path), fetched when that size is shown.
mkdirSync(join(out, 'geo'), { recursive: true });
for (const s of SIZES) {
  const paths = {};
  for (const c of index) if (c.kind === 'country' || c.kind === 'region') paths[c.id] = readFileSync(join('icons', c.id, `outline-${s}.svg`), 'utf8').match(/ d="([^"]+)"/)[1];
  writeFileSync(join(out, 'geo', `${s}.json`), JSON.stringify(paths));
}
const bundle = (await build({ entryPoints: ['src/browser.mjs'], bundle: true, minify: true, format: 'iife', globalName: 'LI', write: false, platform: 'browser', target: 'es2020' })).outputFiles[0].text;
// Standards: each node shows its mapped concept's icon, or inherits its parent's.
const standards = readdirSync('data/schemes').filter((f) => f.endsWith('.json')).map((f) => {
  const scheme = JSON.parse(readFileSync(join('data/schemes', f), 'utf8'));
  if (!scheme.publish) return null;
  const map = JSON.parse(readFileSync(join('data/mappings', f), 'utf8'));
  const raw = JSON.parse(readFileSync(join('data/nodes', f), 'utf8'));
  const byCode = Object.fromEntries(raw.map((n) => [n.code, n]));
  const inherit = (n) => { for (let x = n; x; x = byCode[x.parent]) if (map[x.code]) return map[x.code]; return null; }; // nearest ancestor with an icon
  const nodes = raw.map((n) => ({ code: n.code, name: n.name, parent: n.parent, concept: inherit(n), direct: !!map[n.code] }));
  for (const n of nodes) if (n.direct) { const c = concepts.find((x) => x.id === n.concept); (c.codes ||= []).push({ scheme: scheme.name, code: scheme.codes === false ? '' : n.code, name: n.name }); }
  // The tree is large (NAICS: 2,125 nodes), so it loads on demand; concept ids are indexed to keep the file small.
  const ids = [...new Set(nodes.map((n) => n.concept).filter(Boolean))];
  mkdirSync(join(out, 'std'), { recursive: true });
  writeFileSync(join(out, 'std', `${scheme.id}.json`), JSON.stringify({ ids, nodes: nodes.map((n) => [n.code, n.name, n.parent, n.concept ? ids.indexOf(n.concept) : -1, n.direct ? 1 : 0]) }));
  return { id: scheme.id, name: scheme.name, version: scheme.version, fullName: scheme.fullName, levels: scheme.levels, codes: scheme.codes !== false, credit: scheme.credit || '', source: scheme.credit ? scheme.source : '' };
}).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
const LEAD = ['energy', 'materials', 'industrials', 'consumer-discretionary', 'consumer-staples', 'health-care', 'financials', 'information-technology', 'communication-services', 'utilities', 'real-estate'];
const rank = (c) => (LEAD.includes(c.id) ? LEAD.indexOf(c.id) : LEAD.length);
concepts.sort((a, b) => rank(a) - rank(b)); // stable: everything else keeps its order
// Agent activity for the feed, ticker and new-icon dots. Only what is safe and useful to show (no cost, no raw reasons).
const names = Object.fromEntries(concepts.map((c) => [c.id, c.name]));
// Before/after SVGs come from the log, so allow only plain shapes before they are put in the page.
const SAFE = /^<svg[^>]*>(?:<(?:path|circle|rect|g|ellipse|line|polyline|polygon)\b[^>]*\/?>|<\/g>)*<\/svg>$/;
const safeSet = (o) => { try { for (const z of [16, 24]) for (const st of ['outline', 'solid']) if (!SAFE.test(o[z][st]) || /on\w+=|href|script/i.test(o[z][st])) return null; return o; } catch { return null; } };
const feed = (existsSync('data/agents/log.json') ? JSON.parse(readFileSync('data/agents/log.json', 'utf8')) : []).filter((e) => e.mode !== 'review').slice(-300).reverse().map((e) => {
  if (e.result === 'rejected') return { date: e.date, at: e.at, mode: e.mode, result: 'rejected' };
  const sc = e.scores || {};
  return { date: e.date, at: e.at, mode: e.mode, result: e.result, id: e.id, name: names[e.id] || e.name, kind: e.kind, attempts: e.attempts, why: e.why, reads: sc.reads_as, problems: (e.problems || []).slice(0, 2), before: e.before && e.after ? safeSet(e.before) : null, after: e.before && e.after ? safeSet(e.after) : null,
    picture: e.picture, moves: typeof e.moves === 'string' ? e.moves.slice(0, 200) : undefined, source: /^https:\/\/[\w.-]+\/[\w\-./%]*$/.test(e.source || '') ? e.source : undefined, s: [sc.recognisable, sc.small_sizes, sc.solid, sc.consistency, sc.distinct] };
}).filter((e) => e.result === 'rejected' || names[e.id]);
const data = { version: pkg.version, grid: GRID, sizes: SIZES, concepts, standards, feed };
const tpl = readFileSync('site/index.html', 'utf8');
const html = tpl.replace('/*__BUNDLE__*/', () => bundle.replace(/<\/script/gi, '<\\/script')).replace('/*__DATA__*/null', () => JSON.stringify(data).replace(/</g, '\\u003c')).replace(/__VERSION__/g, pkg.version);
if (existsSync('site/og.png')) cpSync('site/og.png', join(out, 'og.png'));
writeFileSync(join(out, 'index.html'), html);
// Brand marks: a second page, with its own small bundle (src/marks).
const marksBundle = (await build({ entryPoints: ['src/marks/browser.mjs'], bundle: true, minify: true, format: 'iife', globalName: 'MK', write: false, platform: 'browser', target: 'es2020' })).outputFiles[0].text;
mkdirSync(join(out, 'marks'), { recursive: true });
writeFileSync(join(out, 'marks', 'index.html'), readFileSync('site/marks.html', 'utf8').replace('/*__BUNDLE__*/', () => marksBundle.replace(/<\/script/gi, '<\\/script')).replace(/__VERSION__/g, pkg.version));
writeFileSync(join(out, 'index.json'), JSON.stringify(index, null, 2));
writeFileSync(join(out, 'standards.json'), JSON.stringify(standards.map((x) => ({ id: x.id, name: x.name, fullName: x.fullName, version: x.version, levels: x.levels, codes: x.codes, credit: x.credit || undefined })), null, 2));
console.log(`dist/index.html ${(html.length / 1024).toFixed(0)} KB, ${concepts.length} concepts`);
