// Blocking checks for every icon SVG. Renders each icon at 8x and checks ink stays
// inside the live area (plus half a stroke), plus attribute/structure rules.
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { GRID } from './lib/kit.mjs';

const Z = 8;
mkdirSync('.tmp', { recursive: true });
let errors = 0, checked = 0;
const weights = {}; // style-size -> [{file, cov}]
const fail = (f, m) => { errors++; console.log(`✗ ${f}: ${m}`); };

for (const id of readdirSync('icons')) {
  for (const f of readdirSync(join('icons', id))) {
    const file = join('icons', id, f);
    const m = f.match(/^(outline|solid)-(\d+)\.svg$/);
    if (!m) { fail(file, 'bad filename'); continue; }
    const [, style, sizeS] = m; const size = +sizeS; const g = GRID[size];
    if (!g) { fail(file, 'unknown size'); continue; }
    const src = readFileSync(file, 'utf8');
    checked++;
    if (!src.includes(`viewBox="0 0 ${size} ${size}"`)) fail(file, 'viewBox mismatch');
    if (!src.includes(`stroke-width="${g.stroke}"`)) fail(file, `stroke-width must be ${g.stroke}`);
    if (/transform=|<(rect|circle|line|polyline|polygon|g|use|image|text)\b/.test(src)) fail(file, 'only <path> allowed, no transforms');
    if (/#[0-9a-f]{3,6}|rgb\(/i.test(src)) fail(file, 'colour found; use currentColor');
    if (style === 'outline' && /fill-rule|fill="currentColor"/.test(src.replace(/^<svg[^>]*>/, ''))) fail(file, 'fill inside outline icon');
    if (src.length > 4000) fail(file, `too large (${src.length} bytes)`);
    const nodes = (src.match(/[MLHVCQAZ]/g) || []).length;
    if (nodes > 260) fail(file, `too complex (${nodes} commands)`);

    // Ink bounds check.
    const png = join('.tmp', `${id}-${f}.png`);
    execFileSync('rsvg-convert', ['-z', String(Z), '-o', png, file]);
    const img = PNG.sync.read(readFileSync(png));
    const lim = (g.pad - g.stroke / 2 - 0.3) * Z; // allowed ink margin from canvas edge
    let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, ink = 0;
    for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
      if (img.data[(y * img.width + x) * 4 + 3] > 40) { ink++; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
    }
    const W = img.width;
    // Maps follow real geography, so they're exempt from the weight band (SPEC §6).
    if (!/^(country|region)-/.test(id)) (weights[`${style}-${size}`] ||= []).push({ file, cov: ink / (W * W) });
    if (!ink) fail(file, 'empty');
    else if (minX < lim || minY < lim || maxX > W - 1 - lim || maxY > W - 1 - lim) fail(file, `ink outside live area (${[minX, minY, maxX, maxY].map((v) => (v / Z).toFixed(1))})`);
  }
}
// Squint test: flag icons whose ink coverage is far from the median for their style and size.
let warns = 0;
for (const [k, list] of Object.entries(weights)) {
  const sorted = list.map((x) => x.cov).sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)];
  const [lo, hi] = k.startsWith('outline') ? [0.6, 1.5] : [0.55, 1.45];
  for (const { file, cov } of list) if (cov < med * lo || cov > med * hi) { warns++; console.log(`! ${file}: weight ${(cov / med).toFixed(2)}× median`); }
}
console.log(`${checked} icons checked, ${errors} errors, ${warns} weight warnings`);
process.exit(errors ? 1 : 0);
