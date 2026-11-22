import { pick, circlePts } from '../lib/shapes.mjs';

// Life ring: the rescue thrown to a sinking market. Round buoy with four bands on the diagonals.
const arcPts = (cx, cy, r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
});

export default {
  id: 'market-stabilisation-measures',
  name: 'Market Stabilisation',
  kind: 'theme',
  metaphor: 'life-ring',
  keywords: ['margin requirement', 'stock market rescue', 'circuit breaker', 'stabilisation fund'],
  reduction: '16-20: two rings joined by one line on each diagonal. 24+: each band drawn as two parallel lines. Solid at every size: filled ring with a curved slot in each white quarter, slots widen with size.',
  draw(k) {
    const cx = 0.5, cy = 0.5, R = 0.5;
    const r = pick(k, [0.26, 0.25, 0.25, 0.26, 0.27]);
    const w = pick(k, [0.06, 0.07, 0.085, 0.075, 0.07]); // half-width of a band
    const diag = [45, 135, 225, 315];
    const seg = (pts) => k.poly(pts, { closed: false, snap: false });

    // Band edges: lines parallel to the diagonal, offset by ±w, from inner to outer circle.
    const bandLines = [];
    for (const deg of diag) {
      const a = (deg * Math.PI) / 180, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]];
      const offs = k.tier < 2 ? [0] : [-w, w];
      for (const o of offs) {
        const t0 = Math.sqrt(r * r - o * o), t1 = Math.sqrt(R * R - o * o);
        bandLines.push([
          [cx + n[0] * o + u[0] * t0, cy + n[1] * o + u[1] * t0],
          [cx + n[0] * o + u[0] * t1, cy + n[1] * o + u[1] * t1],
        ]);
      }
    }
    const outline = [k.circle(cx, cy, R), k.circle(cx, cy, r), ...bandLines.map(seg)];

    let subtract = [k.ring(circlePts(cx, cy, r, 48))];
    {
      const m = (R + r) / 2;
      const slot = k.holeW(pick(k, [1.5, 1.75, 2, 2.75, 3.75])) / 2;
      // Leave the band plus a margin at each end of the slot.
      const d = ((w + slot / k.L) / m) * (180 / Math.PI);
      for (const deg of diag) subtract.push(k.fat(arcPts(cx, cy, m, deg + d, deg + 90 - d), slot));
    }
    const body = k.bool([k.ring(circlePts(cx, cy, R, 64))], subtract);
    return { outline, solid: [{ d: body, fill: true }] };
  },
};
