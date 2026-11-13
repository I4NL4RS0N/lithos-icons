// Whole-set review sheet: every code-drawn concept in a grid, at one size, outline and solid. Usage: node scripts/sheet.mjs [size] [zoom]
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const size = +(process.argv[2] || 24), zoom = +(process.argv[3] || 2);
const idx = JSON.parse(readFileSync('data/index.json', 'utf8')).filter((c) => !['country', 'region'].includes(c.kind));
const cols = 12, cw = 104, ch = size * zoom * 2 + 56, W = cols * cw, H = Math.ceil(idx.length / cols) * ch + 10;
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Helvetica"><rect width="${W}" height="${H}" fill="#fff"/>`;
idx.forEach((c, i) => {
  const x = (i % cols) * cw, y = Math.floor(i / cols) * ch + 8;
  ['outline', 'solid'].forEach((st, j) => { s += `<g transform="translate(${x + (cw - size * zoom) / 2} ${y + j * (size * zoom + 6)}) scale(${zoom})">` + readFileSync(`icons/${c.id}/${st}-${size}.svg`, 'utf8').trim().replace('<svg ', '<svg color="#111" ') + '</g>'; });
  s += `<text x="${x + cw / 2}" y="${y + size * zoom * 2 + 24}" font-size="9.5" text-anchor="middle" fill="#666">${c.id.slice(0, 20)}</text>`;
});
writeFileSync(`previews/sheet-${size}.svg`, s + '</svg>');
execFileSync('rsvg-convert', ['-o', `previews/sheet-${size}.png`, `previews/sheet-${size}.svg`]);
console.log(`previews/sheet-${size}.png`);
