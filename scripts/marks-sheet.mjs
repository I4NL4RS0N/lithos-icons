// Dev tool: render a contact sheet of geometric seeds (or letters) to HTML. Usage: node scripts/marks-sheet.mjs <from> <count> [letters] > /tmp/sheet.html
import { markSvg, LETTERS, goodSeeds } from '../src/marks/engine.mjs';
const [from = 1, count = 120] = process.argv.slice(2, 4).map(Number), letters = process.argv[4] === 'letters';
const items = letters ? Object.keys(LETTERS).map((ch) => ({ k: 'l', ch, label: ch })) : goodSeeds(from, count).map((seed) => ({ k: 'g', seed, label: seed }));
console.log(`<body style="margin:0;background:#fff;font:11px monospace"><div style="display:grid;grid-template-columns:repeat(12,1fr);gap:10px;padding:14px">${items.map((m) => `<div style="text-align:center">${markSvg(m, { shape: 'square', bgType: 'none', fg: '#111', pad: 6, weight: 14 }, 88)}<div>${m.label}</div></div>`).join('')}</div></body>`);
