// Fitch Ratings sector titles that had no icon of their own (batch 1: financial institutions and structured finance).
// Drawn by hand in an interactive session; the agents' judge reviews them in the next run.
import { pick } from '../lib/shapes.mjs';

const arcPts = (cx, cy, r, a0, a1, n = 6) => Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
const rrPts = (x0, y0, x1, y1, r) => [...arcPts(x1 - r, y0 + r, r, -90, 0), ...arcPts(x1 - r, y1 - r, r, 0, 90), ...arcPts(x0 + r, y1 - r, r, 90, 180), ...arcPts(x0 + r, y0 + r, r, 180, 270)];
const ln = (k, pts) => k.poly(pts, { closed: false, snap: false });
const dot = (k, x, y) => k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false });
const dash = (k, x1, y, x2) => k.path([['M', x1, y], ['H', x2]], { snap: false });
const hole = (k, x, y, px) => k.circle(x, y, k.holeN(px) / 2);
const slot = (k, x1, y1, x2, y2, px) => k.capsule(x1, y1, x2, y2, k.holeW(px));

export default [
  {
    id: 'reits', name: 'REITs', kind: 'industry', parent: 'real-estate', metaphor: 'apartment-block',
    keywords: ['real estate investment trusts', 'REIT', 'property trusts', 'rental property'],
    reduction: '16 and 20: two rows of windows. 24 up: three rows.',
    draw(k) {
      const body = k.rrect(0.16, 0.02, 0.84, 0.98, 0.05);
      const ys = pick(k, [[0.24, 0.5], [0.24, 0.5], [0.2, 0.4, 0.6], [0.2, 0.4, 0.6], [0.2, 0.4, 0.6]]);
      const win = (y) => [dash(k, 0.3, y, 0.38), dash(k, 0.6, y, 0.68)];
      const hp = pick(k, [1.2, 1.3, 1.5, 1.8, 2.4]);
      return { outline: [body, ...ys.flatMap(win)], solid: [{ d: body + ys.map((y) => slot(k, 0.34, y, 0.34, y, hp) + slot(k, 0.64, y, 0.64, y, hp)).join('') + ys.map((y) => slot(k, 0.3, y, 0.38, y, hp) + slot(k, 0.6, y, 0.68, y, hp)).join(''), fill: true }] };
    },
  },
  {
    id: 'covered-bonds', name: 'Covered Bonds', kind: 'asset-class', metaphor: 'shield-lines',
    keywords: ['covered bonds', 'pfandbriefe', 'mortgage covered', 'public sector covered', 'cover pool'],
    reduction: '16 and 20: one line. 24 up: two lines.',
    draw(k) {
      const sh = k.path([['M', 0.5, 0], ['L', 0.9, 0.14], ['V', 0.5], ['C', 0.9, 0.78, 0.7, 0.92, 0.5, 1], ['C', 0.3, 0.92, 0.1, 0.78, 0.1, 0.5], ['V', 0.14], ['Z']], { snap: false });
      const ys = k.tier >= 2 ? [0.36, 0.56] : [0.46];
      return { outline: [sh, ...ys.map((y) => dash(k, 0.3, y, 0.7))], solid: [{ d: sh + ys.map((y) => slot(k, 0.3, y, 0.7, y, pick(k, [1.2, 1.3, 1.5, 1.8, 2.4]))).join(''), fill: true }] };
    },
  },
  {
    id: 'student-loans', name: 'Student Loans', kind: 'asset-class', metaphor: 'pencil',
    keywords: ['student loans', 'education loans', 'FFELP', 'private student loans', 'tuition'],
    reduction: 'None: one pencil silhouette at all sizes.',
    draw(k) {
      const parts = [k.fat([[0.3, 0.7], [0.78, 0.22]], 0.095 * k.L), k.ring([[0.06, 0.94], [0.16, 0.6], [0.4, 0.84]])];
      const sil = k.bool(parts), cut = ln(k, [[0.17, 0.64], [0.36, 0.83]]);
      return { outline: [sil, ...(k.tier >= 1 ? [cut] : [])], solid: [{ d: k.bool(parts, [k.fat([[0.17, 0.64], [0.36, 0.83]], k.holeW(pick(k, [1.1, 1.2, 1.4, 1.7, 2.2])) / 2)]), fill: true }] };
    },
  },
];
