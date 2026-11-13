import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { kit, svg, SIZES } from './lib/kit.mjs';
import { buildGeo } from './geo.mjs';

const pkg = JSON.parse(await import('node:fs').then((fs) => fs.readFileSync('package.json', 'utf8')));
const files = readdirSync('src/concepts').filter((f) => f.endsWith('.mjs'));
const concepts = (await Promise.all(files.map((f) => import(join(process.cwd(), 'src/concepts', f))))).flatMap((m) => m.default);

const index = [];
for (const c of concepts) {
  const dir = join('icons', c.id);
  mkdirSync(dir, { recursive: true });
  for (const size of SIZES) {
    for (const style of ['outline', 'solid']) {
      const out = c.draw(kit(size, style));
      writeFileSync(join(dir, `${style}-${size}.svg`), svg(size, style, out[style]));
    }
  }
  const { draw, ...meta } = c;
  const record = { ...meta, status: 'active', replacedBy: null, since: pkg.version };
  writeFileSync(join('data/concepts', `${c.id}.json`), JSON.stringify(record, null, 2) + '\n');
  index.push(record);
}
const geo = buildGeo(pkg.version);
for (const r of geo) { writeFileSync(join('data/concepts', `${r.id}.json`), JSON.stringify(r, null, 2) + '\n'); index.push(r); }
writeFileSync('data/index.json', JSON.stringify(index, null, 2) + '\n');
console.log(`built ${concepts.length + geo.length} concepts × ${SIZES.length} sizes × 2 styles = ${(concepts.length + geo.length) * SIZES.length * 2} SVGs + flags`);
