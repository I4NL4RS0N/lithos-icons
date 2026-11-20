// One-off generator (not part of the build): turns glyphs of open-licensed fonts into outline paths for the brand marks page.
// Usage: FONT_DIR=/tmp/fonts/node_modules node scripts/marks-fonts.mjs   (needs opentype.js and the @fontsource/* packages installed there)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const dir = process.env.FONT_DIR || '/tmp/fonts/node_modules', require = createRequire(dir + '/x.js'), opentype = require('opentype.js');
const FONTS = [
  { id: 'syne', pkg: 'syne', weight: 800, name: 'Syne' },
  { id: 'unbounded', pkg: 'unbounded', weight: 700, name: 'Unbounded' },
  { id: 'bricolage-grotesque', pkg: 'bricolage-grotesque', weight: 800, name: 'Bricolage Grotesque' },
  { id: 'instrument-serif', pkg: 'instrument-serif', weight: 400, name: 'Instrument Serif' },
  { id: 'fraunces', pkg: 'fraunces', weight: 900, name: 'Fraunces' },
  { id: 'gloock', pkg: 'gloock', weight: 400, name: 'Gloock' },
  { id: 'dela-gothic-one', pkg: 'dela-gothic-one', weight: 400, name: 'Dela Gothic One' },
  { id: 'rubik-mono-one', pkg: 'rubik-mono-one', weight: 400, name: 'Rubik Mono One' },
  { id: 'major-mono-display', pkg: 'major-mono-display', weight: 400, name: 'Major Mono Display' },
  { id: 'monoton', pkg: 'monoton', weight: 400, name: 'Monoton' },
  { id: 'michroma', pkg: 'michroma', weight: 400, name: 'Michroma' },
  { id: 'krona-one', pkg: 'krona-one', weight: 400, name: 'Krona One' },
  { id: 'zen-dots', pkg: 'zen-dots', weight: 400, name: 'Zen Dots' },
  { id: 'tilt-warp', pkg: 'tilt-warp', weight: 400, name: 'Tilt Warp' },
  { id: 'climate-crisis', pkg: 'climate-crisis', weight: 400, name: 'Climate Crisis' },
  { id: 'big-shoulders-display', pkg: 'big-shoulders-display', weight: 900, name: 'Big Shoulders Display' },
  { id: 'silkscreen', pkg: 'silkscreen', weight: 700, name: 'Silkscreen' },
  { id: 'bungee-shade', pkg: 'bungee-shade', weight: 400, name: 'Bungee Shade' },
  { id: 'bagel-fat-one', pkg: 'bagel-fat-one', weight: 400, name: 'Bagel Fat One' },
];
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''), r2 = (v) => +v.toFixed(2);
mkdirSync('src/marks/fonts', { recursive: true });
for (const f of FONTS) {
  const buf = readFileSync(`${dir}/@fontsource/${f.pkg}/files/${f.pkg}-latin-${f.weight}-normal.woff`);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const H = font.getPath('H', 0, 0, 1000).getBoundingBox(), cap = -H.y1, s0 = 68 / cap, glyphs = {};
  for (const ch of CHARS) {
    const p = font.getPath(ch, 0, 0, 1000), b = p.getBoundingBox(), w = (b.x2 - b.x1) * s0;
    const s = w > 68 ? 68 / (b.x2 - b.x1) : s0, ox = 50 - ((b.x1 + b.x2) / 2) * s, oy = w > 68 ? 50 - ((b.y1 + b.y2) / 2) * s : 84;
    const X = (x) => r2(ox + x * s), Y = (y) => r2(oy + y * s);
    glyphs[ch] = p.commands.map((c) => c.type === 'Z' ? 'Z' : c.type === 'M' || c.type === 'L' ? `${c.type}${X(c.x)} ${Y(c.y)}` : c.type === 'Q' ? `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}` : `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`).join('');
  }
  writeFileSync(`src/marks/fonts/${f.id}.json`, JSON.stringify({ id: f.id, name: f.name, glyphs }));
  console.log(f.id, Object.values(glyphs).join('').length, 'bytes');
}
