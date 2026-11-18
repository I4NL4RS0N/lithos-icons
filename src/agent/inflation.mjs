import { pick } from '../lib/shapes.mjs';

// Rounded polygon path: each corner replaced by a quadratic curve of radius r[i].
function roundPoly(k, pts, radii) {
  const n = pts.length;
  const cmds = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const a = pts[(i - 1 + n) % n];
    const b = pts[(i + 1) % n];
    const r = radii[i];
    const da = Math.hypot(a[0] - p[0], a[1] - p[1]);
    const db = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const p1 = [p[0] + ((a[0] - p[0]) * r) / da, p[1] + ((a[1] - p[1]) * r) / da];
    const p2 = [p[0] + ((b[0] - p[0]) * r) / db, p[1] + ((b[1] - p[1]) * r) / db];
    cmds.push([i === 0 ? 'M' : 'L', ...p1]);
    cmds.push(['Q', p[0], p[1], ...p2]);
  }
  cmds.push(['Z']);
  return k.path(cmds, { snap: false });
}

export default {
  id: 'inflation',
  name: 'Inflation',
  kind: 'theme',
  metaphor: 'tag-uptrend',
  keywords: ['inflation', 'CPI', 'price pressures', 'cost of living', 'sticky inflation'],
  reduction: 'A price tag set on the diagonal (pointed end top-left, string hole near the point) with a rising arrow drawn across the tag, pointing to the top-right. 16: hole is a dot, short arrow with small head. 20+: hole becomes a small ring; arrow grows. Solid: tag filled with the hole and arrow knocked out.',
  draw(k) {
    const s = Math.SQRT1_2;
    const d = [s, s];   // along the tag, from the point to the far end
    const nv = [s, -s]; // across the tag, toward top-right (the "up" of the arrow)
    const T = [0.02, 0.02];
    const h = 0.4; // half-width of the tag body
    const Lng = (0.96 - h * s) / s; // far end touches x = 0.98
    const at = (u, v) => [T[0] + u * d[0] + v * nv[0], T[1] + u * d[1] + v * nv[1]];

    const pts = [at(0, 0), at(h, h), at(Lng, h), at(Lng, -h), at(h, -h)];
    const rc = pick(k, [0.12, 0.12, 0.13, 0.13, 0.13]);
    const rt = pick(k, [0.09, 0.09, 0.1, 0.1, 0.1]);
    const tag = roundPoly(k, pts, [rt, rc, rc, rc, rc]);

    // String hole near the point
    const hu = pick(k, [0.3, 0.3, 0.3, 0.3, 0.3]);
    const [hx, hy] = at(hu, 0);
    const ringR = pick(k, [0, 0.055, 0.055, 0.05, 0.05]);
    const hole = k.tier === 0
      ? k.path([['M', hx - 0.004, hy], ['H', hx + 0.004]], { snap: false })
      : k.circle(hx, hy, ringR);

    // Rising arrow across the tag
    const uc = pick(k, [0.66, 0.65, 0.65, 0.65, 0.65]);
    const half = pick(k, [0.22, 0.24, 0.25, 0.25, 0.25]);
    const tail = at(uc, -half);
    const tip = at(uc, half);
    const wing = pick(k, [0.15, 0.15, 0.15, 0.14, 0.14]);
    const w1 = at(uc - wing, half - wing);
    const w2 = at(uc + wing, half - wing);
    const shaft = k.path([['M', ...tail], ['L', ...tip]], { snap: false });
    const head = k.path([['M', ...w1], ['L', ...tip], ['L', ...w2]], { snap: false });

    const outline = [tag, hole, shaft, head];

    // Solid: tag filled, hole and arrow knocked out
    const hw = k.holeW(pick(k, [1.25, 1.5, 1.75, 2, 2.5])) / 2;
    const arrowHole = k.offsetLines([[tail, tip], [w1, tip, w2]], hw);
    const holeR = k.tier === 0 ? k.holeN(1.75) / 2 : ringR + k.grow;
    const solid = [
      { d: [tag, k.circle(hx, hy, holeR), arrowHole].join(' '), fill: true },
    ];
    return { outline, solid };
  },
};
