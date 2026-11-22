import { pick, circlePts } from '../lib/shapes.mjs';

// Anchor: the harbour symbol on charts and maps. Ring, stock, shank and curved arms.
const arcPts = (cx, cy, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});
const rot = (v, d) => { const c = Math.cos(d), s = Math.sin(d); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };

export default {
  id: 'ports',
  name: 'Ports',
  kind: 'industry',
  parent: 'transportation',
  metaphor: 'anchor',
  keywords: ['ports', 'seaports', 'container terminals', 'port throughput'],
  reduction: '16: ring, stock, shank and plain arms. 20+: arrow flukes on the arm tips.',
  draw(k) {
    const seg = (pts) => k.poly(pts, { closed: false, snap: false });
    // e insets the drawing so the heavier solid parts stay in the live area.
    const geo = (e) => {
      const cx = 0.5, r = pick(k, [0.13, 0.125, 0.12, 0.11, 0.1]) + e * 0.5;
      const ry = r + e, ringBot = ry + r;
      const sy = ringBot + 0.12;
      const sw2 = pick(k, [0.24, 0.22, 0.22, 0.22, 0.2]);
      const ar = 0.44 - e, ac = 0.98 - e - ar, a0 = 12, a1 = 168;
      const shank = [[cx, ringBot], [cx, ac + ar]];
      const stock = [[cx - sw2, sy], [cx + sw2, sy]];
      const arms = arcPts(cx, ac, ar, a0, a1);
      const flukes = [];
      if (k.tier >= 1) {
        const fl = pick(k, [0, 0.13, 0.13, 0.12, 0.11]);
        for (const [deg, sgn] of [[a0, 1], [a1, -1]]) {
          const a = (deg * Math.PI) / 180;
          const P = [cx + ar * Math.cos(a), ac + ar * Math.sin(a)];
          const t = [-Math.sin(a) * sgn, Math.cos(a) * sgn]; // back along the arm
          const b1 = rot(t, 0.75), b2 = rot(t, -0.75);
          flukes.push([[P[0] + fl * b1[0], P[1] + fl * b1[1]], P, [P[0] + fl * b2[0], P[1] + fl * b2[1]]]);
        }
      }
      return { cx, r, ry, shank, stock, arms, flukes };
    };

    const o = geo(0);
    const outline = [k.circle(o.cx, o.ry, o.r), seg(o.shank), seg(o.stock), seg(o.arms), ...o.flukes.map(seg)];

    const h = k.sw * 0.3, g = geo(h / k.L);
    const hole = k.holeN(pick(k, [1.75, 2, 2.25, 2.75, 3.5])) / 2;
    const body = k.bool(
      [k.ring(circlePts(g.cx, g.ry, g.r, 40)), k.fat(g.shank, h), k.fat(g.stock, h), k.fat(g.arms, h), ...g.flukes.map((f) => k.fat(f, h * 0.5))],
      [k.ring(circlePts(g.cx, g.ry, hole, 32))],
    );
    return { outline, solid: [{ d: body, fill: true }] };
  },
};
