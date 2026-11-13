// Credit groups that had no picture anywhere in their branch (Fitch top levels). Metaphors from data/research/<id>.json.
import { KEY } from '../../scripts/lib/kit.mjs';
import { pick } from '../lib/shapes.mjs';

const R = KEY.radius;
const seg = (k, pts) => k.poly(pts, { closed: false, snap: false });
const dot = (k, x, y) => k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false });

export default [
  {
    id: 'corporate-finance', name: 'Corporate Finance', kind: 'asset-class', metaphor: 'office-towers',
    keywords: ['corporates', 'corporate credit', 'corporate bonds', 'companies', 'issuers', 'investment grade', 'high yield'],
    reduction: '16: two blocks only. 20+: windows in the tall block. 32+: windows in both.',
    draw(k) {
      const tall = [[0.1, 0.98], [0.1, 0.04], [0.56, 0.04], [0.56, 0.98]], low = [[0.56, 0.42], [0.9, 0.42], [0.9, 0.98]];
      const ground = k.path([['M', 0.02, 0.98], ['H', 0.98]]);
      const rows = k.tier >= 2 ? [0.24, 0.44, 0.64] : k.tier === 1 ? [0.28, 0.54] : [];
      const wins = [...rows.map((y) => [[0.25, y], [0.41, y]]), ...(k.tier >= 3 ? [[[0.68, 0.6], [0.78, 0.6]], [[0.68, 0.78], [0.78, 0.78]]] : [])];
      const cut = k.holeW(pick(k, [1, 1, 1.2, 1.5, 2]));
      return {
        outline: [seg(k, tall), seg(k, low), ground, ...wins.map((w) => seg(k, w))],
        solid: [{ d: k.poly([[0.1, 0.98], [0.1, 0.04], [0.56, 0.04], [0.56, 0.42], [0.9, 0.42], [0.9, 0.98]]) + wins.map(([a, b]) => k.capsule(a[0], a[1], b[0], b[1], cut)).join(''), fill: true }, { d: ground, fill: false }],
      };
    },
  },
  {
    id: 'loans', name: 'Loans & Debt', kind: 'asset-class', metaphor: 'document-percent',
    keywords: ['bank loans', 'leveraged finance', 'commercial paper', 'hybrids', 'debt', 'lending', 'credit facilities', 'borrowing'],
    reduction: '16: slash only. 20+: full percent sign.',
    draw(k) {
      const doc = k.rrect(0.14, 0.02, 0.86, 0.98, R), a = [0.63, 0.34], b = [0.37, 0.66], pct = k.tier >= 1, rr = pick(k, [0, 0.005, 0.05, 0.05, 0.05]);
      const o1 = [0.37, 0.36], o2 = [0.63, 0.64];
      const ring = ([x, y]) => (k.tier >= 2 ? k.circle(x, y, rr) : dot(k, x, y));
      const cut = k.holeW(pick(k, [1.2, 1.3, 1.7, 2.2, 3.2])) / 2;
      return {
        outline: [doc, seg(k, [a, b]), ...(pct ? [ring(o1), ring(o2)] : [])],
        solid: [{ d: doc + k.offsetLine([a, b], cut) + (pct ? [o1, o2].map(([x, y]) => k.circle(x, y, k.holeN(pick(k, [0, 1.7, 2.2, 3, 4.5])) / 2)).join('') : ''), fill: true }],
      };
    },
  },
  {
    id: 'credit-derivatives', name: 'Credit Derivatives', kind: 'asset-class', metaphor: 'swap-arrows',
    keywords: ['CDS', 'credit default swaps', 'swaps', 'derivatives', 'synthetic', 'hedging'],
    reduction: 'None — two opposed arrows at all sizes.',
    draw(k) {
      const h = pick(k, [0.17, 0.17, 0.16, 0.16, 0.16]), y1 = 0.3, y2 = 0.7;
      const top = [seg(k, [[0.06, y1], [0.94, y1]]), seg(k, [[0.94 - h, y1 - h], [0.94, y1], [0.94 - h, y1 + h]])];
      const bot = [seg(k, [[0.94, y2], [0.06, y2]]), seg(k, [[0.06 + h, y2 - h], [0.06, y2], [0.06 + h, y2 + h]])];
      const fatHead = (pts) => ({ d: k.poly(pts, { snap: false }), fill: true });
      return {
        outline: [...top, ...bot],
        solid: [{ d: seg(k, [[0.06, y1], [0.94 - h, y1]]), fill: false }, fatHead([[0.94 - h, y1 - h], [0.94, y1], [0.94 - h, y1 + h]]), { d: seg(k, [[0.94, y2], [0.06 + h, y2]]), fill: false }, fatHead([[0.06 + h, y2 - h], [0.06, y2], [0.06 + h, y2 + h]])],
      };
    },
  },
];
