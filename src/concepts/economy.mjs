// Top-level categories used by government industry standards (NAICS, NACE, SIC) that the market sectors don't cover.
// Metaphors from data/research/<id>.json. Same rules as sectors (SPEC §6).
import { KEY } from '../../scripts/lib/kit.mjs';
import { pick, arc } from '../lib/shapes.mjs';

const R = KEY.radius;
const line = (k, x0, y0, x1, y1) => k.path([['M', x0, y0], ['L', x1, y1]], { snap: false });
// Sample an arc as points (for thick solid versions via offsetLine).
const arcPts = (cx, cy, r, a0, a1, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
const quadPts = (p0, p1, p2, n = 10) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]; });

export default [
  {
    id: 'agriculture', name: 'Agriculture', kind: 'sector', metaphor: 'sprout',
    keywords: ['farming', 'crops', 'forestry', 'fishing', 'livestock', 'agribusiness', 'food production'],
    reduction: '24+: ground line.',
    draw(k) {
      const left = [['M', 0.5, 0.64], ['C', 0.22, 0.64, 0.06, 0.5, 0.06, 0.28], ['C', 0.3, 0.28, 0.5, 0.38, 0.5, 0.64], ['Z']];
      const right = [['M', 0.5, 0.44], ['C', 0.5, 0.2, 0.68, 0.04, 0.94, 0.04], ['C', 0.94, 0.3, 0.8, 0.44, 0.5, 0.44], ['Z']];
      const stem = k.path([['M', 0.5, k.tier >= 2 ? 0.98 : 1], ['V', 0.44]]);
      const ground = k.tier >= 2 ? [k.path([['M', 0.24, 1], ['H', 0.76]])] : [];
      const leaves = [k.path(left, { snap: false }), k.path(right, { snap: false })];
      return { outline: [...leaves, stem, ...ground], solid: [...leaves.map((d) => ({ d, fill: true })), { d: stem, fill: false }, ...ground.map((d) => ({ d, fill: false }))] };
    },
  },
  {
    id: 'construction', name: 'Construction', kind: 'sector', metaphor: 'tower-crane',
    keywords: ['building', 'contractors', 'engineering', 'infrastructure', 'homebuilding', 'crane'],
    reduction: '20+: load on the hook. 32+: counterweight.',
    draw(k) {
      const mx = 0.36, jy = 0.26;
      const mast = line(k, mx, 1, mx, 0.04), base = k.path([['M', 0.14, 1], ['H', 0.58]]), jib = k.path([['M', 0.06, jy], ['H', 0.98]]);
      const tie = line(k, mx, 0.04, 0.84, jy), cable = k.path([['M', 0.8, jy], ['V', k.tier >= 1 ? 0.54 : 0.62]]);
      const load = k.tier >= 1 ? [k.rrect(0.68, 0.54, 0.92, 0.74, 0.03)] : [];
      const cw = k.tier >= 3 ? [k.rrect(0.06, jy, 0.22, jy + 0.14, 0.02)] : [];
      return {
        outline: [mast, base, jib, tie, cable, ...load, ...cw],
        solid: [{ d: k.offsetLine([[mx, 0.9], [mx, 0.13]], k.sw * 0.5), fill: true }, ...[base, jib, tie, cable].map((d) => ({ d, fill: false })), ...[...load, ...cw].map((d) => ({ d, fill: true }))],
      };
    },
  },
  {
    id: 'wholesale-trade', name: 'Wholesale Trade', kind: 'sector', metaphor: 'warehouse',
    keywords: ['wholesale', 'distribution', 'warehouse', 'distributors', 'trading'],
    reduction: 'Door slats: 0 at 16, 1 at 20–24, 2 at 32+.',
    draw(k) {
      const shell = [[0.02, 1], [0.02, 0.4], [0.5, 0.08], [0.98, 0.4], [0.98, 1]];
      const dl = 0.24, dr = 0.76, dt = 0.58, g = k.grow;
      const door = k.path([['M', dl, 1], ['V', dt], ['H', dr], ['V', 1]]);
      const slatY = pick(k, [[], [0.79], [0.79], [0.72, 0.86], [0.72, 0.86]]);
      const slats = slatY.map((y) => k.path([['M', dl, y], ['H', dr]]));
      const solidShape = k.poly([[0.02, 1], [0.02, 0.4], [0.5, 0.08], [0.98, 0.4], [0.98, 1], [dr + g, 1], [dr + g, dt + g], [dl - g, dt + g], [dl - g, 1]], { snap: false });
      const inner = k.gapN(0.6);
      return {
        outline: [k.poly(shell, { snap: false }), door, ...slats],
        solid: [{ d: solidShape, fill: true }, ...slatY.map((y) => ({ d: k.path([['M', dl + inner, y + g * 0.5], ['H', dr - inner]], { snap: false }), fill: false }))],
      };
    },
  },
  {
    id: 'transportation', name: 'Transportation', kind: 'sector', metaphor: 'truck',
    keywords: ['logistics', 'freight', 'shipping', 'trucking', 'airlines', 'railroads', 'warehousing', 'delivery'],
    reduction: '24+: cab window.',
    draw(k) {
      const wl = 0.24, wr = 0.78, wy = 0.84, r = 0.1, g = k.gapN(1.2), cut = r + g, by = 0.76, split = 0.6;
      const box = [['M', Math.max(0.02, wl - cut), by], ...(wl - cut > 0.02 ? [['H', 0.02]] : []), ['V', 0.2], ['H', split], ['V', by], ...(wl + cut < split ? [['H', wl + cut]] : [])];
      const cab = [['M', split, 0.38], ['H', 0.8], ['L', 0.98, 0.56], ['V', by], ...(wr + cut < 0.98 ? [['H', wr + cut]] : [])];
      const mid = wr - cut > split ? [k.path([['M', split, by], ['H', wr - cut]], { snap: false })] : [];
      const wheels = [k.circle(wl, wy, r), k.circle(wr, wy, r)];
      const win = k.tier >= 2 ? [k.path([['M', 0.7, 0.48], ['H', 0.8], ['L', 0.87, 0.56]], { snap: false })] : [];
      const bb = wy - r - g;
      return {
        outline: [k.path(box, { snap: false }), k.path(cab, { snap: false }), ...mid, ...wheels, ...win],
        solid: [{ d: k.poly([[0.02, 0.2], [split - k.gapN(0.4) / 2, 0.2], [split - k.gapN(0.4) / 2, bb], [0.02, bb]], { snap: false }), fill: true },
          { d: k.poly([[split + k.gapN(0.4) / 2, 0.38], [0.8, 0.38], [0.98, 0.56], [0.98, bb], [split + k.gapN(0.4) / 2, bb]], { snap: false }), fill: true }, ...wheels.map((d) => ({ d, fill: true }))],
      };
    },
  },
  {
    id: 'professional-services', name: 'Professional Services', kind: 'sector', metaphor: 'briefcase',
    keywords: ['consulting', 'legal', 'accounting', 'advisory', 'scientific', 'technical services', 'business services'],
    reduction: '20+: strap line.',
    draw(k) {
      const top = 0.3, body = k.rrect(0, top, 1, 0.94, R);
      const handle = k.path([['M', 0.34, top], ['V', 0.16], ['Q', 0.34, 0.08, 0.42, 0.08], ['H', 0.58], ['Q', 0.66, 0.08, 0.66, 0.16], ['V', top]]);
      const sy = 0.58, strap = k.tier >= 1 ? [k.path([['M', 0, sy], ['H', 1]])] : [];
      return {
        outline: [body, handle, ...strap],
        solid: [{ d: body + (strap.length ? k.capsule(0.12, sy, 0.88, sy, k.holeW(k.sw * 0.7)) : ''), fill: true }, { d: handle, fill: false }],
      };
    },
  },
  {
    id: 'administrative-services', name: 'Administrative Services', kind: 'sector', metaphor: 'clipboard-check',
    keywords: ['support services', 'staffing', 'outsourcing', 'facilities', 'office administration', 'waste management'],
    reduction: 'None — board, clip and check at all sizes.',
    draw(k) {
      const board = k.rrect(0.12, 0.12, 0.88, 1, R * 0.8), clip = k.path([['M', 0.36, 0.12], ['V', 0.04], ['H', 0.64], ['V', 0.12]]);
      const check = [[0.33, 0.6], [0.45, 0.72], [0.68, 0.46]];
      return {
        outline: [board, clip, k.poly(check, { closed: false, snap: false })],
        solid: [{ d: board + k.offsetLine(check, k.sw), fill: true }, { d: k.path([['M', 0.36, 0.1], ['V', 0.04], ['H', 0.64], ['V', 0.1]]), fill: false }],
      };
    },
  },
  {
    id: 'education', name: 'Education', kind: 'sector', metaphor: 'graduation-cap',
    keywords: ['schools', 'universities', 'training', 'edtech', 'learning'],
    reduction: '20+: tassel.',
    draw(k) {
      const top = k.poly([[0.5, 0.12], [1, 0.38], [0.5, 0.64], [0, 0.38]], { snap: false });
      const by = 0.5 + k.gapN(0.4) * 0.5;
      const body = k.path([['M', 0.2, by], ['V', 0.72], ['Q', 0.5, 0.94, 0.8, 0.72], ['V', by]], { snap: false });
      const tassel = k.tier >= 1 ? [k.path([['M', 1, 0.38], ['V', 0.68]])] : [];
      return { outline: [top, body, ...tassel], solid: [{ d: top, fill: true }, { d: k.path([['M', 0.2, 0.62], ['V', 0.72], ['Q', 0.5, 0.94, 0.8, 0.72], ['V', 0.62]], { snap: false }), fill: false }, ...tassel.map((d) => ({ d, fill: false }))] };
    },
  },
  {
    id: 'arts-recreation', name: 'Arts & Recreation', kind: 'sector', metaphor: 'theatre-mask',
    keywords: ['entertainment', 'leisure', 'sports', 'gaming', 'theatre', 'museums', 'media'],
    reduction: 'None — mask, eyes and smile at all sizes.',
    draw(k) {
      const mask = k.path([['M', 0.08, 0.08], ['Q', 0.5, 0.2, 0.92, 0.08], ['V', 0.5], ['C', 0.92, 0.8, 0.7, 0.98, 0.5, 0.98], ['C', 0.3, 0.98, 0.08, 0.8, 0.08, 0.5], ['Z']], { snap: false });
      const eyes = [[[0.27, 0.42], [0.41, 0.42]], [[0.59, 0.42], [0.73, 0.42]]], smile = quadPts([0.32, 0.66], [0.5, 0.82], [0.68, 0.66]);
      return {
        outline: [mask, ...eyes.map((e) => k.poly(e, { closed: false, snap: false })), k.poly(smile, { closed: false, snap: false })],
        solid: [{ d: mask + eyes.map((e) => k.offsetLine(e, k.sw)).join('') + k.offsetLine(smile, k.sw), fill: true }],
      };
    },
  },
  {
    id: 'accommodation-food', name: 'Accommodation & Food', kind: 'sector', metaphor: 'cloche',
    keywords: ['hotels', 'restaurants', 'hospitality', 'lodging', 'food service', 'catering'],
    reduction: 'None — dome, knob and tray at all sizes.',
    draw(k) {
      const ty = 0.9, dy = ty - k.gapN(), rr = 0.42;
      const dome = k.path([['M', 0.5 - rr, dy], ['A', rr, rr, 0, 0, 1, 0.5 + rr, dy], ['Z']], { snap: false });
      const knob = k.circle(0.5, dy - rr - 0.07, 0.07), tray = k.path([['M', 0, ty], ['H', 1]]);
      return { outline: [dome, knob, tray], solid: [{ d: dome, fill: true }, { d: knob, fill: true }, { d: tray, fill: false }] };
    },
  },
  {
    id: 'other-services', name: 'Other Services', kind: 'sector', metaphor: 'wrench',
    keywords: ['repair', 'maintenance', 'personal services', 'households', 'membership organisations', 'miscellaneous'],
    reduction: 'None — handle and jaw at all sizes.',
    draw(k) {
      const cx = 0.66, cy = 0.34, r = 0.24, a0 = 20, a1 = 250; // jaw opens to the upper right
      const j = ((135 * Math.PI) / 180), hx = cx + r * Math.cos(j), hy = cy + r * Math.sin(j); // handle leaves the jaw at lower left
      const handle = [[hx, hy], [0.12, 0.88]];
      return {
        outline: [k.path(arc(cx, cy, r, a0, a1), { snap: false }), k.poly(handle, { closed: false, snap: false })],
        solid: [{ d: k.offsetLine(arcPts(cx, cy, r, a0, a1), k.sw * 0.8), fill: true }, { d: k.offsetLine(handle, k.sw * 0.8), fill: true }],
      };
    },
  },
  {
    id: 'government', name: 'Government', kind: 'sector', metaphor: 'capitol-flag',
    keywords: ['public administration', 'public sector', 'defence', 'state', 'federal', 'agencies', 'regulation'],
    reduction: '20+: pennant on the pole. 32+: columns.',
    draw(k) {
      const by = 0.58, bb = 0.86, dr = 0.24;
      const base = k.path([['M', 0.02, 1], ['H', 0.98]]), body = k.path([['M', 0.1, bb], ['V', by], ['H', 0.9], ['V', bb]]);
      const dome = k.path([['M', 0.5 - dr, by], ['A', dr, dr, 0, 0, 1, 0.5 + dr, by]], { snap: false });
      const pole = k.path([['M', 0.5, by - dr], ['V', 0.04]]);
      const flag = k.tier >= 1 ? [k.poly([[0.5, 0.04], [0.74, 0.11], [0.5, 0.18]], { snap: false })] : [];
      const xs = k.tier >= 3 ? [0.3, 0.5, 0.7] : [], cT = by + k.gapN(1.2), cB = bb - k.gapN(1.2) * 0.4;
      const cols = xs.map((x) => k.path([['M', x, cT], ['V', cB]]));
      return {
        outline: [base, body, dome, pole, ...flag, ...cols],
        solid: [{ d: k.path([['M', 0.5 - dr, by], ['A', dr, dr, 0, 0, 1, 0.5 + dr, by], ['Z']], { snap: false }), fill: true },
          { d: k.path([['M', 0.1, bb], ['V', by], ['H', 0.9], ['V', bb], ['Z']]) + xs.map((x) => k.capsule(x, cT, x, cB, k.holeW(k.sw * 0.8))).join(''), fill: true },
          { d: pole, fill: false }, ...flag.map((d) => ({ d, fill: true })), { d: base, fill: false }],
      };
    },
  },
];
