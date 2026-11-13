// Top-level sector concepts, drawn to the 7 principles (SPEC §6):
// familiar metaphors, readable at 16, optically balanced on keylines, only
// essential detail, one flat front-on perspective, generous radii, round ends.
// Each draw(k) returns { outline: [d], solid: [{ d, fill }] }.
// k.tier: 0=16 1=20 2=24 3=32 4=48.

import { KEY } from '../../scripts/lib/kit.mjs';

const pick = (k, arr) => arr[k.tier];
const R = KEY.radius;

export default [
  {
    id: 'energy',
    name: 'Energy',
    kind: 'sector',
    metaphor: 'flame',
    keywords: ['oil', 'gas', 'coal', 'fuel', 'fossil fuels', 'petroleum', 'power'],
    reduction: '24+: inner flame. 16–20: outer flame only.',
    draw(k) {
      // Round shape: uses the full circle keyline height, narrower width for optical balance.
      const outer = [['M', 0.5, 0], ['C', 0.62, 0.2, 0.86, 0.36, 0.86, 0.64], ['C', 0.86, 0.85, 0.7, 1, 0.5, 1],
        ['C', 0.3, 1, 0.14, 0.85, 0.14, 0.64], ['C', 0.14, 0.48, 0.24, 0.36, 0.33, 0.27],
        ['C', 0.36, 0.38, 0.42, 0.44, 0.47, 0.46], ['C', 0.44, 0.3, 0.45, 0.14, 0.5, 0], ['Z']];
      const inner = (g = 0) => [['M', 0.5, 0.6 - g], ['C', 0.56 + g, 0.68, 0.63 + g, 0.73, 0.63 + g, 0.8],
        ['C', 0.63 + g, 0.87 + g, 0.57, 0.9 + g, 0.5, 0.9 + g], ['C', 0.43, 0.9 + g, 0.37 - g, 0.87 + g, 0.37 - g, 0.8],
        ['C', 0.37 - g, 0.73, 0.44 - g, 0.68, 0.5, 0.6 - g], ['Z']];
      const detail = k.tier >= 2;
      return {
        outline: [k.path(outer, { snap: false }), ...(detail ? [k.path(inner(), { snap: false })] : [])],
        solid: [{ d: k.path(outer, { snap: false }) + (detail ? k.path(inner(k.grow * 1.4), { snap: false }) : ''), fill: true }],
      };
    },
  },
  {
    id: 'materials',
    name: 'Materials',
    kind: 'sector',
    metaphor: 'ingots',
    keywords: ['metals', 'mining', 'chemicals', 'commodities', 'steel', 'gold', 'raw materials'],
    reduction: 'Same three bars at all sizes; gaps scale with stroke.',
    draw(k) {
      // Flat front-on bars (no faux 3D). Gaps always ≥ stroke + 1.5px for readability.
      const gap = (k.sw + 1.5) / k.L;
      const top = 0.06, rowH = (1 - top - gap) / 2, w = (1 - gap) / 2, inset = 0.1;
      const bars = [[0, w, 1 - rowH, 1], [1 - w, 1, 1 - rowH, 1], [(1 - w) / 2, (1 + w) / 2, top, top + rowH]];
      const trap = ([x0, x1, yt, yb]) => k.poly([[x0, yb], [x1, yb], [x1 - inset, yt], [x0 + inset, yt]]);
      return { outline: bars.map(trap), solid: bars.map((b) => ({ d: trap(b), fill: true })) };
    },
  },
  {
    id: 'industrials',
    name: 'Industrials',
    kind: 'sector',
    metaphor: 'gear',
    keywords: ['machinery', 'manufacturing', 'aerospace', 'defense', 'construction', 'engineering', 'transport'],
    reduction: '6 broad teeth at 16–20, 8 at 24+.',
    draw(k) {
      const N = pick(k, [6, 6, 8, 8, 8]);
      const Ro = 0.5, Ri = pick(k, [0.32, 0.34, 0.37, 0.38, 0.39]);
      const pitch = (2 * Math.PI) / N, ht = pitch * pick(k, [0.2, 0.2, 0.17, 0.17, 0.16]), hr = pitch * 0.29;
      const pts = [];
      for (let i = 0; i < N; i++) {
        const a = i * pitch - Math.PI / 2;
        for (const [r, da] of [[Ri, -hr], [Ro, -ht], [Ro, ht], [Ri, hr]]) pts.push([0.5 + r * Math.cos(a + da), 0.5 + r * Math.sin(a + da)]);
      }
      const hole = pick(k, [0.12, 0.13, 0.14, 0.14, 0.14]);
      const gear = k.poly(pts, { snap: false });
      return {
        outline: [gear, k.circle(0.5, 0.5, hole)],
        solid: [{ d: gear + k.circle(0.5, 0.5, hole + k.grow), fill: true }],
      };
    },
  },
  {
    id: 'consumer-discretionary',
    name: 'Consumer Discretionary',
    kind: 'sector',
    metaphor: 'shopping-bag',
    keywords: ['retail', 'autos', 'apparel', 'leisure', 'hotels', 'restaurants', 'luxury', 'e-commerce'],
    reduction: 'None — body and handle at all sizes.',
    draw(k) {
      const [x0, , x1] = KEY.portrait;
      const rim = 0.32;
      const body = k.rrect(x0 - 0.04, rim, x1 + 0.04, 1, R);
      const handle = k.path([['M', 0.33, rim], ['V', 0.2], ['A', 0.17, 0.17, 0, 0, 1, 0.67, 0.2], ['V', rim]]);
      return { outline: [body, handle], solid: [{ d: body, fill: true }, { d: handle, fill: false }] };
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
    metaphor: 'first-aid-kit',
    keywords: ['healthcare', 'pharma', 'biotech', 'hospitals', 'medical devices', 'medicine', 'health'],
    reduction: 'None — kit, handle and cross at all sizes.',
    draw(k) {
      const top = 0.28, bot = 0.94;
      const body = k.rrect(0, top, 1, bot, R);
      const handle = k.path([['M', 0.34, top], ['V', 0.14], ['Q', 0.34, 0.06, 0.42, 0.06], ['H', 0.58], ['Q', 0.66, 0.06, 0.66, 0.14], ['V', top]]);
      const cy = (top + bot) / 2, a = 0.16;
      const cross = [k.path([['M', 0.5 - a, cy], ['H', 0.5 + a]]), k.path([['M', 0.5, cy - a], ['V', cy + a]])];
      const h = k.sw / k.L, e = a + k.grow;
      const plus = k.poly([[0.5 - h, cy - e], [0.5 + h, cy - e], [0.5 + h, cy - h], [0.5 + e, cy - h], [0.5 + e, cy + h], [0.5 + h, cy + h],
        [0.5 + h, cy + e], [0.5 - h, cy + e], [0.5 - h, cy + h], [0.5 - e, cy + h], [0.5 - e, cy - h], [0.5 - h, cy - h]], { snap: false });
      return { outline: [body, handle, ...cross], solid: [{ d: body + plus, fill: true }, { d: handle, fill: false }] };
    },
  },
  {
    id: 'financials',
    name: 'Financials',
    kind: 'sector',
    metaphor: 'bank-building',
    keywords: ['banks', 'insurance', 'capital markets', 'finance', 'lending', 'asset management', 'payments'],
    reduction: 'Columns: 2 at 16, 3 at 20+.',
    draw(k) {
      const n = pick(k, [2, 3, 3, 3, 3]);
      const eave = 0.36;
      const roof = k.poly([[0.02, eave], [0.5, 0.04], [0.98, eave]]);
      const xs = Array.from({ length: n }, (_, i) => 0.2 + (i * 0.6) / (n - 1));
      const colTop = eave + (k.sw + 1.5) / k.L, colBot = 1 - (k.sw + 1.5) / k.L;
      const cols = xs.map((x) => k.path([['M', x, colTop], ['V', colBot]]));
      const base = k.path([['M', 0.02, 1], ['H', 0.98]]);
      return {
        outline: [roof, ...cols, base],
        solid: [{ d: roof, fill: true }, ...xs.map((x) => ({ d: k.capsule(x, colTop, x, colBot, k.sw * 0.9), fill: true })), { d: base, fill: false }],
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
    metaphor: 'speech-bubble',
    keywords: ['telecom', 'media', 'entertainment', 'advertising', 'social media', 'publishing', 'broadcasting'],
    reduction: 'None — single bubble at all sizes.',
    draw(k) {
      const r = 0.22, t = 0.08, b = 0.8;
      const bubble = k.path([['M', r, t], ['H', 1 - r], ['Q', 1, t, 1, t + r], ['V', b - r], ['Q', 1, b, 1 - r, b],
        ['H', 0.44], ['L', 0.24, 0.98], ['V', b], ['H', r], ['Q', 0, b, 0, b - r], ['V', t + r], ['Q', 0, t, r, t], ['Z']]);
      return { outline: [bubble], solid: [{ d: bubble, fill: true }] };
    },
  },
  {
    id: 'utilities',
    name: 'Utilities',
    kind: 'sector',
    metaphor: 'bolt',
    keywords: ['electric', 'power', 'water', 'gas utilities', 'renewables', 'grid', 'electricity'],
    reduction: 'None — single shape at all sizes.',
    draw(k) {
      const bolt = k.poly([[0.62, 0], [0.06, 0.6], [0.45, 0.6], [0.38, 1], [0.94, 0.4], [0.55, 0.4]]);
      return { outline: [bolt], solid: [{ d: bolt, fill: true }] };
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
