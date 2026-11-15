import { pick } from '../lib/shapes.mjs';

// Cubic Bézier sampler (for k.bool rings).
const cub = (p0, p1, p2, p3, n = 12) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n, u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
});

// Points of a rotated ellipse (rot in degrees, clockwise on screen).
const ellPts = (cx, cy, rx, ry, rot, n = 32) => {
  const a = (rot * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * 2 * Math.PI, x = rx * Math.cos(t), y = ry * Math.sin(t);
    return [cx + x * c - y * s, cy + x * s + y * c];
  });
};

export default {
  id: 'veterinary-activities',
  name: 'Veterinary',
  kind: 'industry',
  parent: 'health-care',
  metaphor: 'paw-cross',
  keywords: ['veterinary', 'animal health', 'pet care'],
  reduction: 'Paw print (four oval toes on an arc over a bell-shaped pad) with a medical cross in the pad at every size. 16 and 20: the pad is taller and its base dip almost flat, so the small cross keeps 1.5px clear of the pad edge; inner toes sit slightly wider apart. 32 and 48: the base dip grows and the toes get a little larger. Solid: toes filled separately; the cross is a knockout in the pad, drawn bigger at 16/20 (1.75px bars) so it does not close up.',
  draw(k) {
    // Four toes on an arc: inner pair high, outer pair lower and tilted outwards.
    const irx = pick(k, [0.1, 0.1, 0.1, 0.105, 0.105]);
    const iry = pick(k, [0.135, 0.135, 0.14, 0.145, 0.145]);
    const orx = pick(k, [0.095, 0.095, 0.095, 0.1, 0.1]);
    const ory = pick(k, [0.125, 0.125, 0.13, 0.135, 0.135]);
    const ix = pick(k, [0.17, 0.17, 0.165, 0.16, 0.16]), iy = 0.155;
    const ox = pick(k, [0.405, 0.405, 0.4, 0.39, 0.39]), oy = 0.47;
    const toes = [
      ellPts(0.5 - ix, iy, irx, iry, -8),
      ellPts(0.5 + ix, iy, irx, iry, 8),
      ellPts(0.5 - ox, oy, orx, ory, -28),
      ellPts(0.5 + ox, oy, orx, ory, 28),
    ];

    // Main pad: a rounded bell with a soft dip at the base.
    // Drawn in u (0 = top, 1 = base) so small sizes can get a taller pad.
    const top = pick(k, [0.45, 0.46, 0.47, 0.48, 0.48]), bot = pick(k, [0.99, 0.985, 0.975, 0.97, 0.97]);
    const dip = pick(k, [0.01, 0.02, 0.04, 0.05, 0.05]);
    const Y = (u) => top + u * (bot - top);
    const P = [
      [[0.5, Y(0)], [0.61, Y(0)], [0.67, Y(0.2)], [0.73, Y(0.39)]],
      [[0.73, Y(0.39)], [0.8, Y(0.6)], [0.84, Y(1)], [0.67, Y(1)]],
      [[0.67, Y(1)], [0.59, Y(1)], [0.56, bot - dip], [0.5, bot - dip]],
      [[0.5, bot - dip], [0.44, bot - dip], [0.41, Y(1)], [0.33, Y(1)]],
      [[0.33, Y(1)], [0.16, Y(1)], [0.2, Y(0.6)], [0.27, Y(0.39)]],
      [[0.27, Y(0.39)], [0.33, Y(0.2)], [0.39, Y(0)], [0.5, Y(0)]],
    ];
    const padPath = k.path([
      ['M', ...P[0][0]],
      ...P.map((s) => ['C', ...s[1], ...s[2], ...s[3]]),
      ['Z'],
    ], { snap: false });
    const padPts = P.flatMap((s) => cub(...s).slice(1));

    // Cross in the pad.
    // Kept clear of the pad's top and dipped base by >= 1.5px.
    const cx = 0.5, cy = pick(k, [0.72, 0.72, 0.71, 0.71, 0.71]);
    const arm = pick(k, [0.08, 0.085, 0.095, 0.1, 0.1]);

    const toePath = (pts) => k.poly(pts, { closed: true, snap: false });

    const outline = [
      ...toes.map(toePath),
      padPath,
      k.path([['M', cx - arm, cy], ['H', cx + arm], ['M', cx, cy - arm], ['V', cy + arm]], { snap: false }),
    ];

    // Solid: filled toes; pad with a plus knocked out.
    const hw = k.holeW(pick(k, [1.75, 1.75, 1.75, 2.25, 2.75])) / 2;
    const plusArm = pick(k, [0.125, 0.12, 0.11, 0.11, 0.11]);
    const pad = k.bool([k.ring(padPts)], [
      k.fat([[cx - plusArm, cy], [cx + plusArm, cy]], hw),
      k.fat([[cx, cy - plusArm], [cx, cy + plusArm]], hw),
    ]);

    return {
      outline,
      solid: [
        ...toes.map((p) => ({ d: toePath(p), fill: true })),
        { d: pad, fill: true },
      ],
    };
  },
};
