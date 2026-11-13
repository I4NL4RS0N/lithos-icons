// Geography: country outlines, UN M49 region maps and flags.
// Outlines are generated from Natural Earth 1:50m (via world-atlas, public domain) and simplified per size.
// Names come from CLDR (Intl.DisplayNames); codes from ISO 3166-1 and UN M49.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { geoAzimuthalEqualArea, geoConicEqualArea, geoEqualEarth, geoArea, geoCentroid, geoStream } from 'd3-geo';
import { feature, merge } from 'topojson-client';
import { unM49 } from 'un-m49';
import { GRID, SIZES } from './lib/kit.mjs';
import { FLAGS } from '../src/geo/flags.mjs';

const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const iso = require('i18n-iso-countries');
const geoms = topo.objects.countries.geometries;
const FLAG_SRC = join(dirname(require.resolve('flag-icons/package.json')), 'flags', '4x3'); // MIT, see THIRD-PARTY.md
const regionName = new Intl.DisplayNames(['en'], { type: 'region' });
const byCode = new Map(unM49.map((x) => [x.code, x]));
const r2 = (v) => +v.toFixed(2);
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- what to build ----------
const SKIP_COUNTRIES = new Set(['010']); // Antarctica: needs its own polar treatment
// Largest allowed gap (degrees) between a country's main landmass and the pieces drawn with it.
// Default keeps archipelagos and nearby islands, drops distant territories (Alaska, Hawaii, French Guiana, Canaries).
// The gap scales with the main landmass (so Fiji drops Rotuma) and is capped at MAX_GAP.
const MIN_GAP = 2, MAX_GAP = 5.8;
const GAP = { '578': 3 /* Norway without Svalbard */ };
const REGION_GAP = 12; // regions: drop overseas territories (French Guiana from Western Europe) but keep the continent together
// Permanent IDs/names for regions that shipped in the pilot.
const REGION_ID = { '150': 'region-europe', '419': 'region-latin-america-caribbean', '202': 'region-sub-saharan-africa' };
const REGION_NAME = { '419': 'Latin America & Caribbean' };
const REGION_OPTS = { '150': { clip: [-12, 35, 32, 71.5], omitFromShape: ['643'], projection: 'conic-europe' }, '001': { projection: 'equal-earth' } };

function memberCodes(region) {
  const out = [];
  const walk = (c) => unM49.filter((x) => x.parent === c).forEach((x) => (x.type === 4 ? out.push(x.code) : walk(x.code)));
  walk(region);
  return out;
}
function regionOrder() { // depth-first, so children follow their parent
  const out = [];
  const walk = (c) => { const n = byCode.get(c); if (n.type <= 3) { out.push(n); unM49.filter((x) => x.parent === c && x.type <= 3).sort((a, b) => a.name.localeCompare(b.name)).forEach((x) => walk(x.code)); } };
  walk('001');
  return out;
}

// ---------- geometry helpers ----------
const polygonsOf = (f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
const polyFeature = (c) => ({ type: 'Feature', geometry: { type: 'Polygon', coordinates: c } });
const multi = (cs) => ({ type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: cs } });
function bbox(c) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of c[0]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; }
function bboxGap(a, b) { // degrees; longitude gap wraps the antimeridian and shrinks with latitude
  const dy = Math.max(0, a[1] - b[3], b[1] - a[3]);
  const lon = (s) => Math.max(0, a[0] + s - b[2], b[0] - (a[2] + s));
  const dx = Math.min(lon(0), lon(360), lon(-360)) * Math.cos((((a[1] + a[3] + b[1] + b[3]) / 4) * Math.PI) / 180);
  return Math.hypot(dx, dy);
}
// Main landmass plus everything chained to it within maxGap degrees.
function mainCluster(f, maxGap, minFrac = 0.0002) {
  const polys = polygonsOf(f).map((c) => ({ c, area: geoArea(polyFeature(c)), bb: bbox(c) })).sort((a, b) => b.area - a.area);
  if (maxGap == null) { const b = polys[0].bb; maxGap = Math.min(MAX_GAP, Math.max(MIN_GAP, Math.hypot((b[2] - b[0]) * Math.cos((((b[1] + b[3]) / 2) * Math.PI) / 180), b[3] - b[1]))); }
  const cluster = [polys[0]], rest = polys.slice(1).filter((p) => p.area >= polys[0].area * minFrac);
  for (let grew = true; grew;) {
    grew = false;
    for (let i = rest.length - 1; i >= 0; i--) if (cluster.some((q) => bboxGap(rest[i].bb, q.bb) <= maxGap)) { cluster.push(rest.splice(i, 1)[0]); grew = true; }
  }
  return multi(cluster.map((p) => p.c));
}
function dropSpecks(f, frac) {
  const polys = polygonsOf(f).map((c) => ({ c, a: geoArea(polyFeature(c)) }));
  const max = Math.max(...polys.map((p) => p.a));
  return multi(polys.filter((p) => p.a >= max * frac).map((p) => p.c));
}
function simplify(pts, tol) { // Douglas–Peucker
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i], t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2));
      const d = Math.hypot(px - ax - t * dx, py - ay - t * dy);
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const ringArea = (pts) => Math.abs(pts.reduce((s, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x * y2 - x2 * y; }, 0) / 2);
function projectRings(f, proj) {
  const rings = []; let cur = null;
  geoStream(f, proj.stream({ point(x, y) { cur && cur.push([x, y]); }, lineStart() { cur = []; }, lineEnd() { if (cur && cur.length > 2) rings.push(cur); cur = null; }, polygonStart() {}, polygonEnd() {}, sphere() {} }));
  return rings;
}

// Project a feature into one size's live area. Returns { d, dots } where dots counts islands drawn as dots.
function mapPath(f, size, { clip, projection } = {}) {
  const { pad, stroke } = GRID[size];
  const inset = pad + stroke / 2, box = [[inset, inset], [size - inset, size - inset]];
  let proj;
  if (projection === 'conic-europe') proj = geoConicEqualArea().parallels([40, 65]).rotate([-12, 0]);
  else if (projection === 'equal-earth') proj = geoEqualEarth();
  else { const [lon, lat] = geoCentroid(f); proj = geoAzimuthalEqualArea().rotate([-lon, -lat]); } // true-ish shape, no antimeridian or polar trouble
  if (clip) proj.fitExtent(box, polyFeature([[[clip[0], clip[1]], [clip[0], clip[3]], [clip[2], clip[3]], [clip[2], clip[1]], [clip[0], clip[1]]]])).clipExtent(box);
  else proj.fitExtent(box, f);

  const minArea = Math.max(1.2, (stroke * 1.1) ** 2);
  const all = projectRings(f, proj), rings = all.filter((r) => ringArea(r) >= minArea), small = all.filter((r) => ringArea(r) < minArea);
  let tol = 0.42, d = '';
  for (let attempt = 0; attempt < 8; attempt++) {
    const simp = rings.map((r) => simplify([...r, r[0]], tol).slice(0, -1)).filter((r) => r.length >= 3 && ringArea(r) >= minArea * 0.6);
    d = simp.map((r) => 'M' + r.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L') + 'Z').join('');
    if (simp.reduce((s, r) => s + r.length, 0) <= 220) break;
    tol *= 1.35;
  }
  // Archipelagos: when little or nothing survives as an outline, draw the lost islands as dots.
  let dots = 0;
  const keptArea = rings.reduce((s, r) => s + ringArea(r), 0), boxArea = (size - 2 * inset) ** 2;
  if (small.length && keptArea < boxArea * 0.08) {
    const cell = stroke * 2.2, seen = new Set();
    for (const r of small.sort((a, b) => ringArea(b) - ringArea(a))) {
      const cx = r.reduce((s, p) => s + p[0], 0) / r.length, cy = r.reduce((s, p) => s + p[1], 0) / r.length;
      const key = `${Math.round(cx / cell)},${Math.round(cy / cell)}`;
      if (seen.has(key) || seen.size >= 14) continue;
      seen.add(key); d += `M${r2(Math.min(size - inset, Math.max(inset, cx)))} ${r2(Math.min(size - inset, Math.max(inset, cy)))}h0.01`; dots++;
    }
  }
  return { d, dots };
}

function svgMap(size, style, d) {
  const { stroke } = GRID[size];
  const common = `xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"`;
  return style === 'outline'
    ? `<svg ${common} fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="li li-outline"><path d="${d}"/></svg>\n`
    : `<svg ${common} fill="currentColor" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="li li-solid"><path d="${d}" fill-rule="evenodd"/></svg>\n`;
}
function writeIcon(id, f, opts) {
  const dir = join('icons', id);
  mkdirSync(dir, { recursive: true });
  let dots = 0;
  for (const size of SIZES) {
    const m = mapPath(f, size, opts); dots = Math.max(dots, m.dots);
    if (!m.d) throw new Error(`empty map for ${id} at ${size}`);
    for (const style of ['outline', 'solid']) writeFileSync(join(dir, `${style}-${size}.svg`), svgMap(size, style, m.d));
  }
  return dots;
}

export function buildGeo(version) {
  const records = [], skipped = [];
  // Countries
  const countries = [];
  const byId = new Map(); // some codes have several geometries (Australia + Ashmore and Cartier Is.): draw them as one country
  for (const g of geoms) {
    if (!g.id) { skipped.push(g.properties.name); continue; } // no ISO code (disputed/unrecognised): handled with worldviews later
    if (SKIP_COUNTRIES.has(g.id)) { skipped.push(g.properties.name); continue; }
    if (byId.has(g.id)) { byId.get(g.id).parts.push(g); continue; }
    const iso2 = iso.numericToAlpha2(g.id);
    const entry = { g, parts: [g], iso2, name: regionName.of(iso2).replace(/ SAR China$/, '') };
    byId.set(g.id, entry); countries.push(entry);
  }
  countries.sort((a, b) => a.name.localeCompare(b.name));
  for (const { g, parts, iso2, name } of countries) {
    const id = `country-${iso2.toLowerCase()}`;
    const dots = writeIcon(id, mainCluster(multi(parts.flatMap((p) => polygonsOf(feature(topo, p)))), GAP[g.id]));
    const un = byCode.get(g.id);
    records.push({ id, name, kind: 'country', iso2, iso3: iso.numericToAlpha3(g.id), m49: g.id,
      keywords: [...new Set([name, g.properties.name, un?.name, iso2, iso.numericToAlpha3(g.id)].filter(Boolean))], metaphor: 'map-outline',
      reduction: 'Main landmass and nearby islands; distant territories and islands too small for the size are dropped.' + (dots ? ' Small islands are drawn as dots.' : ''),
      source: 'Natural Earth 1:50m via world-atlas; names CLDR', status: 'active', replacedBy: null, since: version });
  }
  // Regions (UN M49)
  for (const r of regionOrder()) {
    const o = REGION_OPTS[r.code] || {};
    const members = new Set(memberCodes(r.code));
    const gs = geoms.filter((x) => members.has(x.id) && !SKIP_COUNTRIES.has(x.id) && !(o.omitFromShape || []).includes(x.id));
    if (!gs.length) continue;
    const id = REGION_ID[r.code] || `region-${slug(r.name)}`, name = REGION_NAME[r.code] || r.name;
    let shape = dropSpecks({ type: 'Feature', geometry: merge(topo, gs) }, o.clip ? 0 : 0.002);
    if (!o.clip && !o.projection) { // continental regions: keep the landmass together, drop far-flung territories; island regions keep everything
      const areas = polygonsOf(shape).map((c) => geoArea(polyFeature(c))), total = areas.reduce((a, b) => a + b, 0);
      if (Math.max(...areas) >= total * 0.3) shape = mainCluster(shape, REGION_GAP, 0.002);
    }
    const dots = writeIcon(id, shape, o);
    records.push({ id, name, kind: 'region', m49: r.code, parentM49: r.parent || null, level: r.type, members: [...members].sort(),
      keywords: [...new Set([name, r.name, `M49 ${r.code}`])], metaphor: 'map-outline',
      reduction: 'Union of member countries; small islands dropped by size.' + (dots ? ' Island groups are drawn as dots.' : '')
        + (o.clip ? ` Clipped to lon ${o.clip[0]}–${o.clip[2]}, lat ${o.clip[1]}–${o.clip[3]}.` : '') + (o.omitFromShape ? ` Omitted from the outline for legibility (still members): ${o.omitFromShape.join(', ')}.` : ''),
      source: 'Natural Earth 1:50m via world-atlas; membership UN M49', status: 'active', replacedBy: null, since: version });
  }
  // Flags: our own drawings where we have them (detail reduced by size); otherwise adapted from flag-icons into our frame.
  const own = new Map(FLAGS.map((fl) => [fl.iso2, fl]));
  for (const rec of records.filter((r) => r.kind === 'country')) {
    const iso2 = rec.iso2.toLowerCase(), dir = join('flags', iso2), src = join(FLAG_SRC, `${iso2}.svg`);
    if (!own.has(iso2) && !existsSync(src)) continue;
    mkdirSync(dir, { recursive: true });
    const art = own.has(iso2) ? null : readFileSync(src, 'utf8');
    for (const size of SIZES) writeFileSync(join(dir, `4x3-${size}.svg`), own.has(iso2) ? flagSvg(own.get(iso2), size) : adaptedFlagSvg(iso2, art, size));
    rec.flag = own.has(iso2) ? 'own' : 'flag-icons';
  }
  if (skipped.length) console.log(`geo: skipped ${skipped.join(', ')}`);
  return records;
}

// ---------- flags ----------
// 4:3 frame shared by every flag: rounded clip plus a neutral hairline that shows on light and dark backgrounds.
function flagFrame(iso2, size, body, extraNs = '') {
  const { pad } = GRID[size];
  const W = size - 2 * pad, H = W * 0.75, x0 = pad, y0 = (size - H) / 2;
  const r = Math.max(1, r2(W * 0.08)), id = `f${iso2}${size}`;
  return `<svg xmlns="http://www.w3.org/2000/svg"${extraNs} width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="li li-flag">`
    + `<defs><clipPath id="${id}"><rect x="${r2(x0)}" y="${r2(y0)}" width="${r2(W)}" height="${r2(H)}" rx="${r}"/></clipPath></defs>`
    + `<g clip-path="url(#${id})">${body({ x0, y0, W, H })}</g>`
    + `<rect x="${r2(x0 + 0.5)}" y="${r2(y0 + 0.5)}" width="${r2(W - 1)}" height="${r2(H - 1)}" rx="${r2(r - 0.5)}" fill="none" stroke="#808080" stroke-opacity="0.35"/></svg>\n`;
}
function flagSvg(fl, size) {
  return flagFrame(fl.iso2, size, ({ x0, y0, W, H }) => fl.draw({ x0, y0, W, H, tier: GRID[size].tier, size, r2 }));
}
// Third-party art (640×480) placed inside our frame. The art itself is unchanged.
function adaptedFlagSvg(iso2, src, size) {
  const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/>\s+</g, '><').trim();
  const ns = /xlink:/.test(inner) ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : '';
  return flagFrame(iso2, size, ({ x0, y0, W, H }) => `<svg x="${r2(x0)}" y="${r2(y0)}" width="${r2(W)}" height="${r2(H)}" viewBox="0 0 640 480" preserveAspectRatio="none">${inner}</svg>`, ns);
}
