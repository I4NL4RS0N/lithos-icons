import { pick, quadPts } from '../lib/shapes.mjs';

export default {
  id: 'motion-pictures',
  name: 'Film & TV Production',
  kind: 'industry',
  parent: 'media',
  metaphor: 'clapperboard',
  keywords: ['film', 'television production', 'studio', 'sound recording'],
  reduction: 'Clapperboard: a tall slate with a striped clapper arm hinged at its top-left corner and swung open about 22 degrees. Stripes appear at every size and step up smoothly: arm 2 stripes at 16, 3 at 20 and 24, 4 at 32 and 48. 20+: a striped band (fixed stick) across the top of the slate, with matching diagonals (2 at 20, 3 at 24, 4 at 32+). Solid: the same arm, band and slate filled, footprint matching the outline. The arm stripes are diagonal slots knocked out from its lower edge (facing the open wedge) with its top edge left straight; the band stripes are cut right through it as alternating blocks; a thin gap splits the band from the slate.',
  draw(k) {
    const t = k.tier;
    // Clapper arm geometry.
    const a = (22 * Math.PI) / 180;
    const h = pick(k, [0.25, 0.22, 0.2, 0.19, 0.18]);
    const Lr = 0.76;
    const ux = Math.cos(a), uy = -Math.sin(a), nx = -Math.sin(a), ny = -Math.cos(a);
    // Hinge sits at the slate's top-left; slate top chosen so the arm tip touches y≈0.
    const by0 = Lr * Math.sin(a) + h * Math.cos(a) + 0.015;
    const bx0 = 0.04, bx1 = 0.96, by1 = 0.97, r = pick(k, [0.1, 0.1, 0.1, 0.09, 0.08]);
    const hx = bx0 + 0.04, hy = by0;
    const P = (s, v) => [hx + s * Lr * ux + v * h * nx, hy + s * Lr * uy + v * h * ny];
    const armPts = [P(0, 0), P(1, 0), P(1, 1), P(0, 1)];

    const bodyPts = [
      [bx0, by0], [bx1, by0],
      ...quadPts([bx1, by1 - r], [bx1, by1], [bx1 - r, by1], 6),
      ...quadPts([bx0 + r, by1], [bx0, by1], [bx0, by1 - r], 6),
    ];

    // Band (fixed stick) across the top of the slate, 20+.
    const hasBand = t >= 1;
    const bandH = pick(k, [0, 0.2, 0.19, 0.18, 0.17]);
    const bandY = by0 + bandH;

    // Stripes.
    const nArm = pick(k, [2, 3, 3, 4, 4]);
    const nBand = pick(k, [0, 2, 3, 4, 4]);
    const armSl = 0.1; // slant in arm-length units
    const armS = [...Array(nArm)].map((_, i) => (i + 0.75) / (nArm + 0.5) - armSl / 2);
    const bw = bx1 - bx0;
    const bandSl = 0.09; // slant in x
    const bandX = [...Array(nBand)].map((_, i) => bx0 + bw * ((i + 0.75) / (nBand + 0.5)));

    const line = (p, q) => k.path([['M', ...p], ['L', ...q]], { snap: false });
    const outline = [];
    outline.push(k.poly(armPts, { closed: true, snap: false }));
    outline.push(k.poly(bodyPts, { closed: true, snap: false }));
    armS.forEach((s) => outline.push(line(P(s, 0), P(s + armSl, 1))));
    if (hasBand) {
      outline.push(k.path([['M', bx0, bandY], ['H', bx1]]));
      bandX.forEach((x) => outline.push(line([x + bandSl / 2, by0], [x - bandSl / 2, bandY])));
    }

    // Solid.
    const hw = k.holeW(pick(k, [1.25, 1.25, 1.5, 2, 2.75])) / 2;
    const hwA = k.holeW(pick(k, [1.5, 1.5, 1.5, 2, 2.75])) / 2;
    // Stripes are slots knocked out inside the arm and band, so the outer
    // silhouette stays the same rectangle as the outline.
    // The slots open onto the wedge between arm and slate (arm: lower edge,
    // band: upper edge) and stop short of the outer edges, which stay straight.
    const border = pick(k, [0.6, 0.75, 0.9, 1.1, 1.5]);
    const mA = (hwA + border) / (h * k.L);
    const armCuts = armS.map((s) => k.fat([P(s - armSl * 0.5, -0.5), P(s + armSl * (1 - mA), 1 - mA)], hwA));
    const solid = [{ d: k.bool([k.ring(armPts)], armCuts), fill: true }];
    if (hasBand) {
      const gw = k.holeW(pick(k, [1, 1, 1, 1.25, 1.75])) / 2;
      const mB = -0.5; // band stripes cut right through: alternating blocks
      const bandCuts = bandX.map((x) => k.fat([
        [x + bandSl / 2 + bandSl * 0.5, by0 - bandH * 0.5],
        [x - bandSl / 2 + bandSl * mB, bandY - bandH * mB]], hw));
      // Band with slots, then the slate below split from it by a thin gap.
      const bandRect = [[bx0, by0], [bx1, by0], [bx1, bandY], [bx0, bandY]];
      solid.push({ d: k.bool([k.ring(bandRect)], bandCuts), fill: true });
      const lower = k.bool([k.ring(bodyPts)], [k.ring([[bx0 - 0.1, by0 - 0.1], [bx1 + 0.1, by0 - 0.1], [bx1 + 0.1, bandY], [bx0 - 0.1, bandY]]), k.fat([[bx0 - 0.1, bandY], [bx1 + 0.1, bandY]], gw)]);
      solid.push({ d: lower, fill: true });
    } else {
      solid.push({ d: k.bool([k.ring(bodyPts)], []), fill: true });
    }
    return { outline, solid };
  },
};
