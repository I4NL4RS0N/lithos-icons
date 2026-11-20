// One-off generator (not part of the build): turns glyphs of open-licensed fonts into outline paths for the brand marks page.
// Usage: FONT_DIR=/tmp/fonts/node_modules node scripts/marks-fonts.mjs   (needs opentype.js and the @fontsource/* packages installed there)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const dir = process.env.FONT_DIR || '/tmp/fonts/node_modules', require = createRequire(dir + '/x.js'), opentype = require('opentype.js');
const FONTS = [
  { id: 'inter', pkg: 'inter', weight: 800, name: 'Inter' },
  { id: 'archivo-black', pkg: 'archivo-black', weight: 400, name: 'Archivo Black' },
  { id: 'bebas-neue', pkg: 'bebas-neue', weight: 400, name: 'Bebas Neue' },
  { id: 'syne', pkg: 'syne', weight: 800, name: 'Syne' },
  { id: 'unbounded', pkg: 'unbounded', weight: 700, name: 'Unbounded' },
  { id: 'playfair-display', pkg: 'playfair-display', weight: 800, name: 'Playfair Display' },
  { id: 'alfa-slab-one', pkg: 'alfa-slab-one', weight: 400, name: 'Alfa Slab One' },
  { id: 'pacifico', pkg: 'pacifico', weight: 400, name: 'Pacifico' },
  { id: 'righteous', pkg: 'righteous', weight: 400, name: 'Righteous' },
  { id: 'orbitron', pkg: 'orbitron', weight: 900, name: 'Orbitron' },
  { id: 'press-start-2p', pkg: 'press-start-2p', weight: 400, name: 'Press Start 2P' },
  { id: 'space-mono', pkg: 'space-mono', weight: 700, name: 'Space Mono' },
  { id: 'fredoka', pkg: 'fredoka', weight: 700, name: 'Fredoka' },
  { id: 'black-ops-one', pkg: 'black-ops-one', weight: 400, name: 'Black Ops One' },
  { id: 'bungee', pkg: 'bungee', weight: 400, name: 'Bungee' },
  { id: 'cinzel', pkg: 'cinzel', weight: 900, name: 'Cinzel' },
  { id: 'permanent-marker', pkg: 'permanent-marker', weight: 400, name: 'Permanent Marker' },
  { id: 'chakra-petch', pkg: 'chakra-petch', weight: 700, name: 'Chakra Petch' },
  { id: 'bowlby-one', pkg: 'bowlby-one', weight: 400, name: 'Bowlby One' },
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
