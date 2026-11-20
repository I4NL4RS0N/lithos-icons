import { pick } from '../lib/shapes.mjs';

// seal rim as points: a plain circle, or a gently scalloped one when `amp` > 0
const rimPts = (cx, cy, r, bumps, amp, n = 96) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * 2 * Math.PI - Math.PI / 2;
  const rr = r + (amp ? amp * Math.cos(a * bumps + Math.PI / 2 * bumps) : 0);
  return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
});

// same winding for every part so the union is clean
const cw = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; }
  return a > 0 ? pts : pts.slice().reverse();
};

export default {
  id: 'financial-guaranties',
  name: 'Financial Guaranties',
  kind: 'industry',
  parent: 'insurance',
  metaphor: 'rosette-seal',
  keywords: ['financial guaranty', 'bond insurer', 'monoline', 'credit enhancement'],
  reduction: 'Every size: a guarantee seal — a round badge at the top with two splayed ribbon tails with swallowtail-notched ends below, drawn as one silhouette, and a check mark centred in the badge. 16 and 20: plain round rim, wider tails. 24+: the rim is gently scalloped (12 bumps at 24, 14 at 32, 16 deeper ones at 48); tails get slimmer and notches shallower as the size grows. Solid: filled silhouette with the check knocked out (1.25px visible at 16, up to 3px at 48).',
  draw(k) {
    const L = k.L, P = (px) => px / L, t = k.tier, sw = k.sw;
    const cx = 0.5;
    const r = pick(k, [0.36, 0.355, 0.35, 0.345, 0.34]);
    const cy = r + P(pick(k, [0, 0, 0.45, 0.6, 0.9]));
    const [bumps, ampPx] = pick(k, [[0, 0], [0, 0], [12, 0.45], [14, 0.6], [16, 0.9]]);
    const amp = P(ampPx);

    // ribbon tails: from under the badge, splaying outward, swallowtail notch at the foot
    const [tw, splay, notch] = pick(k, [
      [0.22, 0.15, 0.12],
      [0.21, 0.15, 0.12],
      [0.2, 0.14, 0.11],
      [0.19, 0.14, 0.1],
      [0.18, 0.14, 0.09],
    ]);
    const yTop = cy + r * 0.3;
    const tail = (s) => {
      // s = -1 left, +1 right; inner top edge near the centre line
      const xi = cx + s * 0.03, xo = cx + s * (0.03 + tw);
      const bi = xi + s * splay, bo = xo + s * splay;
      const pts = [[xi, yTop], [xo, yTop], [bo, 1], [(bi + bo) / 2, 1 - notch], [bi, 1]];
      return cw(pts);
    };
    const rim = cw(rimPts(cx, cy, r, bumps, amp));
    const sil = k.bool([k.ring(rim), k.ring(tail(-1)), k.ring(tail(1))], []);

    // check mark centred in the badge
    const cs = pick(k, [0.95, 0.95, 0.95, 0.9, 0.9]);
    const ck = [
      [cx - 0.42 * r * cs, cy - 0.04 * r * cs],
      [cx - 0.12 * r * cs, cy + 0.26 * r * cs],
      [cx + 0.44 * r * cs, cy - 0.32 * r * cs],
    ];
    const outline = [sil, k.poly(ck, { closed: false, snap: false })];

    // solid: the check knocked out of the filled seal
    const holePx = pick(k, [1.25, 1.5, 1.75, 2.25, 3]);
    const solid = [{ d: sil + ' ' + k.offsetLine(ck, k.holeW(holePx) / 2), fill: true }];
    return { outline, solid };
  },
};
