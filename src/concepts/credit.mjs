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
    reduction: 'A pool of cascaded cards (receivables) over two tranche bars at every size. 16: two cards. 20+: three cards. Front card keeps its stripe at all sizes.',
    draw(k) {
      // Own tranche base: always two bars (keeps the tranche idea at 16px).
      const g = k.gapN(1.2), b2 = 1, b1 = 1 - g, top = b1 - g;
      const base = [k.path([['M', 0.04, b1], ['H', 0.96]]), k.path([['M', 0.04, b2], ['H', 0.96]])];
      const n = k.tier <= 2 ? 2 : 3;           // cards in the pool
      const dy = k.gapN(k.tier === 0 ? 1 : 1.5), dx = k.gapN(k.tier === 0 ? 1.75 : 2.5); // cascade offset
      const d = dy;
      const X0 = 0.02, X1 = 0.98;
      const w = X1 - X0 - dx * (n - 1), h = top - dy * (n - 1);
      const r = Math.min(R * 0.6, dy * 0.6);
      // card i: 0 = front (bottom-left), n-1 = back (top-right)
      const box = (i) => [X0 + i * dx, top - h - i * dy, X0 + i * dx + w, top - i * dy];
      const [fx0, fy0, fx1, fy1] = box(0);
      const front = k.rrect(fx0, fy0, fx1, fy1, r);
      // Back cards: only their top and right edges show (an L behind the card in front).
      const backs = Array.from({ length: n - 1 }, (_, j) => {
        const [x0, y0, x1, y1] = box(j + 1);
        return k.path([['M', x0, y0 + d], ['V', y0 + r], ['A', r, r, 0, 0, 1, x0 + r, y0], ['H', x1 - r],
          ['A', r, r, 0, 0, 1, x1, y0 + r], ['V', y1 - r], ['A', r, r, 0, 0, 1, x1 - r, y1], ['H', x1 - dx]], { snap: false });
      });
      const sy = fy0 + Math.max(k.gapN(1.25), (fy1 - fy0) * 0.36);
      const stripe = k.path([['M', fx0, sy], ['H', fx1]], { snap: false });
      const ki = r + k.grow;
      return {
        outline: [front, stripe, ...backs, ...base],
        solid: [{ d: front + k.capsule(fx0 + ki, sy, fx1 - ki, sy, k.holeW(k.sw)), fill: true },
          ...backs.map((p) => ({ d: p, fill: false })), ...solidBase(base)],
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
