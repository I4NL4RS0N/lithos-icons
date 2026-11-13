// Roadmap batch 2: visibly distinct children that many standards share (SPEC §9 depth rule).
// Metaphors from data/research/<id>.json.
import { KEY } from '../../scripts/lib/kit.mjs';
import { pick, quadPts } from '../lib/shapes.mjs';

const R = KEY.radius;
const seg = (k, pts) => k.poly(pts, { closed: false, snap: false });
const dot = (k, x, y) => k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false });
const hole = (k, x, y, px = 1.2) => k.circle(x, y, k.holeN(px) / 2);

export default [
  {
    id: 'forestry', name: 'Forestry', kind: 'industry', parent: 'agriculture', metaphor: 'log-pile',
    keywords: ['logging', 'timber', 'lumber', 'wood', 'silviculture', 'forest'],
    reduction: 'Outline 24+: growth ring. Solid 20+: ring as a dot.',
    draw(k) {
      const r = 0.24, c = [[0.5, 0.74 - 0.48 * 0.866], [0.26, 0.74], [0.74, 0.74]], ring = k.tier >= 2;
      // Solid: same footprint as the outline, logs pushed apart just enough to leave a hairline between them.
      const g = pick(k, [0.6, 0.7, 0.8, 1, 1.5]) / k.L, ro = (0.96 + 2 * k.grow - g) / 4, d = 2 * ro + g, by = 0.74 + r + k.grow - ro;
      const cs = [[0.5, by - d * 0.866], [0.5 - d / 2, by], [0.5 + d / 2, by]], hp = pick(k, [0, 1.1, 1.4, 2, 3]);
      return {
        outline: [...c.map(([x, y]) => k.circle(x, y, r)), ...(ring ? c.map(([x, y]) => k.circle(x, y, 0.07)) : [])],
        solid: cs.map(([x, y]) => ({ d: k.circle(x, y, ro - k.grow) + (hp ? hole(k, x, y, hp) : ''), fill: true })),
      };
    },
  },
  {
    id: 'fishing', name: 'Fishing', kind: 'industry', parent: 'agriculture', metaphor: 'fish',
    keywords: ['fisheries', 'aquaculture', 'seafood', 'fish farming', 'trawling'],
    reduction: '20+: eye.',
    draw(k) {
      const body = [...quadPts([0.02, 0.5], [0.36, 0.0], [0.72, 0.5]), ...quadPts([0.72, 0.5], [0.36, 1.0], [0.02, 0.5]).slice(1, -1)];
      const tail = [[0.64, 0.5], [0.97, 0.24], [0.89, 0.5], [0.97, 0.76]];
      const shape = k.bool([k.ring(body), k.ring(tail)]), eye = k.tier >= 1;
      return {
        outline: [shape, ...(eye ? [dot(k, 0.25, 0.44)] : [])],
        solid: [{ d: shape + (eye ? hole(k, 0.25, 0.44, pick(k, [0, 1.2, 1.5, 2, 3])) : ''), fill: true }],
      };
    },
  },
  {
    id: 'livestock', name: 'Livestock', kind: 'industry', parent: 'agriculture', metaphor: 'cow-head',
    keywords: ['cattle', 'animal production', 'ranching', 'dairy', 'poultry', 'hogs', 'meat'],
    reduction: '16: head, horns and ears only. 20+: muzzle line. 24+: eyes. 32+: nostrils.',
    draw(k) {
      const head = k.rrect(0.24, 0.2, 0.76, 0.98, 0.2);
      const horns = [k.path([['M', 0.3, 0.2], ['Q', 0.12, 0.2, 0.14, 0.02]], { snap: false }), k.path([['M', 0.7, 0.2], ['Q', 0.88, 0.2, 0.86, 0.02]], { snap: false })];
      const ears = [seg(k, [[0.24, 0.42], [0.03, 0.36]]), seg(k, [[0.76, 0.42], [0.97, 0.36]])];
      const my = 0.68, muzzle = k.tier >= 1, eyes = k.tier >= 2 ? [[0.39, 0.45], [0.61, 0.45]] : [], nos = k.tier >= 3 ? [[0.41, 0.83], [0.59, 0.83]] : [];
      return {
        outline: [head, ...horns, ...ears, ...(muzzle ? [k.path([['M', 0.24, my], ['H', 0.76]])] : []), ...[...eyes, ...nos].map(([x, y]) => dot(k, x, y))],
        solid: [{ d: head + (muzzle ? k.capsule(0.3, my, 0.7, my, k.holeW(pick(k, [1, 1, 1.2, 1.5, 2]))) : '') + [...eyes, ...nos].map(([x, y]) => hole(k, x, y, pick(k, [0, 0, 1.4, 1.8, 2.6]))).join(''), fill: true },
          ...[...horns, ...ears].map((d) => ({ d, fill: false }))],
      };
    },
  },
  {
    id: 'crops', name: 'Crops', kind: 'industry', parent: 'agriculture', metaphor: 'wheat-ear',
    keywords: ['crop production', 'grain', 'wheat', 'farming', 'harvest', 'cereals', 'oilseeds'],
    reduction: 'Outline: two pairs of kernels at 16–20, three from 24. Solid: two pairs until 48.',
    draw(k) {
      // Kernels lean up and out in a gentle arc from the top two thirds of the stem; the stem is bare below.
      // Solid kernels are plump almonds, which is what separates an ear of wheat from a feather.
      const ys = pick(k, [[0.36, 0.62], [0.36, 0.62], [0.3, 0.48, 0.66], [0.3, 0.48, 0.66], [0.3, 0.48, 0.66]]), dx = pick(k, [0.3, 0.3, 0.27, 0.27, 0.27]), dy = pick(k, [0.27, 0.27, 0.24, 0.24, 0.24]);
      const base = (y) => [0.5, y], tip = (y, s) => [0.5 + s * dx, y - dy];
      const sy = k.tier >= 4 ? ys : [0.36, 0.66]; // solid: two pairs until 48px, so the almonds keep clear gaps
      const arc = (y, s) => quadPts(base(y), [0.5 + s * dx * 0.85, y - dy * 0.1], tip(y, s), 8);
      const almond = (y, s) => [...arc(y, s), ...quadPts(tip(y, s), [0.5 + s * dx * 0.52, y - dy * 0.4], base(y), 8).slice(1, -1)];
      const pairs = (list) => list.flatMap((y) => [[y, -1], [y, 1]]), sides = pairs(ys), stem = k.path([['M', 0.5, 1], ['V', 0.03]]);
      return {
        outline: [stem, ...sides.map(([y, s]) => seg(k, arc(y, s)))],
        solid: [{ d: stem, fill: false }, ...pairs(sy).map(([y, s]) => ({ d: k.poly(almond(y, s), { snap: false }), fill: true }))],
      };
    },
  },
  {
    id: 'apparel', name: 'Apparel', kind: 'industry', parent: 'consumer-discretionary', metaphor: 't-shirt',
    keywords: ['textiles', 'clothing', 'fashion', 'garments', 'luxury goods', 'footwear'],
    reduction: 'None — one silhouette at all sizes.',
    draw(k) {
      const d = k.path([['M', 0.35, 0.05], ['A', 0.15, 0.15, 0, 0, 0, 0.65, 0.05], ['L', 0.98, 0.27], ['L', 0.85, 0.48], ['L', 0.76, 0.42], ['V', 0.96], ['H', 0.24], ['V', 0.42], ['L', 0.15, 0.48], ['L', 0.02, 0.27], ['Z']], { snap: false });
      return { outline: [d], solid: [{ d, fill: true }] };
    },
  },
  {
    id: 'furniture', name: 'Furniture', kind: 'industry', parent: 'consumer-discretionary', metaphor: 'armchair',
    keywords: ['home furnishings', 'household durables', 'sofa', 'chairs', 'fixtures'],
    reduction: '16: no seat line.',
    draw(k) {
      const back = [['M', 0.2, 0.46], ['V', 0.26], ['A', 0.16, 0.16, 0, 0, 1, 0.36, 0.1], ['H', 0.64], ['A', 0.16, 0.16, 0, 0, 1, 0.8, 0.26], ['V', 0.46]];
      const body = k.rrect(0.03, 0.46, 0.97, 0.84, 0.1), legs = [k.path([['M', 0.2, 0.84], ['V', 0.98]]), k.path([['M', 0.8, 0.84], ['V', 0.98]])];
      const seat = k.tier >= 1 ? [[0.26, 0.5], [0.26, 0.66], [0.74, 0.66], [0.74, 0.5]] : null;
      return {
        outline: [k.path(back, { snap: false }), body, ...legs, ...(seat ? [seg(k, seat)] : [])],
        solid: [{ d: k.path([...back, ['Z']], { snap: false }), fill: true }, { d: body + (seat ? k.offsetLine([[0.26, 0.56], [0.26, 0.66], [0.74, 0.66], [0.74, 0.56]], k.holeW(pick(k, [1, 1, 1.2, 1.5, 2])) / 2) : ''), fill: true }, ...legs.map((d) => ({ d, fill: false }))],
      };
    },
  },
  {
    id: 'publishing', name: 'Publishing', kind: 'industry', parent: 'communication-services', metaphor: 'open-book',
    keywords: ['books', 'newspapers', 'printing', 'magazines', 'publishers', 'press'],
    reduction: 'None — two pages and a spine at all sizes.',
    draw(k) {
      const book = k.path([['M', 0.5, 0.24], ['Q', 0.3, 0.08, 0.03, 0.14], ['V', 0.8], ['Q', 0.3, 0.74, 0.5, 0.9], ['Q', 0.7, 0.74, 0.97, 0.8], ['V', 0.14], ['Q', 0.7, 0.08, 0.5, 0.24], ['Z']], { snap: false });
      return {
        outline: [book, k.path([['M', 0.5, 0.24], ['V', 0.9]])],
        solid: [{ d: book + k.capsule(0.5, 0.34, 0.5, 0.78, k.holeW(pick(k, [1, 1, 1.2, 1.5, 2]))), fill: true }],
      };
    },
  },
  {
    id: 'waste-management', name: 'Waste Management', kind: 'industry', parent: 'industrials', metaphor: 'bin',
    keywords: ['waste', 'recycling', 'environmental services', 'sanitation', 'disposal', 'refuse'],
    reduction: '16: one rib. 20+: two ribs.',
    draw(k) {
      const lid = k.path([['M', 0.06, 0.22], ['H', 0.94]]), handle = k.path([['M', 0.36, 0.22], ['V', 0.06], ['H', 0.64], ['V', 0.22]]);
      const by = 0.22, body = [[0.16, by], [0.23, 0.97], [0.77, 0.97], [0.84, by]], xs = k.tier >= 1 ? [0.4, 0.6] : [0.5];
      const sy = by + k.gapN(1), sBody = [[0.16 + 0.006, sy], [0.23, 0.97], [0.77, 0.97], [0.84 - 0.006, sy]];
      return {
        outline: [lid, handle, seg(k, body), ...xs.map((x) => k.path([['M', x, 0.44], ['V', 0.76]]))],
        solid: [{ d: lid, fill: false }, { d: handle, fill: false }, { d: k.poly(sBody, { snap: false }) + xs.map((x) => k.capsule(x, 0.5, x, 0.78, k.holeW(pick(k, [1, 1, 1.2, 1.5, 2])))).join(''), fill: true }],
      };
    },
  },
  {
    id: 'postal-courier', name: 'Postal & Courier', kind: 'industry', parent: 'transportation', metaphor: 'envelope',
    keywords: ['mail', 'post', 'parcels', 'delivery', 'air freight', 'logistics', 'couriers'],
    reduction: 'None — envelope and flap at all sizes.',
    draw(k) {
      const env = k.rrect(0, 0.14, 1, 0.86, R), flap = [[0.06, 0.24], [0.5, 0.58], [0.94, 0.24]];
      return { outline: [env, seg(k, flap)], solid: [{ d: env + k.offsetLine([[0.14, 0.3], [0.5, 0.58], [0.86, 0.3]], k.holeW(pick(k, [1, 1, 1.2, 1.5, 2])) / 2), fill: true }] };
    },
  },
  {
    id: 'legal-services', name: 'Legal Services', kind: 'industry', parent: 'professional-services', metaphor: 'scales',
    keywords: ['law', 'lawyers', 'justice', 'courts', 'compliance', 'litigation', 'regulation'],
    reduction: '16–20: wider, shallower pans. 24+: full pans.',
    draw(k) {
      // Pans hang on strings at every size; small sizes get wider, shallower pans so the triangles stay open.
      const big = k.tier >= 2, by = big ? 0.2 : 0.16, w = big ? 0.17 : 0.2, py = big ? 0.58 : 0.56, depth = big ? w : w * 0.7, cxs = big ? [0.2, 0.8] : [0.22, 0.78];
      const post = k.path([['M', 0.5, 0.04], ['V', 0.96]]), base = k.path([['M', 0.28, 0.96], ['H', 0.72]]), beam = k.path([['M', cxs[0], by], ['H', cxs[1]]]);
      const pan = (cx) => k.path([['M', cx - w, py], ['A', w, depth, 0, 0, 0, cx + w, py], ['Z']], { snap: false });
      const strings = (cx) => seg(k, [[cx - w, py], [cx, by], [cx + w, py]]);
      return {
        outline: [post, base, beam, ...cxs.map(pan), ...cxs.map(strings)],
        solid: [{ d: post, fill: false }, { d: base, fill: false }, { d: beam, fill: false }, ...cxs.map((cx) => ({ d: pan(cx), fill: true })), ...cxs.map((cx) => ({ d: strings(cx), fill: false }))],
      };
    },
  },
  {
    id: 'electrical-equipment', name: 'Electrical Equipment', kind: 'industry', parent: 'industrials', metaphor: 'plug',
    keywords: ['electrical components', 'power equipment', 'cables', 'batteries', 'appliances', 'wiring'],
    reduction: 'None — plug, two prongs and cord at all sizes.',
    draw(k) {
      const body = k.path([['M', 0.2, 0.32], ['H', 0.8], ['V', 0.46], ['A', 0.3, 0.3, 0, 0, 1, 0.2, 0.46], ['Z']], { snap: false });
      const prongs = [k.path([['M', 0.36, 0.32], ['V', 0.04]]), k.path([['M', 0.64, 0.32], ['V', 0.04]])], cord = k.path([['M', 0.5, 0.76], ['V', 0.98]]);
      return { outline: [body, ...prongs, cord], solid: [{ d: body, fill: true }, ...prongs.map((d) => ({ d, fill: false })), { d: cord, fill: false }] };
    },
  },
  {
    id: 'lodging', name: 'Lodging', kind: 'industry', parent: 'accommodation-food', metaphor: 'bed',
    keywords: ['hotels', 'resorts', 'accommodation', 'motels', 'hospitality', 'cruise lines'],
    reduction: '16: pillow as a dot.',
    draw(k) {
      const head = k.path([['M', 0.03, 0.16], ['V', 0.9]]), frame = k.path([['M', 0.03, 0.68], ['H', 0.97], ['V', 0.9]]);
      const blanket = [['M', 0.44, 0.68], ['V', 0.42], ['H', 0.8], ['A', 0.17, 0.17, 0, 0, 1, 0.97, 0.59], ['V', 0.68]];
      const pillow = k.tier >= 1 ? k.rrect(0.14, 0.44, 0.34, 0.6, 0.06) : dot(k, 0.24, 0.5);
      const g = k.gapN(1);
      return {
        outline: [head, frame, k.path(blanket, { snap: false }), pillow],
        solid: [{ d: head, fill: false }, { d: frame, fill: false },
          { d: k.path([['M', 0.44, 0.68 - g], ['V', 0.42], ['H', 0.8], ['A', 0.17, 0.17, 0, 0, 1, 0.97, 0.59], ['V', 0.68 - g], ['Z']], { snap: false }), fill: true },
          k.tier >= 1 ? { d: k.rrect(0.14, 0.44, 0.34, 0.68 - g, 0.06), fill: true } : { d: pillow, fill: false }],
      };
    },
  },
];
