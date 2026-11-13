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
  for (const n of nodes) if (n.direct) { const c = concepts.find((x) => x.id === n.concept); (c.codes ||= []).push({ scheme: scheme.name, code: n.code, name: n.name }); }
  // The tree is large (NAICS: 2,125 nodes), so it loads on demand; concept ids are indexed to keep the file small.
  const ids = [...new Set(nodes.map((n) => n.concept).filter(Boolean))];
  mkdirSync(join(out, 'std'), { recursive: true });
  writeFileSync(join(out, 'std', `${scheme.id}.json`), JSON.stringify({ ids, nodes: nodes.map((n) => [n.code, n.name, n.parent, n.concept ? ids.indexOf(n.concept) : -1, n.direct ? 1 : 0]) }));
  return { id: scheme.id, name: scheme.name, version: scheme.version, fullName: scheme.fullName, levels: scheme.levels };
}).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
const data = { version: pkg.version, grid: GRID, sizes: SIZES, concepts, standards };
const tpl = readFileSync('site/index.html', 'utf8');
const html = tpl.replace('/*__BUNDLE__*/', () => bundle.replace(/<\/script/gi, '<\\/script')).replace('/*__DATA__*/null', () => JSON.stringify(data).replace(/</g, '\\u003c')).replace(/__VERSION__/g, pkg.version);
if (existsSync('site/og.png')) cpSync('site/og.png', join(out, 'og.png'));
writeFileSync(join(out, 'index.html'), html);
writeFileSync(join(out, 'index.json'), JSON.stringify(index, null, 2));
console.log(`dist/index.html ${(html.length / 1024).toFixed(0)} KB, ${concepts.length} concepts`);
