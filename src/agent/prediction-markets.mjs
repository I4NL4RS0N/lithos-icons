import { pick, circlePts, arc } from '../lib/shapes.mjs';

// Points along a circular arc (degrees, y down), for offsetLine knockouts.
function arcPts(cx, cy, r, a0, a1, n = 12) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

export default {
  id: 'prediction-markets',
  name: 'Prediction Markets',
  kind: 'theme',
  metaphor: 'crystal-ball',
  keywords: ['prediction markets', 'event contracts', 'Kalshi', 'CFTC', 'Polymarket'],
  reduction: '16 and 20: large sphere seated in a wide trapezoid stand, one glint arc at upper left, nothing else inside. 24: adds a small glint dot. 32 and 48: adds a second, shorter inner glint arc. Solid: glints are knockouts, and a knockout band separates the sphere from the stand.',
  draw(k) {
    const cx = 0.5;
    // Solid 16/20: a slightly smaller ball leaves the stand a real band below the cut.
    const r = k.solid ? pick(k, [0.375, 0.39, 0.41, 0.42, 0.42]) : pick(k, [0.4, 0.41, 0.42, 0.42, 0.42]);
    const cy = r;
    const ball = k.circle(cx, cy, r);
    const disk = k.ring(circlePts(cx, cy, r, 96));

    // Stand: a wide, symmetric trapezoid the sphere sits down into.
    const tY = pick(k, [0.68, 0.69, 0.7, 0.71, 0.72]);
    const tW = pick(k, [0.33, 0.33, 0.33, 0.32, 0.32]);
    const bW = pick(k, [0.43, 0.43, 0.42, 0.41, 0.41]);
    const trap = k.ring([[cx - tW, tY], [cx + tW, tY], [cx + bW, 1], [cx - bW, 1]]);
    const stand = k.bool([trap], [disk]);

    // Glints: reflections on glass, upper left.
    const gR = r * pick(k, [0.62, 0.62, 0.64, 0.66, 0.68]);
    const g1 = k.tier < 3 ? [192, 258] : [200, 250];
    const outline = [ball, stand, k.path(arc(cx, cy, gR, g1[0], g1[1]), { snap: false })];
    const holes = [k.offsetLine(arcPts(cx, cy, gR, g1[0], g1[1]), k.holeW(pick(k, [1.9, 2, 2.1, 2.25, 3])) / 2)];

    if (k.tier === 2) {
      // a small dot glint after the arc
      // (outline only; in solid it would crowd the arc knockout)
      const a = (300 * Math.PI) / 180;
      const x = cx + gR * Math.cos(a), y = cy + gR * Math.sin(a);
      outline.push(k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false }));
    }
    if (k.tier >= 3) {
      const r2 = r * 0.38;
      outline.push(k.path(arc(cx, cy, r2, 205, 245), { snap: false }));
      holes.push(k.offsetLine(arcPts(cx, cy, r2, 205, 245), k.holeW(pick(k, [1.5, 1.6, 1.75, 2.25, 3])) / 2));
    }

    // Solid: stand cut back from the sphere so a clear band separates them.
    const cut = k.ring(circlePts(cx, cy, r + k.gapN(1), 96));
    const standSolid = k.bool([trap], [cut]);

    return {
      outline,
      solid: [
        { d: `${ball} ${holes.join(' ')}`, fill: true },
        { d: standSolid, fill: true },
      ],
    };
  },
};
