// Flag sheet: each flag at every size, on light and dark.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { SIZES } from './lib/kit.mjs';
import { FLAGS } from '../src/geo/flags.mjs';
const label = 180, cell = 64, rowH = 64, top = 50;
const W = label + SIZES.length * cell * 2 + 30, panelH = top + FLAGS.length * rowH + 10, H = panelH;
let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Helvetica, Arial, sans-serif">`;
[['light', '#fff', '#111', 0], ['dark', '#111214', '#f2f2f2', label + SIZES.length * cell + 30]].forEach(([theme, bg, fg, ox], ti) => {
  const x0 = ti ? ox : 0, w = ti ? W - ox : label + SIZES.length * cell + 30;
  out += `<rect x="${x0}" width="${w}" height="${H}" fill="${bg}"/>`;
  out += `<text x="${ti ? ox + 10 : label}" y="22" font-size="13" font-weight="700" fill="${fg}">flags · ${theme}</text>`;
  SIZES.forEach((s, i) => { const cx = (ti ? ox + 10 : label) + i * cell + cell / 2; out += `<text x="${cx}" y="42" font-size="11" fill="#888" text-anchor="middle">${s}</text>`; });
  FLAGS.forEach((f, r) => {
    const y = top + r * rowH;
    if (!ti) out += `<text x="16" y="${y + 36}" font-size="13" fill="${fg}">${f.name}</text>`;
    SIZES.forEach((s, i) => {
      const src = readFileSync(`flags/${f.iso2}/4x3-${s}.svg`, 'utf8').trim().replace('<svg ', `<svg x="${(ti ? ox + 10 : label) + i * cell + (cell - s) / 2}" y="${y + (rowH - s) / 2}" color="${fg}" `)
        .replace(/id="(f[a-z]+\d+)"/g, `id="$1${theme}"`).replace(/url\(#(f[a-z]+\d+)\)/g, `url(#$1${theme})`);
      out += src;
    });
  });
});
out += '</svg>';
writeFileSync('previews/flags.svg', out);
execFileSync('rsvg-convert', ['-z', '2', '-o', 'previews/flags.png', 'previews/flags.svg']);
console.log('previews/flags.png');
