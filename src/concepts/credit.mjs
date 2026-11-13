// Credit asset classes. Structured products share a "tranche base" (two stacked lines)
// under the asset they're backed by, so the family reads as one system.
import { KEY } from '../../scripts/lib/kit.mjs';
import { pick } from '../lib/shapes.mjs';

const R = KEY.radius;

// Two stacked lines at the bottom; returns symbol area bottom + base paths.
function trancheBase(k) {
  // 16px: one line (room for the asset). 20+: two lines.
  const g = k.gapN(1.2);
  if (k.tier === 0) return { top: 1 - g, base: [k.path([['M', 0.04, 1], ['H', 0.96]])] };
  const b2 = 1, b1 = 1 - g, top = b1 - g;
  return { top, base: [k.path([['M', 0.04, b1], ['H', 0.96]]), k.path([['M', 0.04, b2], ['H', 0.96]])] };
}
const solidBase = (base) => base.map((d) => ({ d, fill: false }));

export default [
  {
    id: 'rmbs', name: 'RMBS', kind: 'asset-class', metaphor: 'house-on-tranches',
    keywords: ['residential mortgage-backed securities', 'mortgage', 'MBS', 'agency MBS', 'non-agency', 'home loans'],
    reduction: '20+: door.',
    draw(k) {
      const { top, base } = trancheBase(k);
      const h = top, Y = (t) => t * h;
      const door = k.tier >= 1, g = k.grow;
      const pts = (gg = 0) => {
        const p = [[0.5, Y(0.02)], [0.84, Y(0.42)], [0.84, Y(1)]];
        if (door) p.push([0.58 + gg, Y(1)], [0.58 + gg, Y(0.66) + gg], [0.42 - gg, Y(0.66) + gg], [0.42 - gg, Y(1)]);
        p.push([0.16, Y(1)], [0.16, Y(0.42)]);
        return p;
      };
      return { outline: [k.poly(pts(), { snap: false }), ...base], solid: [{ d: k.poly(pts(g), { snap: false }), fill: true }, ...solidBase(base)] };
    },
  },
  {
    id: 'cmbs', name: 'CMBS', kind: 'asset-class', metaphor: 'office-on-tranches',
    keywords: ['commercial mortgage-backed securities', 'commercial real estate', 'CRE', 'office', 'conduit'],
    reduction: 'Windows: 1 row at 16, 2 rows (single column) at 20, 2×2 at 24, 3×2 at 32+.',
    draw(k) {
      const { top, base } = trancheBase(k);
      const bld = k.rrect(0.24, 0, 0.76, top, R * 0.6);
      const rows = pick(k, [[0.42], [0.32, 0.62], [0.3, 0.62], [0.22, 0.46, 0.7], [0.22, 0.46, 0.7]]);
      const wins = k.tier >= 2 ? rows.flatMap((t) => [[0.36, t * top, 0.44], [0.56, t * top, 0.64]]) : rows.map((t) => [0.42, t * top, 0.58]);
      const winO = wins.map(([a, y, b]) => k.path([['M', a, y], ['H', b]], { snap: false }));
      return {
        outline: [bld, ...winO, ...base],
        solid: [{ d: bld + wins.map(([a, y, b]) => k.capsule(a, y, b, y, k.holeW(k.sw))).join(''), fill: true }, ...solidBase(base)],
      };
    },
  },
  {
    id: 'abs', name: 'ABS', kind: 'asset-class', metaphor: 'card-on-tranches',
    keywords: ['asset-backed securities', 'auto loans', 'credit cards', 'student loans', 'receivables', 'consumer ABS'],
    reduction: '20+: magnetic stripe.',
    draw(k) {
      const { top, base } = trancheBase(k);
      const y0 = top * 0.12, y1 = top;
      const card = k.rrect(0.04, y0, 0.96, y1, R * 0.7);
      const sy = y0 + (y1 - y0) * 0.36;
      const stripe = k.tier >= 1 ? [k.path([['M', 0.04, sy], ['H', 0.96]], { snap: false })] : [];
      return {
        outline: [card, ...stripe, ...base],
        solid: [{ d: card + (stripe.length ? k.capsule(0.12, sy, 0.88, sy, k.holeW(k.sw)) : ''), fill: true }, ...solidBase(base)],
      };
    },
  },
  {
    id: 'clo', name: 'CLO', kind: 'asset-class', metaphor: 'loan-on-tranches',
    keywords: ['collateralized loan obligations', 'leveraged loans', 'CLO', 'structured credit', 'loan portfolio'],
    reduction: '20+: text lines on the document.',
    draw(k) {
      const { top, base } = trancheBase(k);
      const f = 0.18; // fold size
      const doc = k.path([['M', 0.22, 0], ['H', 0.78 - f], ['L', 0.78, f], ['V', top], ['H', 0.22], ['Z']], { snap: false });
      const fold = k.path([['M', 0.78 - f, 0], ['V', f], ['H', 0.78]], { snap: false });
      const lines = k.tier >= 1 ? [[0.34, top * 0.5, 0.66], [0.34, top * 0.76, 0.56]] : [];
      return {
        outline: [doc, fold, ...lines.map(([a, y, b]) => k.path([['M', a, y], ['H', b]], { snap: false })), ...base],
        solid: [{ d: doc + lines.map(([a, y, b]) => k.capsule(a, y, b, y, k.holeW(k.sw))).join(''), fill: true }, ...solidBase(base)],
      };
    },
  },
  {
    id: 'municipal-bonds', name: 'Municipal Bonds', kind: 'asset-class', metaphor: 'civic-dome',
    keywords: ['munis', 'municipal', 'public finance', 'state and local government', 'tax-exempt', 'general obligation'],
    reduction: '16–20: dome, spire and body only. 24+: columns.',
    draw(k) {
      const g = k.gapN(1.2), domeR = pick(k, [0.25, 0.22, 0.2, 0.2, 0.2]), domeY = pick(k, [0.5, 0.42, 0.36, 0.36, 0.36]);
      const dome = k.path([['M', 0.5 - domeR, domeY], ['A', domeR, domeR, 0, 0, 1, 0.5 + domeR, domeY]], { snap: false });
      const spire = [k.path([['M', 0.5, domeY - domeR], ['V', 0.02]])];
      const body = k.path([['M', 0.06, 0.86], ['V', domeY], ['H', 0.94], ['V', 0.86]]);
      const base = k.path([['M', 0.02, 1], ['H', 0.98]]);
      const n = pick(k, [0, 0, 3, 4, 4]);
      const xs = n ? Array.from({ length: n }, (_, i) => 0.24 + (i * 0.52) / (n - 1)) : [];
      const cT = domeY + g, cB = 0.86 - g * 0.6;
      const cols = xs.map((x) => k.path([['M', x, cT], ['V', cB]]));
      return {
        outline: [dome, ...spire, body, base, ...cols],
        solid: [{ d: k.path([['M', 0.5 - domeR, domeY], ['A', domeR, domeR, 0, 0, 1, 0.5 + domeR, domeY], ['Z']], { snap: false }), fill: true },
          { d: k.path([['M', 0.06, 0.86], ['V', domeY], ['H', 0.94], ['V', 0.86], ['Z']]) + xs.map((x) => k.capsule(x, cT, x, cB, k.holeW(k.sw * 0.8))).join(''), fill: true },
          ...spire.map((d) => ({ d, fill: false })), { d: base, fill: false }],
      };
    },
  },
];
