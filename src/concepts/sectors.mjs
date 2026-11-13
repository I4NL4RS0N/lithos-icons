// Pilot batch 1: top-level sector concepts.
// Each draw(k) returns { outline: [d], solid: [{ d, fill }] }.
// k.tier: 0=16 1=20 2=24 3=32 4=48. Detail is added by tier, never by scaling.

const pick = (k, arr) => arr[k.tier];

export default [
  {
    id: 'energy',
    name: 'Energy',
    kind: 'sector',
    metaphor: 'flame',
    keywords: ['oil', 'gas', 'coal', 'fuel', 'fossil fuels', 'petroleum', 'power'],
    reduction: '20+: inner flame. 16: outer flame only.',
    draw(k) {
      const outer = [['M', 0.52, 0], ['C', 0.56, 0.2, 0.86, 0.34, 0.86, 0.64], ['C', 0.86, 0.86, 0.7, 1, 0.5, 1],
        ['C', 0.3, 1, 0.14, 0.86, 0.14, 0.64], ['C', 0.14, 0.5, 0.2, 0.4, 0.3, 0.32],
        ['C', 0.32, 0.44, 0.38, 0.5, 0.44, 0.52], ['C', 0.42, 0.32, 0.46, 0.14, 0.52, 0], ['Z']];
      const inner = (g = 0) => [['M', 0.5, 0.56 - g], ['C', 0.55 + g, 0.64, 0.63 + g, 0.7, 0.63 + g, 0.78],
        ['C', 0.63 + g, 0.85 + g, 0.57, 0.88 + g, 0.5, 0.88 + g], ['C', 0.43, 0.88 + g, 0.37 - g, 0.85 + g, 0.37 - g, 0.78],
        ['C', 0.37 - g, 0.7, 0.45 - g, 0.64, 0.5, 0.56 - g], ['Z']];
      const o = [k.path(outer, { snap: false })];
      if (k.tier >= 1) o.push(k.path(inner(), { snap: false }));
      const s = k.tier >= 2
        ? [{ d: k.path(outer, { snap: false }) + k.path(inner(k.grow * 1.6), { snap: false }), fill: true }]
        : [{ d: k.path(outer, { snap: false }), fill: true }];
      return { outline: o, solid: s };
    },
  },
  {
    id: 'materials',
    name: 'Materials',
    kind: 'sector',
    metaphor: 'ingots',
    keywords: ['metals', 'mining', 'chemicals', 'commodities', 'steel', 'gold', 'raw materials'],
    reduction: '32+: bevel line on each ingot.',
    draw(k) {
      const gap = (k.sw + 1.4) / k.L;
      const rowH = (1 - gap) / 2;
      const w = (1 - gap) / 2;
      const inset = 0.08;
      const bars = [
        [0, w, 1 - rowH, 1],
        [1 - w, 1, 1 - rowH, 1],
        [(1 - w) / 2, (1 + w) / 2, 0.02, 0.02 + rowH],
      ];
      const trap = ([x0, x1, yt, yb]) => k.poly([[x0, yb], [x1, yb], [x1 - inset, yt], [x0 + inset, yt]]);
      const bevel = ([x0, x1, yt, yb]) => {
        const f = 0.34, y = yt + (yb - yt) * f;
        return [x0 + inset * (1 - f) + 0.04, y, x1 - inset * (1 - f) - 0.04, y];
      };
      const o = bars.map(trap);
      if (k.tier >= 3) bars.forEach((b) => { const [a, y, c] = bevel(b); o.push(k.path([['M', a, y], ['H', c]])); });
      const s = bars.map((b) => {
        let d = trap(b);
        if (k.tier >= 3) { const [a, y, c] = bevel(b); d += k.capsule(a, y, c, y, k.holeW(k.sw * 0.8)); }
        return { d, fill: true };
      });
      return { outline: o, solid: s };
    },
  },
  {
    id: 'industrials',
    name: 'Industrials',
    kind: 'sector',
    metaphor: 'gear',
    keywords: ['machinery', 'manufacturing', 'aerospace', 'defense', 'construction', 'engineering', 'transport'],
    reduction: 'Teeth: 6 at 16–20, 8 at 24–32, 10 at 48.',
    draw(k) {
      const N = pick(k, [6, 6, 8, 8, 10]);
      const Ro = 0.5, Ri = pick(k, [0.33, 0.35, 0.37, 0.38, 0.4]);
      const pitch = (2 * Math.PI) / N, ht = pitch * 0.17, hr = pitch * 0.27;
      const pts = [];
      for (let i = 0; i < N; i++) {
        const a = i * pitch - Math.PI / 2;
        for (const [r, da] of [[Ri, -hr], [Ro, -ht], [Ro, ht], [Ri, hr]]) pts.push([0.5 + r * Math.cos(a + da), 0.5 + r * Math.sin(a + da)]);
      }
      const hole = pick(k, [0.13, 0.13, 0.14, 0.15, 0.15]);
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
    reduction: '20+: handle dips into bag. 16: handle stops at rim.',
    draw(k) {
      const rim = 0.32;
      const foot = k.tier >= 1 ? 0.46 : rim;
      const body = k.rrect(0.06, rim, 0.94, 1, pick(k, [0.07, 0.07, 0.08, 0.08, 0.08]));
      const handle = (y) => k.path([['M', 0.32, y], ['V', 0.24], ['A', 0.18, 0.18, 0, 0, 1, 0.68, 0.24], ['V', y]]);
      const s = [{ d: body + (k.tier >= 1 ? k.circle(0.32, foot, k.holeN(k.sw) / 2) + k.circle(0.68, foot, k.holeN(k.sw) / 2) : ''), fill: true },
        { d: handle(rim), fill: false }];
      return { outline: [body, handle(foot)], solid: s };
    },
  },
  {
    id: 'consumer-staples',
    name: 'Consumer Staples',
    kind: 'sector',
    metaphor: 'basket',
    keywords: ['food', 'beverages', 'groceries', 'household products', 'tobacco', 'personal care', 'supermarkets'],
    reduction: 'Slats: 0 at 16, 2 at 20, 3 at 24+.',
    draw(k) {
      const rimY = 0.4;
      const bodyCmds = [['M', 0.06, rimY], ['L', 0.16, 0.93], ['Q', 0.17, 1, 0.24, 1], ['H', 0.76], ['Q', 0.83, 1, 0.84, 0.93], ['L', 0.94, rimY]];
      const slatsX = pick(k, [[], [0.38, 0.62], [0.32, 0.5, 0.68], [0.32, 0.5, 0.68], [0.3, 0.43, 0.57, 0.7]]);
      const rim = k.path([['M', 0, rimY], ['H', 1]]);
      const handles = [k.path([['M', 0.22, rimY], ['L', 0.4, 0.04]]), k.path([['M', 0.78, rimY], ['L', 0.6, 0.04]])];
      const o = [rim, k.path(bodyCmds), ...handles, ...slatsX.map((x) => k.path([['M', x, 0.56], ['V', 0.84]]))];
      const s = [
        { d: k.path([...bodyCmds, ['Z']]) + slatsX.map((x) => k.capsule(x, 0.56, x, 0.84, k.holeW(k.sw))).join(''), fill: true },
        { d: rim, fill: false }, ...handles.map((d) => ({ d, fill: false })),
      ];
      return { outline: o, solid: s };
    },
  },
  {
    id: 'health-care',
    name: 'Health Care',
    kind: 'sector',
    metaphor: 'first-aid-kit',
    keywords: ['healthcare', 'pharma', 'biotech', 'hospitals', 'medical devices', 'medicine', 'health'],
    reduction: 'Cross arms lengthen at 32+.',
    draw(k) {
      const top = 0.24;
      const body = k.rrect(0, top, 1, 1, pick(k, [0.1, 0.1, 0.1, 0.09, 0.08]));
      const handle = k.path([['M', 0.32, top], ['V', 0.1], ['Q', 0.32, 0.03, 0.39, 0.03], ['H', 0.61], ['Q', 0.68, 0.03, 0.68, 0.1], ['V', top]]);
      const cy = 0.62, a = pick(k, [0.16, 0.17, 0.18, 0.2, 0.2]);
      const cross = [k.path([['M', 0.5 - a, cy], ['H', 0.5 + a]]), k.path([['M', 0.5, cy - a], ['V', cy + a]])];
      // Plus-shaped hole (single polygon so evenodd works).
      const h = (k.sw / 2 + k.sw / 2) / k.L, e = a + k.grow;
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
    reduction: 'Columns: 2 at 16, 3 at 20–24, 4 at 32+. 32+: step under columns.',
    draw(k) {
      const n = pick(k, [2, 3, 3, 4, 4]);
      const roof = k.poly([[0, 0.34], [0.5, 0.02], [1, 0.34]]);
      const colBottom = k.tier >= 3 ? 0.8 : 0.86;
      const xs = Array.from({ length: n }, (_, i) => 0.16 + (i * 0.68) / (n - 1));
      const cols = xs.map((x) => k.path([['M', x, 0.46], ['V', colBottom]]));
      const base = k.path([['M', 0, 1], ['H', 1]]);
      const step = k.tier >= 3 ? [k.path([['M', 0.08, 0.9], ['H', 0.92]])] : [];
      const colW = k.sw * 1.7;
      const solidCols = xs.map((x) => ({ d: k.capsule(x, 0.46, x, colBottom, Math.max(0.01, colW - k.sw)), fill: true }));
      return {
        outline: [roof, ...cols, ...step, base],
        solid: [{ d: roof, fill: true }, ...solidCols, ...step.map((d) => ({ d, fill: false })), { d: base, fill: false }],
      };
    },
  },
  {
    id: 'information-technology',
    name: 'Information Technology',
    kind: 'sector',
    metaphor: 'monitor',
    keywords: ['tech', 'software', 'hardware', 'semiconductors', 'IT services', 'computers', 'electronics'],
    reduction: '32+: content lines on screen.',
    draw(k) {
      const screen = k.rrect(0, 0.04, 1, 0.72, pick(k, [0.08, 0.08, 0.08, 0.07, 0.06]));
      const stand = k.path([['M', 0.5, 0.72], ['V', 1]]);
      const base = k.path([['M', 0.28, 1], ['H', 0.72]]);
      const lines = k.tier >= 3 ? [[0.2, 0.28, 0.62], [0.2, 0.46, 0.46]] : [];
      const o = [screen, stand, base, ...lines.map(([x0, y, x1]) => k.path([['M', x0, y], ['H', x1]]))];
      const s = [{ d: screen + lines.map(([x0, y, x1]) => k.capsule(x0, y, x1, y, k.holeW(k.sw))).join(''), fill: true },
        { d: stand, fill: false }, { d: base, fill: false }];
      return { outline: o, solid: s };
    },
  },
  {
    id: 'communication-services',
    name: 'Communication Services',
    kind: 'sector',
    metaphor: 'speech-bubble',
    keywords: ['telecom', 'media', 'entertainment', 'advertising', 'social media', 'publishing', 'broadcasting'],
    reduction: '20+: text lines in bubble.',
    draw(k) {
      const r = 0.14;
      const cmds = [['M', r, 0.04], ['H', 1 - r], ['Q', 1, 0.04, 1, 0.04 + r], ['V', 0.78 - r], ['Q', 1, 0.78, 1 - r, 0.78],
        ['H', 0.42], ['L', 0.2, 0.98], ['V', 0.78], ['H', r], ['Q', 0, 0.78, 0, 0.78 - r], ['V', 0.04 + r], ['Q', 0, 0.04, r, 0.04], ['Z']];
      const bubble = k.path(cmds);
      const lines = k.tier >= 1 ? [[0.26, 0.31, 0.74], [0.26, 0.52, 0.58]] : [];
      return {
        outline: [bubble, ...lines.map(([x0, y, x1]) => k.path([['M', x0, y], ['H', x1]]))],
        solid: [{ d: bubble + lines.map(([x0, y, x1]) => k.capsule(x0, y, x1, y, k.holeW(k.sw))).join(''), fill: true }],
      };
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
      const bolt = k.poly([[0.6, 0], [0.1, 0.58], [0.48, 0.58], [0.4, 1], [0.9, 0.42], [0.52, 0.42]]);
      return { outline: [bolt], solid: [{ d: bolt, fill: true }] };
    },
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    kind: 'sector',
    metaphor: 'house',
    keywords: ['property', 'REITs', 'housing', 'real estate development', 'commercial property', 'homes'],
    reduction: '20+: door. 32+: chimney.',
    draw(k) {
      const roof = k.poly([[0, 0.44], [0.5, 0.04], [1, 0.44]], { closed: false });
      const walls = k.path([['M', 0.12, 0.34], ['V', 1], ['H', 0.88], ['V', 0.34]]);
      const door = k.path([['M', 0.4, 1], ['V', 0.68], ['H', 0.6], ['V', 1]]);
      const chimney = k.path([['M', 0.72, 0.26], ['V', 0.1], ['H', 0.82], ['V', 0.18]]);
      const o = [roof, walls];
      if (k.tier >= 1) o.push(door);
      if (k.tier >= 3) o.push(chimney);
      // Solid: one polygon with the door as a notch, widened so the baked stroke leaves a door-width gap.
      const dh = 0.1 + k.grow, dt = 0.68 + k.grow;
      const pts = [[0, 0.44], [0.5, 0.04], [1, 0.44], [0.88, 0.44], [0.88, 1]];
      if (k.tier >= 1) pts.push([0.5 + dh, 1], [0.5 + dh, dt], [0.5 - dh, dt], [0.5 - dh, 1]);
      pts.push([0.12, 1], [0.12, 0.44]);
      const s = [{ d: k.poly(pts, { snap: false }), fill: true }];
      if (k.tier >= 3) s.push({ d: k.poly([[0.72, 0.26], [0.72, 0.1], [0.82, 0.1], [0.82, 0.18]]), fill: true });
      return { outline: o, solid: s };
    },
  },
];
