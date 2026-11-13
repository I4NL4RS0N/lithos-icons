// Top-level sector concepts, drawn to the 7 principles (SPEC §6):
// familiar metaphors, readable at 16, optically balanced on keylines, only
// essential detail, one flat front-on perspective, generous radii, round ends.
// Each draw(k) returns { outline: [d], solid: [{ d, fill }] }.
// k.tier: 0=16 1=20 2=24 3=32 4=48.

import { KEY } from '../../scripts/lib/kit.mjs';

const pick = (k, arr) => arr[k.tier];
const R = KEY.radius;

// Teardrop polygon (apex up, round bottom) for exact knockouts via offsetPoly.
function dropPts(cx, top, bot, w, n = 24) {
  const r = w / 2, cy = bot - r, d = cy - top, a = Math.asin(Math.min(1, r / d));
  // y-down coords: tangent points sit at angle (a - 90°) right and (270° - a) left, swept through the bottom (90°).
  const phiR = a - Math.PI / 2, phiL = 1.5 * Math.PI - a;
  const pts = [[cx, top]];
  for (let i = 0; i <= n; i++) { const p = phiR + ((phiL - phiR) * i) / n; pts.push([cx + r * Math.cos(p), cy + r * Math.sin(p)]); }
  return pts;
}

// Arc from angle a0 to a1 (degrees, y-down, 0 = right) on circle (cx, cy, r) as path commands.
function arc(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 1 : 0;
  return [['M', x0, y0], ['A', r, r, 0, large, sweep, x1, y1]];
}


export default [
  {
    id: 'energy',
    name: 'Energy',
    kind: 'sector',
    metaphor: 'oil-barrel',
    keywords: ['oil', 'gas', 'coal', 'fuel', 'fossil fuels', 'petroleum', 'barrel', 'crude'],
    reduction: '16–20: barrel + two hoops. 24+: hoops move out and a drop sits between them.',
    draw(k) {
      // Barrel: bulged sides, flat rims top and bottom (rims wider than the waist so it can't read as a phone).
      const L0 = 0.2, R0 = 0.8, bulge = 0.08;
      const barrelCmds = [['M', L0, 0.02], ['H', R0], ['Q', R0 + bulge * 2, 0.5, R0, 0.98], ['H', L0], ['Q', L0 - bulge * 2, 0.5, L0, 0.02], ['Z']];
      const body = k.path(barrelCmds, { snap: false });
      const drop = k.tier >= 2;
      const hy = drop ? [0.24, 0.76] : [0.36, 0.64];
      const xAt = (y) => { const t = y - 0.02, u = t / 0.96; const off = 2 * (1 - u) * u * (bulge * 2); return [L0 - off, R0 + off]; };
      const hoops = hy.map((y) => { const [a, b] = xAt(y); return k.path([['M', a, y], ['H', b]], { snap: false }); });
      const dp = dropPts(0.5, 0.36, 0.66, 0.22);
      return {
        outline: [body, ...hoops, ...(drop ? [k.poly(dp, { snap: false })] : [])],
        solid: [{ d: body + hy.map((y) => { const [a, b] = xAt(y); return k.capsule(a + 0.1, y, b - 0.1, y, k.holeW(k.sw)); }).join('') + (drop ? k.offsetPoly(dp, k.sw / 2) : ''), fill: true }],
      };
    },
  },
  {
    id: 'materials',
    name: 'Materials',
    kind: 'sector',
    metaphor: 'mine-cart',
    keywords: ['metals', 'mining', 'chemicals', 'commodities', 'steel', 'ore', 'raw materials'],
    reduction: '16: three-facet ore pile. 20+: five facets.',
    draw(k) {
      const wr = 0.1, wy = 0.9, gap = (k.sw + 1.5) / k.L;
      const top = 0.4, bot = wy - wr - gap;
      const cart = k.poly([[0, top], [1, top], [0.88, bot], [0.12, bot]]);
      const wheels = [k.circle(0.3, wy, wr), k.circle(0.7, wy, wr)];
      const ore = (k.tier >= 1
        ? [[0.1, top], [0.2, 0.2], [0.36, 0.24], [0.5, 0.06], [0.66, 0.18], [0.8, 0.14], [0.9, top]]
        : [[0.14, top], [0.3, 0.16], [0.52, 0.1], [0.72, 0.18], [0.86, top]]).map(([x, y], i) => [i ? 'L' : 'M', x, y]);
      return {
        outline: [cart, ...wheels, k.path(ore, { snap: false })],
        solid: [{ d: cart, fill: true }, { d: k.path([...ore, ['Z']], { snap: false }), fill: true }, ...wheels.map((d) => ({ d, fill: true }))],
      };
    },
  },
  {
    id: 'industrials',
    name: 'Industrials',
    kind: 'sector',
    metaphor: 'factory',
    keywords: ['machinery', 'manufacturing', 'aerospace', 'defense', 'construction', 'engineering', 'factory'],
    reduction: '32+: row of windows.',
    draw(k) {
      const pts = [[0, 1], [0, 0.1], [0.2, 0.1], [0.2, 0.52], [0.47, 0.32], [0.47, 0.52], [0.74, 0.32], [0.74, 0.52], [1, 0.32], [1, 1]];
      const shape = k.poly(pts);
      const win = k.tier >= 3 ? [0.3, 0.5, 0.7].map((x) => [x - 0.05, 0.7, x + 0.05, 0.82]) : [];
      return {
        outline: [shape, ...win.map(([a, b, c, d]) => k.rrect(a, b, c, d, 0.02))],
        solid: [{ d: shape + win.map(([a, b, c, d]) => k.offsetPoly([[a, b], [c, b], [c, d], [a, d]], k.sw / 2)).join(''), fill: true }],
      };
    },
  },
  {
    id: 'consumer-discretionary',
    name: 'Consumer Discretionary',
    kind: 'sector',
    metaphor: 'storefront',
    keywords: ['retail', 'autos', 'apparel', 'leisure', 'hotels', 'restaurants', 'luxury', 'e-commerce', 'shop'],
    reduction: 'Scallops: 3 at 16–24, 4 at 32+. 20+: door.',
    draw(k) {
      const n = pick(k, [3, 3, 3, 4, 4]);
      const s = 1 / n, base = 0.3, low = base + s / 2;
      const awn = [['M', 0, 0.04], ['H', 1], ['V', base]];
      for (let i = 0; i < n; i++) awn.push(['A', s / 2, s / 2, 0, 0, 1, 1 - (i + 1) * s, base]);
      awn.push(['Z']);
      const gap = (k.sw + 1.2) / k.L, wt = low + gap * 0.6;
      const door = k.tier >= 1;
      const walls = k.path([['M', 0.08, wt], ['V', 1], ['H', 0.92], ['V', wt]]);
      const [d0, d1, dt0] = k.tier >= 3 ? [0.34, 0.66, 0.6] : [0.38, 0.62, 0.68];
      const doorP = k.path([['M', d0, 1], ['V', dt0], ['H', d1], ['V', 1]]);
      const g = k.grow, bt = low + gap;
      const body = [[0.08, bt], [0.92, bt], [0.92, 1]];
      if (door) body.push([d1 + g, 1], [d1 + g, dt0 + g], [d0 - g, dt0 + g], [d0 - g, 1]);
      body.push([0.08, 1]);
      return {
        outline: [k.path(awn, { snap: false }), walls, ...(door ? [doorP] : [])],
        solid: [{ d: k.path(awn, { snap: false }), fill: true }, { d: walls, fill: false }, ...(door ? [{ d: k.path([['M', d0, 1], ['V', dt0], ['H', d1], ['V', 1], ['Z']]), fill: true }] : [])],
      };
    },
  },
  {
    id: 'consumer-staples',
    name: 'Consumer Staples',
    kind: 'sector',
    metaphor: 'basket',
    keywords: ['food', 'beverages', 'groceries', 'household products', 'tobacco', 'personal care', 'supermarkets'],
    reduction: '24+: two slats. 48: three. 16–20: plain basket.',
    draw(k) {
      const rimY = 0.42;
      const body = [['M', 0.07, rimY], ['L', 0.16, 0.9], ['Q', 0.18, 1, 0.28, 1], ['H', 0.72], ['Q', 0.82, 1, 0.84, 0.9], ['L', 0.93, rimY]];
      const slats = pick(k, [[], [], [0.4, 0.6], [0.4, 0.6], [0.35, 0.5, 0.65]]);
      const rim = k.path([['M', 0, rimY], ['H', 1]]);
      const handles = [k.path([['M', 0.24, rimY], ['L', 0.4, 0.06]]), k.path([['M', 0.76, rimY], ['L', 0.6, 0.06]])];
      const slatPath = (x) => k.path([['M', x, 0.6], ['V', 0.8]]);
      return {
        outline: [rim, k.path(body), ...handles, ...slats.map(slatPath)],
        solid: [
          { d: k.path([...body, ['Z']]) + slats.map((x) => k.capsule(x, 0.6, x, 0.8, k.holeW(k.sw))).join(''), fill: true },
          { d: rim, fill: false }, ...handles.map((d) => ({ d, fill: false })),
        ],
      };
    },
  },
  {
    id: 'health-care',
    name: 'Health Care',
    kind: 'sector',
    metaphor: 'heart-cross',
    keywords: ['healthcare', 'pharma', 'biotech', 'hospitals', 'medical devices', 'medicine', 'health'],
    reduction: 'None — heart and cross at all sizes.',
    draw(k) {
      const heart = k.path([['M', 0.5, 0.96], ['C', 0.5, 0.96, 0, 0.66, 0, 0.32], ['C', 0, 0.14, 0.14, 0.02, 0.3, 0.02],
        ['C', 0.4, 0.02, 0.47, 0.08, 0.5, 0.14], ['C', 0.53, 0.08, 0.6, 0.02, 0.7, 0.02], ['C', 0.86, 0.02, 1, 0.14, 1, 0.32],
        ['C', 1, 0.66, 0.5, 0.96, 0.5, 0.96], ['Z']], { snap: false });
      const cx = 0.5, cy = 0.44, a = pick(k, [0.14, 0.15, 0.16, 0.17, 0.17]);
      const cross = [k.path([['M', cx - a, cy], ['H', cx + a]]), k.path([['M', cx, cy - a], ['V', cy + a]])];
      const h = 0.0001, plusPts = [[cx - h, cy - a], [cx + h, cy - a], [cx + h, cy - h], [cx + a, cy - h], [cx + a, cy + h], [cx + h, cy + h],
        [cx + h, cy + a], [cx - h, cy + a], [cx - h, cy + h], [cx - a, cy + h], [cx - a, cy - h], [cx - h, cy - h]];
      return { outline: [heart, ...cross], solid: [{ d: heart + k.offsetPoly(plusPts, k.sw), fill: true }] };
    },
  },
  {
    id: 'financials',
    name: 'Financials',
    kind: 'sector',
    metaphor: 'coins',
    keywords: ['banks', 'insurance', 'capital markets', 'finance', 'lending', 'asset management', 'payments', 'money'],
    reduction: 'None — two coins at all sizes.',
    draw(k) {
      // Two coins, front-on: back coin shows as an arc that stops short of the front coin.
      const b = [0.36, 0.36, 0.34], f = [0.63, 0.63, 0.36];
      const gap = (k.sw + 1.5) / k.L, R2 = f[2] + gap;
      const dx = f[0] - b[0], dy = f[1] - b[1], d = Math.hypot(dx, dy);
      const x = (d * d + b[2] * b[2] - R2 * R2) / (2 * d), base = (Math.atan2(dy, dx) * 180) / Math.PI;
      const half = (Math.acos(Math.max(-1, Math.min(1, x / b[2]))) * 180) / Math.PI;
      const back = k.path(arc(b[0], b[1], b[2], base + half, base + 360 - half), { snap: false });
      const front = k.circle(f[0], f[1], f[2]);
      const ring = [];
      const ringHole = '';
      return {
        outline: [back, front, ...ring],
        solid: [{ d: front + ringHole, fill: true }, { d: back, fill: false }],
      };
    },
  },
  {
    id: 'information-technology',
    name: 'Information Technology',
    kind: 'sector',
    metaphor: 'laptop',
    keywords: ['tech', 'software', 'hardware', 'semiconductors', 'IT services', 'computers', 'electronics'],
    reduction: 'None — screen and base at all sizes.',
    draw(k) {
      const screen = k.rrect(0.1, 0.12, 0.9, 0.7, R * 0.8);
      const base = k.path([['M', 0, 0.86], ['H', 1]]);
      return { outline: [screen, base], solid: [{ d: screen, fill: true }, { d: base, fill: false }] };
    },
  },
  {
    id: 'communication-services',
    name: 'Communication Services',
    kind: 'sector',
    metaphor: 'antenna',
    keywords: ['telecom', 'media', 'entertainment', 'advertising', 'social media', 'publishing', 'broadcasting', 'wireless'],
    reduction: '16: one wave each side. 20+: two.',
    draw(k) {
      const cx = 0.5, cy = 0.32, dot = pick(k, [0.08, 0.07, 0.07, 0.065, 0.06]);
      const step = (k.sw + 1.5) / k.L;
      const radii = k.tier === 0 ? [dot + step + 0.04] : [dot + step, dot + step * 2 + 0.04];
      const waves = radii.flatMap((r) => [k.path(arc(cx, cy, r, -40, 40), { snap: false }), k.path(arc(cx, cy, r, 140, 220), { snap: false })]);
      const mast = k.poly([[0.28, 1], [cx, cy + dot + step * 0.6], [0.72, 1]], { closed: false, snap: false });
      const mastS = k.poly([[0.26, 1], [cx, cy + dot + step * 0.4], [0.74, 1]], { snap: false });
      return {
        outline: [k.circle(cx, cy, dot), ...waves, mast],
        solid: [{ d: k.circle(cx, cy, dot * 1.35), fill: true }, { d: mastS, fill: true }, ...waves.map((d) => ({ d, fill: false }))],
      };
    },
  },
  {
    id: 'utilities',
    name: 'Utilities',
    kind: 'sector',
    metaphor: 'drop-bolt',
    keywords: ['electric', 'power', 'water', 'gas utilities', 'renewables', 'grid', 'electricity', 'multi-utilities'],
    reduction: '16–20: bolt as a single zigzag stroke. 24+: closed bolt.',
    draw(k) {
      // Sector combines its industries' symbols: water (drop) + electricity (bolt). See data/research/utilities.json.
      const drop = [['M', 0.5, 0], ['C', 0.62, 0.16, 0.88, 0.44, 0.88, 0.64], ['C', 0.88, 0.86, 0.71, 1, 0.5, 1],
        ['C', 0.29, 1, 0.12, 0.86, 0.12, 0.64], ['C', 0.12, 0.44, 0.38, 0.16, 0.5, 0], ['Z']];
      const bolt = [[0.55, 0.4], [0.37, 0.69], [0.5, 0.69], [0.45, 0.88], [0.63, 0.6], [0.5, 0.6]];
      const zig = k.path([['M', 0.56, 0.42], ['L', 0.4, 0.67], ['H', 0.6], ['L', 0.44, 0.88]], { snap: false });
      // Solid knockout: a bolt that reads at stroke weight, grown by half a stroke so the baked stroke leaves it intact.
      const hole = k.offsetPoly(bolt, k.sw / 2 + k.sw * 0.45);
      return {
        outline: [k.path(drop, { snap: false }), k.tier >= 2 ? k.poly(bolt, { snap: false }) : zig],
        solid: [{ d: k.path(drop, { snap: false }) + hole, fill: true }],
      };
    },
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    kind: 'sector',
    metaphor: 'house',
    keywords: ['property', 'REITs', 'housing', 'real estate development', 'commercial property', 'homes'],
    reduction: '20+: door.',
    draw(k) {
      const door = k.tier >= 1;
      const dw = 0.11;
      const pts = (g = 0) => {
        const p = [[0.5, 0.04], [0.96, 0.44], [0.96, 1]];
        if (door) p.push([0.5 + dw + g, 1], [0.5 + dw + g, 0.66 + g], [0.5 - dw - g, 0.66 + g], [0.5 - dw - g, 1]);
        p.push([0.04, 1], [0.04, 0.44]);
        return p;
      };
      return {
        outline: [k.poly(pts(), { snap: false })],
        solid: [{ d: k.poly(pts(k.grow), { snap: false }), fill: true }],
      };
    },
  },
];
