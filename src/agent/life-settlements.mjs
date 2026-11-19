import { pick } from '../lib/shapes.mjs';

// portrait page with a clipped top-right corner (rounded other corners), as points
const pagePts = (x0, y0, x1, y1, r, f, n = 8) => {
  const out = [];
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  out.push([x1 - f, y0], [x1, y0 + f]);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  return out;
};

// quadratic bezier sampled into points (without the start point)
const qPts = (p0, c, p1, n = 10) => Array.from({ length: n }, (_, i) => {
  const t = (i + 1) / n, u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
});

// one side of a glass: top corner -> neck -> bottom corner, bowed outward by `bow` (signed)
const sidePts = (xTop, ty, xNeck, m, xBot, by, bow) => [
  [xTop, ty],
  ...qPts([xTop, ty], [(xTop + xNeck) / 2 + bow, (ty + m) / 2], [xNeck, m]),
  ...qPts([xNeck, m], [(xNeck + xBot) / 2 + bow, (m + by) / 2], [xBot, by]),
];

export default {
  id: 'life-settlements',
  name: 'Life Settlements',
  kind: 'industry',
  parent: 'insurance',
  metaphor: 'policy-hourglass',
  keywords: ['life settlements', 'life policies', 'policy secondary market', 'longevity risk'],
  reduction: 'Every size: a portrait policy page with a clipped top-right corner and an hourglass (two end bars wider than the glass, pinched waist) centred in it. 16: small clipped corner, no flap, straight-sided empty glass about 5px wide with ≥1.5px clear to the page. 20: fold flap, straight empty glass. 24+: bulbs bow outward. 32+: a low sand mound (plain curve) in the bottom bulb. Solid: page with the whole hourglass knocked out (caps 1px wider than the bulbs, open waist); 24+: a filled sand mound in the bottom bulb.',
  draw(k) {
    const L = k.L, P = (px) => px / L, t = k.tier, sw = k.sw;
    const cx = L / 2;

    // all in px of the live area
    const [hw, ty, by, gi, nk, bow, f, r] = pick(k, [
      [2.5, 3.5, 10.5, 0.6, 0.9, 0, 2.5, 1.6],
      [3.25, 4.25, 13.5, 0.75, 1, 0, 3.5, 2],
      [4, 5.5, 16, 0.9, 0.55, 0.7, 4, 2.3],
      [5.5, 7.5, 22.5, 1.25, 0.65, 1, 5.5, 3],
      [8.5, 11, 34, 2, 0.85, 1.6, 8, 4.2],
    ]);
    const m = (ty + by) / 2;

    const pg = pagePts(P(0.1 * L), 0, P(0.9 * L), 1, P(r), P(f));
    const page = k.poly(pg, { snap: false });
    const fold = k.path([['M', P(0.9 * L - f), 0], ['V', P(f)], ['H', 0.9]], { snap: false });

    // ---- outline
    const toN = (pts) => pts.map(([x, y]) => [P(x), P(y)]);
    const gl = sidePts(cx - hw + gi, ty, cx - nk, m, cx - hw + gi, by, -bow);
    const gr = sidePts(cx + hw - gi, ty, cx + nk, m, cx + hw - gi, by, bow);
    const left = k.poly(toN(gl), { closed: false, snap: false });
    const right = k.poly(toN(gr), { closed: false, snap: false });
    const bars = k.path([['M', P(cx - hw), P(ty)], ['H', P(cx + hw)], ['M', P(cx - hw), P(by)], ['H', P(cx + hw)]]);

    const outline = [page, left, right, bars];
    if (t >= 1) outline.push(fold);
    if (t >= 3) {
      // low sand mound: one plain curve sitting on the bottom bar
      const sx = (hw - gi) * 0.62, sh = (by - m) * 0.42;
      outline.push(k.path([['M', P(cx - sx), P(by)], ['Q', P(cx), P(by - sh * 2), P(cx + sx), P(by)]], { snap: false }));
    }

    // ---- solid: visible hole shape in px, grown by half a stroke so the edge stroke leaves it at size
    const [shw, sty, sby, cap, sgi, snk] = pick(k, [
      [3, 3, 11, 1.25, 1, 0.6],
      [3.75, 3.75, 14, 1.5, 1, 0.7],
      [4.5, 5, 16.5, 1.75, 1, 0.6],
      [6, 7, 23, 2.25, 1.25, 0.75],
      [9, 10.5, 34.5, 3.25, 1.75, 1],
    ]);
    const sm = (sty + sby) / 2;
    const gt = sty + cap, gb = sby - cap; // glass top/bottom (under the caps)
    const sbow = pick(k, [0, 0, 0.5, 0.8, 1.3]);
    const sl = sidePts(cx - shw + sgi, gt, cx - snk, sm, cx - shw + sgi, gb, -sbow);
    const sr = sidePts(cx + shw - sgi, gt, cx + snk, sm, cx + shw - sgi, gb, sbow);
    const hole = [
      [cx - shw, sty], [cx + shw, sty], [cx + shw, gt],
      ...sr,
      [cx + shw, gb], [cx + shw, sby], [cx - shw, sby], [cx - shw, gb],
      ...sl.slice().reverse(),
      [cx - shw, gt],
    ];
    let solidD = page + ' ' + k.offsetPoly(toN(hole), sw / 2);
    const solid = [{ d: solidD, fill: true }];
    if (t >= 2) {
      // sand mound: visible shape stays 1px clear of the cap and the bulb sides
      const half = sw / 2;
      const yb = gb - 1 - half;
      const sx = (shw - sgi) - 1.6 - half;
      const sh = (gb - sm) * 0.5 - half;
      const heap = [[cx - sx, yb], ...qPts([cx - sx, yb], [cx, yb - sh * 2], [cx + sx, yb])];
      solid.push({ d: k.poly(toN(heap), { snap: false }), fill: true });
    }

    return { outline, solid };
  },
};
