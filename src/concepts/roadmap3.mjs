// Roadmap batch 3. Each needed a picture that is not a near-duplicate of an existing one
// (plane, storefront, antenna and pie chart are taken). Metaphors from data/research/<id>.json.
import { pick, quadPts, circlePts } from '../lib/shapes.mjs';

const seg = (k, pts) => k.poly(pts, { closed: false, snap: false });
const hole = (k, x, y, px) => k.circle(x, y, k.holeN(px) / 2);

export default [
  {
    id: 'airlines', name: 'Airlines', kind: 'industry', parent: 'transportation', metaphor: 'plane-takeoff',
    keywords: ['passenger airlines', 'air transport', 'aviation', 'carriers', 'flights', 'airports'],
    reduction: '16: no runway line.',
    draw(k) {
      const hw = 0.085 * k.L, plane = k.bool([
        k.fat([[0.14, 0.62], [0.84, 0.34]], hw),
        k.ring([[0.1, 0.62], [0.05, 0.34], [0.17, 0.34], [0.32, 0.56]]), // tail fin
        k.ring([[0.66, 0.44], [0.34, 0.84], [0.22, 0.84], [0.44, 0.5]]), // near wing
        k.ring([[0.62, 0.42], [0.5, 0.16], [0.4, 0.16], [0.42, 0.48]]), // far wing
      ]);
      const ground = k.tier >= 1 ? [k.path([['M', 0.1, 1], ['H', 0.9]])] : [];
      return { outline: [plane, ...ground], solid: [{ d: plane, fill: true }, ...ground.map((d) => ({ d, fill: false }))] };
    },
  },
  {
    id: 'retail', name: 'Retail', kind: 'industry', parent: 'consumer-discretionary', metaphor: 'shopping-cart',
    keywords: ['retailers', 'stores', 'shops', 'e-commerce', 'specialty retail', 'broadline retail', 'distribution'],
    reduction: 'None — cart and two wheels at all sizes.',
    draw(k) {
      const cart = k.path([['M', 0.02, 0.1], ['H', 0.17], ['L', 0.3, 0.66], ['H', 0.82], ['L', 0.96, 0.27], ['H', 0.21]], { snap: false });
      const wr = pick(k, [0.06, 0.06, 0.07, 0.07, 0.07]), wheels = [[0.38, 0.88], [0.76, 0.88]];
      return {
        outline: [cart, ...wheels.map(([x, y]) => k.circle(x, y, wr))],
        solid: [{ d: k.poly([[0.21, 0.27], [0.96, 0.27], [0.82, 0.66], [0.3, 0.66]], { snap: false }), fill: true }, { d: seg(k, [[0.02, 0.1], [0.17, 0.1], [0.21, 0.27]]), fill: false }, ...wheels.map(([x, y]) => ({ d: k.circle(x, y, wr), fill: true }))],
      };
    },
  },
  {
    id: 'telecom', name: 'Telecom', kind: 'industry', parent: 'communication-services', metaphor: 'handset',
    keywords: ['telecommunications', 'wireless', 'carriers', 'telephone', 'mobile', 'broadband', 'networks'],
    reduction: 'None — one handset silhouette at all sizes.',
    draw(k) {
      const arc = quadPts([0.2, 0.16], [0.16, 0.84], [0.84, 0.8], 20);
      const shape = k.bool([k.fat(arc, 0.085 * k.L), k.fat(arc.slice(0, 5), 0.14 * k.L), k.fat(arc.slice(-5), 0.14 * k.L)]);
      return { outline: [shape], solid: [{ d: shape, fill: true }] };
    },
  },
  {
    id: 'food-beverage', name: 'Food & Beverage', kind: 'industry', parent: 'consumer-staples', metaphor: 'cup-straw',
    keywords: ['food products', 'beverages', 'soft drinks', 'packaged foods', 'brewers', 'restaurants'],
    reduction: '24+: band on the cup.',
    draw(k) {
      const ty = 0.34, cup = [[0.2, ty], [0.28, 0.98], [0.72, 0.98], [0.8, ty]], lid = k.path([['M', 0.1, ty], ['H', 0.9]]), straw = seg(k, [[0.5, ty], [0.5, 0.14], [0.74, 0.03]]);
      const band = k.tier >= 2, by = 0.62, sy = ty + k.gapN(1);
      return {
        outline: [seg(k, cup), lid, straw, ...(band ? [k.path([['M', 0.235, by], ['H', 0.765]])] : [])],
        solid: [{ d: k.poly([[0.2 + 0.01, sy], [0.28, 0.98], [0.72, 0.98], [0.8 - 0.01, sy]], { snap: false }) + (band ? k.capsule(0.34, by, 0.66, by, k.holeW(pick(k, [1, 1, 1.2, 1.5, 2]))) : ''), fill: true }, { d: lid, fill: false }, { d: straw, fill: false }],
      };
    },
  },
  {
    id: 'construction-materials', name: 'Construction Materials', kind: 'industry', parent: 'materials', metaphor: 'brick-wall',
    keywords: ['building materials', 'cement', 'bricks', 'concrete', 'aggregates', 'building products'],
    reduction: '16–20: two courses. 24+: three courses.',
    draw(k) {
      const y0 = 0.12, y1 = 0.88, rows = k.tier >= 2 ? 3 : 2, h = (y1 - y0) / rows;
      const lines = [];
      for (let r = 1; r < rows; r++) lines.push([[0, y0 + r * h], [1, y0 + r * h]]);
      for (let r = 0; r < rows; r++) for (const x of r % 2 ? [0.28, 0.72] : [0.5]) lines.push([[x, y0 + r * h], [x, y0 + (r + 1) * h]]);
      const box = [[0, y0], [1, y0], [1, y1], [0, y1]], cut = k.holeW(pick(k, [0.9, 1, 1.1, 1.4, 2])) / 2;
      const ext = ([a, b]) => (a[1] === b[1] ? [[-0.2, a[1]], [1.2, b[1]]] : [a, b]);
      return {
        outline: [k.poly(box), ...lines.map((l) => k.path([['M', ...l[0]], ['L', ...l[1]]]))],
        solid: [{ d: k.bool([k.ring(box)], lines.map((l) => k.fat(ext(l), cut))), fill: true }],
      };
    },
  },
  {
    id: 'pipelines', name: 'Pipelines', kind: 'industry', parent: 'energy', metaphor: 'pipe-valve',
    keywords: ['midstream', 'oil and gas storage', 'transportation', 'gas transmission', 'valves', 'infrastructure'],
    reduction: 'None — pipe run, two flange collars and a valve at all sizes.',
    draw(k) {
      // One silhouette: a pipe run with two flange collars, so it reads as pipe rather than a grid of lines.
      const pt = 0.54, pb = 0.84, fw = Math.max(0.12, (k.sw + 1.4) / k.L), fx = [0.26, 0.74];
      const rect = (x0, y0, x1, y1) => k.ring([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
      const pipe = k.bool([rect(0, pt, 1, pb), ...fx.map((x) => rect(x - fw / 2, pt - 0.1, x + fw / 2, pb + 0.1))]);
      const stem = k.path([['M', 0.5, pt], ['V', 0.18]]), wheel = k.path([['M', 0.3, 0.14], ['H', 0.7]]);
      return { outline: [pipe, stem, wheel], solid: [{ d: pipe, fill: true }, { d: stem, fill: false }, { d: wheel, fill: false }] };
    },
  },
  {
    id: 'advertising', name: 'Advertising', kind: 'industry', parent: 'communication-services', metaphor: 'megaphone',
    keywords: ['marketing', 'promotion', 'agencies', 'public relations', 'campaigns', 'market research'],
    reduction: '24+: sound mark.',
    draw(k) {
      const cone = [[0.06, 0.4], [0.76, 0.1], [0.76, 0.86], [0.06, 0.56]], grip = [[0.22, 0.63], [0.28, 0.94], [0.42, 0.94], [0.4, 0.71]];
      const wave = k.tier >= 2 ? [k.path([['M', 0.95, 0.36], ['V', 0.6]])] : [];
      return {
        outline: [k.poly(cone, { snap: false }), seg(k, grip), ...wave],
        solid: [{ d: k.poly(cone, { snap: false }), fill: true }, { d: seg(k, grip), fill: false }, ...wave.map((d) => ({ d, fill: false }))],
      };
    },
  },
  {
    id: 'funds', name: 'Funds', kind: 'industry', parent: 'financials', metaphor: 'money-bag',
    keywords: ['mutual funds', 'investment funds', 'ETFs', 'money market funds', 'trusts', 'closed-end funds', 'portfolio'],
    reduction: '16: no coin mark.',
    draw(k) {
      const bag = k.path([['M', 0.37, 0.32], ['C', 0.08, 0.5, 0.0, 0.98, 0.5, 0.98], ['C', 1.0, 0.98, 0.92, 0.5, 0.63, 0.32], ['Z']], { snap: false });
      const top = k.path([['M', 0.37, 0.32], ['L', 0.28, 0.06], ['Q', 0.5, 0.2, 0.72, 0.06], ['L', 0.63, 0.32]], { snap: false });
      const coin = k.tier >= 1;
      return {
        outline: [bag, top, ...(coin ? [k.circle(0.5, 0.68, pick(k, [0, 0.09, 0.1, 0.1, 0.1]))] : [])],
        solid: [{ d: bag + (coin ? hole(k, 0.5, 0.68, pick(k, [0, 1.6, 2.2, 3, 4.5])) : ''), fill: true }, { d: k.path([['M', 0.37, 0.32 - k.gapN(1)], ['L', 0.3, 0.08], ['Q', 0.5, 0.2, 0.7, 0.08], ['L', 0.63, 0.32 - k.gapN(1)], ['Z']], { snap: false }), fill: true }],
      };
    },
  },
];
