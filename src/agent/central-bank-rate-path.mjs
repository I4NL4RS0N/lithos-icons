import { pick } from '../lib/shapes.mjs';

export default {
  id: 'central-bank-rate-path',
  name: 'Central Bank Rate Path',
  kind: 'theme',
  metaphor: 'stair-arrow',
  keywords: ['rate path', 'rate hikes', 'policy rate', 'central bank tightening', 'BoJ', 'ECB'],
  reduction: 'One closed silhouette: a staircase block rising left to right in flat steps (the policy rate moving in discrete hikes) whose last, tallest step turns into a broad upward arrow. No interior detail at any size: two steps plus the arrow column everywhere; only the step heights and arrowhead depth are retuned per size so treads and wings keep clear space at 16. Solid: the same silhouette filled.',
  draw(k) {
    const B = 0.97;                                   // ground
    const a = pick(k, [0.29, 0.29, 0.28, 0.28, 0.28]); // end of step 1
    const b = pick(k, [0.56, 0.56, 0.56, 0.56, 0.56]); // end of step 2 / shaft left
    const s1 = pick(k, [0.86, 0.86, 0.86, 0.86, 0.86]); // shaft right
    const t1 = pick(k, [0.7, 0.7, 0.71, 0.71, 0.72]);
    const t2 = pick(k, [0.46, 0.46, 0.47, 0.48, 0.48]);
    const cx = (b + s1) / 2;
    const hw = 1 - cx;                                 // arrowhead half-width, right wing on the edge
    const h = pick(k, [0.3, 0.3, 0.3, 0.29, 0.29]);   // arrowhead base
    const tip = 0.02;
    const pts = [
      [0, B], [0, t1], [a, t1], [a, t2], [b, t2], [b, h],
      [cx - hw, h], [cx, tip], [cx + hw, h], [s1, h], [s1, B],
    ];
    const shape = k.poly(pts, { closed: true, snap: false });
    return { outline: [shape], solid: [{ d: shape, fill: true }] };
  },
};
