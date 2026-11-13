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
const data = { version: pkg.version, grid: GRID, sizes: SIZES, concepts };
const tpl = readFileSync('site/index.html', 'utf8');
const html = tpl.replace('/*__BUNDLE__*/', () => bundle.replace(/<\/script/gi, '<\\/script')).replace('/*__DATA__*/null', () => JSON.stringify(data).replace(/</g, '\\u003c')).replace(/__VERSION__/g, pkg.version);
if (existsSync('site/og.png')) cpSync('site/og.png', join(out, 'og.png'));
writeFileSync(join(out, 'index.html'), html);
writeFileSync(join(out, 'index.json'), JSON.stringify(index, null, 2));
console.log(`dist/index.html ${(html.length / 1024).toFixed(0)} KB, ${concepts.length} concepts`);
