// Lists standard codes whose title contains every given word. Usage: node scripts/agents/find-codes.mjs wind power
import { readFileSync, readdirSync } from 'node:fs';
const words = process.argv.slice(2).map((w) => w.toLowerCase());
if (!words.length) { console.log('usage: find-codes.mjs <word> [word…]'); process.exit(0); }
for (const f of readdirSync('data/nodes')) {
  const id = f.replace('.json', ''), map = JSON.parse(readFileSync(`data/mappings/${id}.json`, 'utf8'));
  const hits = JSON.parse(readFileSync(`data/nodes/${f}`, 'utf8')).filter((n) => words.every((w) => n.name.toLowerCase().includes(w)));
  for (const n of hits.slice(0, 25)) console.log(`${id}\t${n.code}\t${n.level}\t${n.name}${map[n.code] ? `\t(already → ${map[n.code]})` : ''}`);
  if (hits.length > 25) console.log(`${id}\t… ${hits.length - 25} more`);
}
