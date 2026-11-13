// Contact sheet: one row per concept, outline then solid at every size.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { SIZES } from './lib/kit.mjs';

const index = JSON.parse(readFileSync('data/index.json', 'utf8'));
const only = process.argv[2] ? process.argv[2].split(',') : null;
const items = index.filter((c) => !only || only.includes(c.id));
const label = 210, cell = 64, gapMid = 24, rowH = 72, top = 70;
const W = label + SIZES.length * cell * 2 + gapMid + 20;
const panelH = top + items.length * rowH + 20;
const H = panelH * 2;
let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif">`;
const colX = (style, i) => label + (style === 'solid' ? SIZES.length * cell + gapMid : 0) + i * cell;
for (const [theme, bg, fg, line, oy] of [['light', '#ffffff', '#111111', '#eeeeee', 0], ['dark', '#111214', '#f2f2f2', '#26282c', panelH]]) {
out += `<rect y="${oy}" width="${W}" height="${panelH}" fill="${bg}"/>`;
for (const style of ['outline', 'solid']) {
  out += `<text x="${colX(style, 0)}" y="${oy + 24}" font-size="13" font-weight="700" fill="${fg}">${style} · ${theme}</text>`;
  SIZES.forEach((s, i) => (out += `<text x="${colX(style, i) + cell / 2}" y="${oy + 52}" font-size="11" fill="#888" text-anchor="middle">${s}</text>`));
}
items.forEach((c, r) => {
  const y = oy + top + r * rowH;
  out += `<text x="16" y="${y + 30}" font-size="13" fill="${fg}">${c.name}</text><text x="16" y="${y + 47}" font-size="10.5" fill="#999">${c.id}</text>`;
  out += `<line x1="16" x2="${W - 16}" y1="${y + rowH - 4}" y2="${y + rowH - 4}" stroke="${line}"/>`;
  for (const style of ['outline', 'solid']) SIZES.forEach((s, i) => {
    const src = readFileSync(`icons/${c.id}/${style}-${s}.svg`, 'utf8').trim()
      .replace('<svg ', `<svg x="${colX(style, i) + (cell - s) / 2}" y="${y + (rowH - 8 - s) / 2}" color="${fg}" `);
    out += src;
  });
});
}
out += '</svg>';
mkdirSync('previews', { recursive: true });
const name = process.argv[3] || 'pilot';
writeFileSync(`previews/${name}.svg`, out);
execFileSync('rsvg-convert', ['-z', '2', '-o', `previews/${name}.png`, `previews/${name}.svg`]);
console.log(`previews/${name}.png`);
