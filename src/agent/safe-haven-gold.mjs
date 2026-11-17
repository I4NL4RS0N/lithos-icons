import { pick } from '../lib/shapes.mjs';

export default {
  id: 'safe-haven-gold',
  name: 'Gold & Safe Havens',
  kind: 'theme',
  metaphor: 'bullion-stack',
  keywords: ['gold price', 'safe haven', 'bullion', 'flight to safety', 'central bank gold buying'],
  reduction: 'Three bullion bars stacked as a pyramid (two below, one on top), each a tapered trapezoid, filling the full live area at every size. 16: plain bars with a gentler taper and no top-face line, so the counters stay open. 20, 24, 32, 48: each bar has its top-face edge (one horizontal line near the top). Solid: three filled bars kept apart by clear gaps; at 20 and up the top-face edge is a thin knockout band cut across each bar (1px at 20/24, wider at 32/48); 16 solid is plain bars.',
  draw(k) {
    const t = k.tier;
    const y0 = pick(k, [0.05, 0.03, 0.03, 0.05, 0.06]);
    const y1 = 1 - y0;
    const g = k.gapN(pick(k, [1, 1.25, 1.5, 1.75, 2.25])); // centre-to-centre gap
    const h = (y1 - y0 - g) / 2;
    const w = (1 - g) / 2; // bar bottom width
    const s = pick(k, [0.05, 0.06, 0.075, 0.085, 0.09]); // taper per side

    const bar = (xl, yt) => [
      [xl, yt + h], [xl + s, yt], [xl + w - s, yt], [xl + w, yt + h],
    ];
    const bars = [
      bar(0, y1 - h),
      bar(1 - w, y1 - h),
      bar(0.5 - w / 2, y0),
    ];

    const outline = bars.map((p) => k.poly(p, { closed: true, snap: false }));
    // top-face edge at 20+, placed so it leaves clear space under the top stroke
    const fy = Math.max(k.gapN(pick(k, [0, 1.1, 1.25, 1.5, 2])), pick(k, [0, 0.36, 0.36, 0.4, 0.36]) * h);
    if (t >= 1) {
      for (const p of bars) {
        const yt = p[1][1], ye = yt + fy;
        const dx = s * (fy / h);
        outline.push(k.path([['M', p[1][0] - dx, ye], ['L', p[2][0] + dx, ye]], { snap: false }));
      }
    }

    const cw = k.holeW(pick(k, [1, 1, 1, 1.5, 2]));
    const solid = bars.map((p) => {
      if (t < 1) return { d: k.poly(p, { closed: true, snap: false }), fill: true };
      // top-face knockout: a thin band cut across the bar at the top-face edge
      // sits higher than the outline line so the cut-off top face reads as a lid, not a fourth bar
      const ye = p[1][1] + Math.min(fy, pick(k, [0, 1.75, 1.9, 2.6, 3.6]) / k.L);
      return { d: k.bool([k.ring(p)], [k.fat([[p[0][0] - 0.1, ye], [p[3][0] + 0.1, ye]], cw / 2)]), fill: true };
    });

    return { outline, solid };
  },
};
