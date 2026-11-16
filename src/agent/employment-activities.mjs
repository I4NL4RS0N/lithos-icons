import { KEY } from '../../scripts/lib/kit.mjs';
import { pick, circlePts } from '../lib/shapes.mjs';

// rounded rectangle as points, for k.bool
const rrectPts = (x0, y0, x1, y1, r, n = 8) => {
  const out = [];
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  return out;
};

// upper half of an ellipse, closed by a straight base
const domePts = (cx, base, rx, ry, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const a = Math.PI + (i / n) * Math.PI;
  return [cx + rx * Math.cos(a), base + ry * Math.sin(a)];
});

export default {
  id: 'employment-activities',
  name: 'Employment Services',
  kind: 'industry',
  parent: 'professional-services',
  metaphor: 'id-badge',
  keywords: ['staffing', 'recruitment', 'temp agencies', 'employment services'],
  reduction: 'Every size: portrait badge, clip slot, head and shoulders. 16–20: head and shoulders larger relative to the card with tighter (but at least 1px) gaps; 32–48: wider gaps and a smaller head. Solid: slot, head and shoulders are knockouts; a bar of at least one stroke stays under the shoulders.',
  draw(k) {
    // A staff ID badge: portrait card with a clip slot at the top and the holder's head and shoulders.
    const x0 = 0.12, x1 = 0.88, y0 = 0.02, y1 = 1.0, r = KEY.radius;
    const card = k.rrect(x0, y0, x1, y1, r);

    const slotY = pick(k, [0.2, 0.19, 0.19, 0.18, 0.17]), sx = pick(k, [0.12, 0.12, 0.12, 0.11, 0.1]);
    const slot = k.path([['M', 0.5 - sx, slotY], ['H', 0.5 + sx]]);

    const gap = k.gapN(pick(k, [1, 1.1, 1.25, 1.75, 2.5])); // centre-to-centre spacing between parts
    const hr = pick(k, [0.125, 0.12, 0.115, 0.11, 0.105]);
    const hy = slotY + gap + hr;
    const sTop = hy + hr + gap;
    const sw = pick(k, [0.25, 0.25, 0.24, 0.23, 0.22]); // shoulder half-width
    const head = k.circle(0.5, hy, hr);
    const shoulders = k.path([['M', 0.5 - sw, y1], ['A', sw, y1 - sTop, 0, 0, 1, 0.5 + sw, y1]], { snap: false });

    // solid: one silhouette; cuts are grown by half a stroke so the visible holes match the outline parts
    const g = k.grow;
    const base = y1 - pick(k, [0.75, 0.75, 0.75, 1, 1.5]) / k.L; // thin bar under the shoulders keeps the card closed
    const solid = k.bool(
      [k.ring(rrectPts(x0, y0, x1, y1, r))],
      [
        k.fat([[0.5 - sx, slotY], [0.5 + sx, slotY]], k.holeW(1.5) / 2),
        k.ring(circlePts(0.5, hy, hr + g, 40)),
        k.ring(domePts(0.5, base, sw + g, base - sTop + g)),
      ],
    );

    return {
      outline: [card, slot, head, shoulders],
      solid: [{ d: solid, fill: true }],
    };
  },
};
