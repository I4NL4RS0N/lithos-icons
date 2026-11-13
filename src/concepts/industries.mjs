// Pilot industries. Metaphors from data/research/<id>.json. Same rules as sectors (SPEC §6).
import { KEY } from '../../scripts/lib/kit.mjs';
import { pick, dropPts, arc, flame, gearPts, quadPts } from '../lib/shapes.mjs';

const R = KEY.radius;

export default [
  {
    id: 'electric-utilities', name: 'Electric Utilities', kind: 'industry', parent: 'utilities', metaphor: 'bolt',
    keywords: ['electricity', 'power', 'electric', 'grid', 'power generation'],
    reduction: 'None — single shape.',
    draw(k) {
      const bolt = k.poly([[0.62, 0], [0.06, 0.6], [0.45, 0.6], [0.38, 1], [0.94, 0.4], [0.55, 0.4]]);
      return { outline: [bolt], solid: [{ d: bolt, fill: true }] };
    },
  },
  {
    id: 'water-utilities', name: 'Water Utilities', kind: 'industry', parent: 'utilities', metaphor: 'tap',
    keywords: ['water', 'water supply', 'wastewater', 'tap', 'faucet'],
    reduction: 'None — tap, handle and drop at all sizes.',
    draw(k) {
      const t = 0.34, b = 0.52; // pipe top/bottom
      const spout = k.path([['M', 0.02, t], ['H', 0.56], ['A', 0.26, 0.26, 0, 0, 1, 0.82, t + 0.26], ['V', 0.62], ['H', 0.64],
        ['V', b + 0.06], ['Q', 0.64, b, 0.58, b], ['H', 0.02], ['Z']]);
      const stem = k.path([['M', 0.36, t], ['V', 0.16]]);
      const handle = k.path([['M', 0.2, 0.12], ['H', 0.52]]);
      const dp = dropPts(0.73, 0.72, 1, 0.2);
      return {
        outline: [spout, stem, handle, k.poly(dp, { snap: false })],
        solid: [{ d: spout, fill: true }, { d: stem, fill: false }, { d: handle, fill: false }, { d: k.poly(dp, { snap: false }), fill: true }],
      };
    },
  },
  {
    id: 'gas-utilities', name: 'Gas Utilities', kind: 'industry', parent: 'utilities', metaphor: 'burner-flame',
    keywords: ['natural gas', 'gas distribution', 'gas', 'LNG', 'burner'],
    reduction: '24+: inner flame. 20+: burner feet.',
    draw(k) {
      const g = k.gapN(), base = 1 - (k.tier >= 1 ? 0.14 : 0), fl = flame(0.24, 0, 0.76, base - g);
      const bar = k.path([['M', 0.04, base], ['H', 0.96]]);
      const feet = k.tier >= 1 ? [k.path([['M', 0.24, base], ['V', 1]]), k.path([['M', 0.76, base], ['V', 1]])] : [];
      return {
        outline: [k.path(fl, { snap: false }), bar, ...feet],
        solid: [{ d: k.path(fl, { snap: false }), fill: true }, { d: bar, fill: false }, ...feet.map((d) => ({ d, fill: false }))],
      };
    },
  },
  {
    id: 'oil-gas', name: 'Oil & Gas', kind: 'industry', parent: 'energy', metaphor: 'pump-jack',
    keywords: ['oil', 'gas', 'drilling', 'exploration', 'production', 'upstream', 'crude', 'pump jack'],
    reduction: '24+: counterweight.',
    draw(k) {
      const ground = k.path([['M', 0, 1], ['H', 1]]);
      const frame = k.poly([[0.24, 1], [0.42, 0.36], [0.6, 1]], { closed: false });
      const beam = k.path([['M', 0.04, 0.48], ['L', 0.78, 0.2]], { snap: false });
      const head = k.path([['M', 0.74, 0.1], ['Q', 0.98, 0.18, 0.88, 0.46]], { snap: false });
      const rod = k.path([['M', 0.88, 0.46], ['V', 1]], { snap: false });
      const cw = k.tier >= 2 ? [k.circle(0.14, 0.62, 0.08)] : [];
      return {
        outline: [ground, frame, beam, head, rod, ...cw],
        solid: [{ d: k.offsetLine([[0.74, 0.1], [0.86, 0.13], [0.93, 0.24], [0.9, 0.4]], k.sw * 0.9), fill: true },
          ...[ground, frame, beam, rod].map((d) => ({ d, fill: false })), ...cw.map((d) => ({ d, fill: true }))],
      };
    },
  },
  {
    id: 'metals-mining', name: 'Metals & Mining', kind: 'industry', parent: 'materials', metaphor: 'pickaxe',
    keywords: ['mining', 'metals', 'gold', 'copper', 'steel', 'aluminum', 'iron ore', 'pickaxe'],
    reduction: 'None — crescent head and handle merged into one silhouette at all sizes.',
    draw(k) {
      const A = [0.34, 0.05], B = [0.95, 0.66];
      const head = [...quadPts(A, [0.91, 0.09], B), ...quadPts(B, k.solid ? [0.8, 0.22] : [0.64, 0.4], A).slice(1, -1)]; // solid: slimmer blade, the baked stroke adds the weight
      const hw = (pick(k, [1.3, 1.5, 1.8, 2.4, 3.6]) + k.sw) / 2;
      const shape = k.bool([k.ring(head), k.fat([[0.17, 0.83], [0.66, 0.34]], hw)]);
      return { outline: [shape], solid: [{ d: shape, fill: true }] };
    },
  },
  {
    id: 'chemicals', name: 'Chemicals', kind: 'industry', parent: 'materials', metaphor: 'flask',
    keywords: ['chemicals', 'specialty chemicals', 'fertilizers', 'petrochemicals', 'lab', 'flask'],
    reduction: '20+: liquid line.',
    draw(k) {
      const body = [['M', 0.38, 0.02], ['V', 0.34], ['L', 0.08, 0.84], ['Q', 0.02, 1, 0.18, 1], ['H', 0.82], ['Q', 0.98, 1, 0.92, 0.84], ['L', 0.62, 0.34], ['V', 0.02]];
      const lip = k.path([['M', 0.28, 0.02], ['H', 0.72]]);
      const ly = 0.64, lx = 0.38 - 0.3 * ((ly - 0.34) / 0.5) + 0.06;
      const liquid = k.tier >= 1 ? [k.path([['M', lx, ly], ['H', 1 - lx]], { snap: false })] : [];
      return {
        outline: [k.path(body), lip, ...liquid],
        solid: [{ d: k.path([...body, ['Z']]) + (k.tier >= 1 ? k.capsule(lx + 0.04, ly, 1 - lx - 0.04, ly, k.holeW(k.sw)) : ''), fill: true }, { d: lip, fill: false }],
      };
    },
  },
  {
    id: 'machinery', name: 'Machinery', kind: 'industry', parent: 'industrials', metaphor: 'gear',
    keywords: ['machinery', 'industrial machinery', 'equipment', 'heavy equipment', 'gear'],
    reduction: '6 broad teeth at 16–20, 8 at 24+.',
    draw(k) {
      const pts = gearPts(0.5, 0.5, 0.5, pick(k, [0.32, 0.34, 0.37, 0.38, 0.39]), pick(k, [6, 6, 8, 8, 8]), pick(k, [0.2, 0.2, 0.17, 0.17, 0.16]), 0.29);
      const hole = pick(k, [0.12, 0.13, 0.14, 0.14, 0.14]);
      const gear = k.poly(pts, { snap: false });
      return { outline: [gear, k.circle(0.5, 0.5, hole)], solid: [{ d: gear + k.circle(0.5, 0.5, hole + k.grow), fill: true }] };
    },
  },
  {
    id: 'aerospace-defense', name: 'Aerospace & Defense', kind: 'industry', parent: 'industrials', metaphor: 'plane',
    keywords: ['aerospace', 'defense', 'aircraft', 'aviation', 'military', 'plane'],
    reduction: 'None — single silhouette.',
    draw(k) {
      const half = [[0.5, 0], [0.56, 0.08], [0.56, 0.36], [0.98, 0.6], [0.98, 0.7], [0.56, 0.56], [0.56, 0.8], [0.72, 0.9], [0.72, 0.98], [0.5, 0.92]];
      const pts = [...half, ...half.slice(1, -1).reverse().map(([x, y]) => [1 - x, y])];
      const plane = k.poly(pts, { snap: false });
      return { outline: [plane], solid: [{ d: plane, fill: true }] };
    },
  },
  {
    id: 'automobiles', name: 'Automobiles', kind: 'industry', parent: 'consumer-discretionary', metaphor: 'car',
    keywords: ['autos', 'cars', 'automakers', 'vehicles', 'EV', 'auto parts'],
    reduction: '24+: window.',
    draw(k) {
      const wr = 0.12, wy = 0.82, g = k.gapN(1.2), cut = wr + g;
      const top = [['M', 0.05, 0.7], ['V', 0.56], ['Q', 0.05, 0.48, 0.12, 0.46], ['L', 0.24, 0.42], ['L', 0.35, 0.22], ['Q', 0.38, 0.16, 0.45, 0.16],
        ['H', 0.64], ['Q', 0.71, 0.16, 0.74, 0.22], ['L', 0.84, 0.42], ['Q', 0.95, 0.46, 0.95, 0.56], ['V', 0.7]];
      const re = Math.min(0.74 + cut, 0.91), le = Math.max(0.26 - cut, 0.09);
      const bodyO = k.path([...top, ['Q', 0.95, 0.74, 0.91, 0.74], ...(re < 0.91 ? [['H', re]] : [])], { snap: false });
      const bodyO2 = k.path([['M', le, 0.74], ['H', 0.09], ['Q', 0.05, 0.74, 0.05, 0.7]], { snap: false });
      const mid = k.path([['M', 0.26 + cut, 0.74], ['H', 0.74 - cut]], { snap: false });
      const wheels = [k.circle(0.26, wy, wr), k.circle(0.74, wy, wr)];
      const win = k.tier >= 2 ? [k.poly([[0.32, 0.42], [0.41, 0.26], [0.62, 0.26], [0.7, 0.42]], { snap: false })] : [];
      const bb = wy - wr - g;
      const bodyS = k.path([...top.slice(0, -1), ['V', bb], ['H', 0.05], ['Z']], { snap: false });
      return {
        outline: [bodyO, bodyO2, mid, ...wheels, ...win],
        solid: [{ d: bodyS + (win.length ? k.offsetPoly([[0.32, 0.42], [0.41, 0.26], [0.62, 0.26], [0.7, 0.42]], k.sw / 2) : ''), fill: true }, ...wheels.map((d) => ({ d, fill: true }))],
      };
    },
  },
  {
    id: 'banks', name: 'Banks', kind: 'industry', parent: 'financials', metaphor: 'bank-building',
    keywords: ['banks', 'banking', 'commercial banks', 'regional banks', 'lending'],
    reduction: 'Columns: 2 at 16, 3 at 20+.',
    draw(k) {
      const n = pick(k, [2, 3, 3, 3, 3]), eave = 0.36;
      const roof = k.poly([[0.02, eave], [0.5, 0.04], [0.98, eave]]);
      const xs = Array.from({ length: n }, (_, i) => 0.2 + (i * 0.6) / (n - 1));
      const colTop = eave + k.gapN(), colBot = 1 - k.gapN();
      const cols = xs.map((x) => k.path([['M', x, colTop], ['V', colBot]]));
      const base = k.path([['M', 0.02, 1], ['H', 0.98]]);
      return {
        outline: [roof, ...cols, base],
        solid: [{ d: roof, fill: true }, ...xs.map((x) => ({ d: k.capsule(x, colTop, x, colBot, k.sw * 0.9), fill: true })), { d: base, fill: false }],
      };
    },
  },
  {
    id: 'insurance', name: 'Insurance', kind: 'industry', parent: 'financials', metaphor: 'umbrella',
    keywords: ['insurance', 'insurers', 'reinsurance', 'life insurance', 'P&C', 'coverage'],
    reduction: 'Scallops: 2 at 16, 3 at 20+.',
    draw(k) {
      const n = pick(k, [2, 3, 3, 3, 3]), base = 0.5, s = 1 / n;
      const canopy = [['M', 0, base], ['A', 0.5, 0.46, 0, 0, 1, 1, base]];
      for (let i = 0; i < n; i++) canopy.push(['A', s / 2, 0.08, 0, 0, 0, 1 - (i + 1) * s, base]);
      canopy.push(['Z']);
      const handle = k.path([['M', 0.5, base + 0.04], ['V', 0.86], ['Q', 0.5, 1, 0.37, 1], ['Q', 0.26, 1, 0.26, 0.9]], { snap: false });
      return {
        outline: [k.path(canopy, { snap: false }), handle],
        solid: [{ d: k.path(canopy, { snap: false }), fill: true }, { d: handle, fill: false }],
      };
    },
  },
  {
    id: 'pharmaceuticals', name: 'Pharmaceuticals', kind: 'industry', parent: 'health-care', metaphor: 'capsule',
    keywords: ['pharma', 'drugs', 'medicine', 'pills', 'prescription', 'generics'],
    reduction: 'None — capsule and divider at all sizes.',
    draw(k) {
      const w = 0.36 * k.L, a = [0.24, 0.76], b = [0.76, 0.24];
      const pill = k.capsule(...a, ...b, w);
      const o = 0.127;
      const div = k.path([['M', 0.5 - o, 0.5 - o], ['L', 0.5 + o, 0.5 + o]], { snap: false });
      return {
        outline: [pill, div],
        solid: [{ d: k.capsule(...a, ...b, w) + k.offsetLine([[0.5 - o + 0.03, 0.5 - o + 0.03], [0.5 + o - 0.03, 0.5 + o - 0.03]], k.sw), fill: true }],
      };
    },
  },
  {
    id: 'biotechnology', name: 'Biotechnology', kind: 'industry', parent: 'health-care', metaphor: 'dna',
    keywords: ['biotech', 'genomics', 'DNA', 'life sciences', 'gene therapy'],
    reduction: '16: one rung. 20+: three rungs.',
    draw(k) {
      const L = 0.26, Rr = 0.74;
      const s1 = k.path([['M', L, 0], ['C', L, 0.25, Rr, 0.25, Rr, 0.5], ['C', Rr, 0.75, L, 0.75, L, 1]], { snap: false });
      const s2 = k.path([['M', Rr, 0], ['C', Rr, 0.25, L, 0.25, L, 0.5], ['C', L, 0.75, Rr, 0.75, Rr, 1]], { snap: false });
      const ry = k.tier >= 1 ? [0.08, 0.5, 0.92] : [0.5];
      const rx = (y) => (y === 0.5 ? [L + 0.08, Rr - 0.08] : [L + 0.1, Rr - 0.1]);
      const rungs = ry.map((y) => { const [a, b] = rx(y); return k.path([['M', a, y], ['H', b]], { snap: false }); });
      return {
        outline: [s1, s2, ...rungs],
        solid: [{ d: s1, fill: false }, { d: s2, fill: false }, ...ry.map((y) => { const [a, b] = rx(y); return { d: k.capsule(a, y, b, y, k.sw * 0.9), fill: true }; })],
      };
    },
  },
  {
    id: 'semiconductors', name: 'Semiconductors', kind: 'industry', parent: 'information-technology', metaphor: 'chip',
    keywords: ['chips', 'semiconductors', 'microchips', 'foundry', 'processors', 'chip shortage'],
    reduction: 'Pins: 2 per side at 16–20, 3 at 24+. 32+: die square.',
    draw(k) {
      const a = 0.2, b = 0.8, n = pick(k, [2, 2, 3, 3, 3]);
      const body = k.rrect(a, a, b, b, 0.08);
      const ps = Array.from({ length: n }, (_, i) => (n === 2 ? [0.38, 0.62][i] : [0.32, 0.5, 0.68][i]));
      const pins = ps.flatMap((p) => [
        k.path([['M', p, 0], ['V', a]]), k.path([['M', p, b], ['V', 1]]), k.path([['M', 0, p], ['H', a]]), k.path([['M', b, p], ['H', 1]]),
      ]);
      const die = k.tier >= 3 ? [k.rrect(0.38, 0.38, 0.62, 0.62, 0.03)] : [];
      return {
        outline: [body, ...pins, ...die],
        solid: [{ d: body + (die.length ? k.offsetPoly([[0.38, 0.38], [0.62, 0.38], [0.62, 0.62], [0.38, 0.62]], k.sw / 2) : ''), fill: true }, ...pins.map((d) => ({ d, fill: false }))],
      };
    },
  },
  {
    id: 'software', name: 'Software', kind: 'industry', parent: 'information-technology', metaphor: 'code-window',
    keywords: ['software', 'SaaS', 'applications', 'cloud', 'code', 'developers'],
    reduction: '20+: title bar. 32+: slash between brackets (outline only).',
    draw(k) {
      const win = k.rrect(0, 0.08, 1, 0.92, R);
      const bar = k.tier >= 1 ? [k.path([['M', 0, 0.32], ['H', 1]])] : [];
      const cy = k.tier >= 1 ? 0.62 : 0.5, h = k.tier >= 1 ? 0.13 : 0.16;
      const lt = [[0.38, cy - h], [0.26, cy], [0.38, cy + h]], gt = [[0.62, cy - h], [0.74, cy], [0.62, cy + h]];
      const sl = k.tier >= 3 ? [[0.55, cy - h - 0.02], [0.45, cy + h + 0.02]] : null;
      const o = [win, ...bar, k.poly(lt, { closed: false, snap: false }), k.poly(gt, { closed: false, snap: false })];
      if (sl) o.push(k.poly(sl, { closed: false, snap: false }));
      // Solid: chevrons only, set wider apart — three knockouts this close merge into a blob.
      const sx = k.tier >= 1 ? [0.35, 0.21] : [0.37, 0.23];
      const holes = [[[sx[0], cy - h], [sx[1], cy], [sx[0], cy + h]], [[1 - sx[0], cy - h], [1 - sx[1], cy], [1 - sx[0], cy + h]]].map((p) => k.offsetLine(p, k.sw * 0.95)).join('');
      const winS = k.tier >= 1 ? k.rrect(0, 0.08, 1, 0.92, R) + k.capsule(0.16, 0.32, 0.84, 0.32, k.holeW(k.sw)) : k.rrect(0, 0.08, 1, 0.92, R);
      return { outline: o, solid: [{ d: winS + holes, fill: true }] };
    },
  },
];
