// Social preview image (run locally; needs rsvg-convert). Output is committed at site/og.png.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const ids = ['energy', 'materials', 'industrials', 'consumer-discretionary', 'health-care', 'financials', 'information-technology', 'communication-services', 'utilities', 'real-estate', 'banks', 'semiconductors'];
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" font-family="Helvetica, Arial, sans-serif"><rect width="1200" height="630" fill="#fbfbfa"/>`;
s += `<text x="80" y="210" font-size="92" font-weight="700" fill="#111" letter-spacing="-3">Icons for finance.</text>`;
s += `<text x="82" y="270" font-size="30" fill="#74777d">Sectors, industries, credit, countries and regions. MIT.</text>`;
ids.forEach((id, i) => { s += readFileSync(`icons/${id}/outline-48.svg`, 'utf8').trim().replace('<svg ', `<svg x="${80 + i * 88}" y="390" color="#111" `); });
s += `<text x="80" y="560" font-size="26" font-weight="700" fill="#111">Lithos Icons</text><text x="1120" y="560" font-size="24" fill="#a4a7ad" text-anchor="end">icons.lithos.design</text></svg>`;
writeFileSync('.tmp/og.svg', s);
execFileSync('rsvg-convert', ['-o', 'site/og.png', '.tmp/og.svg']);
console.log('site/og.png');
