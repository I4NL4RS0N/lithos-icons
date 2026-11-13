// Builds dist/: a self-contained gallery page (data inlined) plus raw SVGs for direct linking.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { GRID, SIZES } from './lib/kit.mjs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const index = JSON.parse(readFileSync('data/index.json', 'utf8'));
const out = 'dist';
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });
cpSync('icons', join(out, 'icons'), { recursive: true });
cpSync('flags', join(out, 'flags'), { recursive: true });

const concepts = index.map((c) => {
  const svgs = {};
  for (const style of ['outline', 'solid']) for (const s of SIZES) {
    const f = join('icons', c.id, `${style}-${s}.svg`);
    if (existsSync(f)) svgs[`${style}-${s}`] = readFileSync(f, 'utf8').trim();
  }
  const flag = {};
  if (c.kind === 'country') for (const s of SIZES) {
    const f = join('flags', c.iso2.toLowerCase(), `4x3-${s}.svg`);
    if (existsSync(f)) flag[s] = readFileSync(f, 'utf8').trim();
  }
  const rf = join('data/research', `${c.id}.json`);
  const decision = existsSync(rf) ? JSON.parse(readFileSync(rf, 'utf8')).decision : null;
  return { id: c.id, name: c.name, kind: c.kind, parent: c.parent || null, keywords: c.keywords || [], metaphor: c.metaphor,
    reduction: c.reduction, iso2: c.iso2 || null, m49: c.m49 || null, rationale: decision?.rationale || null, svgs, flag };
});
const data = { version: pkg.version, grid: GRID, sizes: SIZES, concepts };
const tpl = readFileSync('site/index.html', 'utf8');
const html = tpl.replace('/*__DATA__*/null', JSON.stringify(data).replace(/</g, '\\u003c')).replace(/__VERSION__/g, pkg.version);
writeFileSync(join(out, 'index.html'), html);
writeFileSync(join(out, 'index.json'), JSON.stringify(index, null, 2));
console.log(`dist/index.html ${(html.length / 1024).toFixed(0)} KB, ${concepts.length} concepts`);
