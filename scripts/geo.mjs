// Geography: country outlines, region maps (UN M49) and flags.
// Outlines are generated from Natural Earth (via world-atlas, public domain), simplified per size.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { geoMercator, geoConicEqualArea, geoArea, geoCentroid, geoBounds, geoStream } from 'd3-geo';
import { feature, merge } from 'topojson-client';
import { unM49 } from 'un-m49';
import { GRID, SIZES } from './lib/kit.mjs';
import { FLAGS } from '../src/geo/flags.mjs';

const require = createRequire(import.meta.url);
const topo = require('world-atlas/countries-50m.json');
const geoms = topo.objects.countries.geometries;

const r2 = (v) => +v.toFixed(2);

// ---------- M49 helpers ----------
const byCode = new Map(unM49.map((x) => [x.code, x]));
function memberCodes(region) {
  const out = [];
  const walk = (c) => unM49.filter((x) => x.parent === c).forEach((x) => (x.type === 4 ? out.push(x.code) : walk(x.code)));
  walk(region);
  return out;
}

// ---------- geometry helpers ----------
function polygonsOf(f) {
  const g = f.geometry;
  return g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
}
// Keep the main landmass cluster: polygons near the largest one (drops e.g. Alaska, Hawaii, French Guiana).
function mainCluster(f, factor = 0.6) {
  const polys = polygonsOf(f).map((c) => ({ c, f: { type: 'Feature', geometry: { type: 'Polygon', coordinates: c } } }));
  polys.forEach((p) => { p.area = geoArea(p.f); p.cen = geoCentroid(p.f); });
  const big = polys.reduce((a, b) => (b.area > a.area ? b : a));
  const [[x0, y0], [x1, y1]] = geoBounds(big.f);
  const reach = Math.max(x1 - x0, y1 - y0) * factor + 2;
  const keep = polys.filter((p) => p.area >= big.area * 0.004 && Math.hypot(p.cen[0] - big.cen[0], p.cen[1] - big.cen[1]) <= reach);
  return { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: keep.map((p) => p.c) } };
}
// Douglas–Peucker on a closed ring of [x,y] px.
function simplify(pts, tol) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2));
      const d = Math.hypot(px - ax - t * dx, py - ay - t * dy);
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const ringArea = (pts) => Math.abs(pts.reduce((s, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x * y2 - x2 * y; }, 0) / 2);

// Drop polygons too small to matter (by area relative to the largest) before fitting the frame.
function dropSpecks(f, frac = 0.004) {
  const polys = polygonsOf(f).map((c) => ({ c, a: geoArea({ type: 'Feature', geometry: { type: 'Polygon', coordinates: c } }) }));
  const max = Math.max(...polys.map((p) => p.a));
  return { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: polys.filter((p) => p.a >= max * frac).map((p) => p.c) } };
}

// Project + clip a feature through d3's stream (handles antimeridian and clip boxes), collect rings in px.
function projectRings(f, proj) {
  const rings = []; let cur = null;
  const sink = {
    point(x, y) { cur && cur.push([x, y]); }, lineStart() { cur = []; }, lineEnd() { if (cur && cur.length > 2) rings.push(cur); cur = null; },
    polygonStart() {}, polygonEnd() {}, sphere() {},
  };
  geoStream(f, proj.stream(sink));
  return rings;
}

// Project a feature into one size's live area and return path d.
function mapPath(f, size, { clip, projection } = {}) {
  const { pad, stroke } = GRID[size];
  const inset = pad + stroke / 2;
  const proj = projection === 'conic-europe' ? geoConicEqualArea().parallels([40, 65]).rotate([-12, 0]) : geoMercator();
  const box = [[inset, inset], [size - inset, size - inset]];
  if (clip) {
    const rect = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[clip[0], clip[1]], [clip[0], clip[3]], [clip[2], clip[3]], [clip[2], clip[1]], [clip[0], clip[1]]]] } };
    proj.fitExtent(box, rect).clipExtent(box);
  } else proj.fitExtent(box, f);
  const minArea = Math.max(1.2, (stroke * 1.6) ** 2);
  const rings = projectRings(f, proj).filter((r) => ringArea(r) >= minArea);
  let tol = { 16: 0.45, 20: 0.45, 24: 0.4, 32: 0.4, 48: 0.4 }[size], d;
  for (let attempt = 0; attempt < 8; attempt++) {
    const simp = rings.map((r) => simplify([...r, r[0]], tol).slice(0, -1)).filter((r) => r.length >= 3 && ringArea(r) >= minArea * 0.6);
    const count = simp.reduce((s, r) => s + r.length, 0);
    d = simp.map((r) => 'M' + r.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L') + 'Z').join('');
    if (count <= 220) break;
    tol *= 1.35;
  }
  return d;
}

function svgMap(size, style, d) {
  const { stroke } = GRID[size];
  const common = `xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"`;
  return style === 'outline'
    ? `<svg ${common} fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="li li-outline"><path d="${d}"/></svg>\n`
    : `<svg ${common} fill="currentColor" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="li li-solid"><path d="${d}" fill-rule="evenodd"/></svg>\n`;
}

// ---------- pilot lists ----------
export const COUNTRIES = [
  { iso2: 'us', m49: '840', name: 'United States' },
  { iso2: 'jp', m49: '392', name: 'Japan' },
  { iso2: 'de', m49: '276', name: 'Germany' },
  { iso2: 'fr', m49: '250', name: 'France' },
  { iso2: 'br', m49: '076', name: 'Brazil' },
];
export const REGIONS = [
  { m49: '150', id: 'region-europe', name: 'Europe', clip: [-12, 35, 32, 71.5], omitFromShape: ['643'], projection: 'conic-europe' },
  { m49: '419', id: 'region-latin-america-caribbean', name: 'Latin America & Caribbean' },
  { m49: '202', id: 'region-sub-saharan-africa', name: 'Sub-Saharan Africa' },
];

export function buildGeo(version) {
  const records = [];
  for (const c of COUNTRIES) {
    const g = geoms.find((x) => x.id === c.m49);
    const f = mainCluster(feature(topo, g));
    const id = `country-${c.iso2}`, dir = join('icons', id);
    mkdirSync(dir, { recursive: true });
    for (const size of SIZES) {
      const d = mapPath(f, size);
      for (const style of ['outline', 'solid']) writeFileSync(join(dir, `${style}-${size}.svg`), svgMap(size, style, d));
    }
    records.push({ id, name: c.name, kind: 'country', iso2: c.iso2.toUpperCase(), m49: c.m49, iso3: byCode.get(c.m49)?.iso3166,
      keywords: [c.name, c.iso2.toUpperCase()], metaphor: 'map-outline', reduction: 'Main landmass cluster; islands below a size-based area threshold are dropped.', source: 'Natural Earth 1:50m via world-atlas',
      status: 'active', replacedBy: null, since: version });
  }
  for (const r of REGIONS) {
    const members = new Set(memberCodes(r.m49));
    const gs = geoms.filter((x) => members.has(x.id) && !(r.omitFromShape || []).includes(x.id));
    const f = dropSpecks({ type: 'Feature', geometry: merge(topo, gs) }, r.clip ? 0 : 0.002);
    const dir = join('icons', r.id);
    mkdirSync(dir, { recursive: true });
    for (const size of SIZES) {
      const d = mapPath(f, size, { clip: r.clip, projection: r.projection });
      for (const style of ['outline', 'solid']) writeFileSync(join(dir, `${style}-${size}.svg`), svgMap(size, style, d));
    }
    records.push({ id: r.id, name: r.name, kind: 'region', m49: r.m49, members: [...members].sort(), keywords: [r.name, `M49 ${r.m49}`], metaphor: 'map-outline',
      reduction: 'Union of member countries; small islands dropped by size.' + (r.clip ? ` Clipped to lon ${r.clip[0]}–${r.clip[2]}, lat ${r.clip[1]}–${r.clip[3]}.` : '') + (r.omitFromShape ? ` Omitted from the outline for legibility (still members): ${r.omitFromShape.join(', ')}.` : ''),
      source: 'Natural Earth 1:50m via world-atlas; membership UN M49', status: 'active', replacedBy: null, since: version });
  }
  // Flags
  for (const fl of FLAGS) {
    const dir = join('flags', fl.iso2);
    mkdirSync(dir, { recursive: true });
    for (const size of SIZES) writeFileSync(join(dir, `4x3-${size}.svg`), flagSvg(fl, size));
  }
  return records;
}

// ---------- flags ----------
function flagSvg(fl, size) {
  const { pad, tier } = GRID[size];
  const W = size - 2 * pad, H = W * 0.75, x0 = pad, y0 = (size - H) / 2;
  const r = Math.max(1, r2(W * 0.08));
  const id = `f${fl.iso2}${size}`;
  const body = fl.draw({ x0, y0, W, H, tier, size, r2 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="li li-flag">`
    + `<defs><clipPath id="${id}"><rect x="${r2(x0)}" y="${r2(y0)}" width="${r2(W)}" height="${r2(H)}" rx="${r}"/></clipPath></defs>`
    + `<g clip-path="url(#${id})">${body}</g>`
    + `<rect x="${r2(x0 + 0.5)}" y="${r2(y0 + 0.5)}" width="${r2(W - 1)}" height="${r2(H - 1)}" rx="${r2(r - 0.5)}" fill="none" stroke="currentColor" stroke-opacity="0.12"/></svg>\n`;
}
