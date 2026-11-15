import { pick } from '../lib/shapes.mjs';

// Points of an axis-aligned ellipse.
const ellPts = (cx, cy, rx, ry, n = 48) => Array.from({ length: n }, (_, i) => {
  const t = (i / n) * 2 * Math.PI;
  return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];
});
// Rounded rectangle as points (for k.bool).
const rrPts = (x0, y0, x1, y1, r, n = 6) => {
  const pts = [];
  const corner = (cx, cy, a0) => {
    for (let i = 0; i <= n; i++) {
      const a = ((a0 + (90 * i) / n) * Math.PI) / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  corner(x1 - r, y0 + r, -90);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, 90);
  corner(x0 + r, y0 + r, 180);
  return pts;
};

export default {
  id: 'pension-funds',
  name: 'Pension Funds',
  kind: 'asset-class',
  metaphor: 'piggy-bank',
  keywords: ['pension', 'retirement', 'fund'],
  reduction: 'Side-on piggy bank facing right: one silhouette of oval body, square snout and pointed ear, with two stub legs, a coin slot on the back and an eye. 16 and 20: no tail, the slot sits lower so it keeps 1.5px clear of the back, legs are short single strokes. 24+: a small curled tail is added on the left. 32 and 48: snout and ear a touch larger. Solid: body filled with the slot and eye knocked out; legs and tail stay plain strokes.',
  draw(k) {
    const small = k.tier <= 1;
    // Body
    const tailRoom = small ? 0 : 0.06;
    const cx = 0.46 + tailRoom / 2, cy = 0.55;
    const rx = pick(k, [0.4, 0.4, 0.37, 0.37, 0.37]), ry = 0.29;
    const bodyTop = (x) => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
    const bodyBot = (x) => cy + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));

    // Snout (right) and ear (top, towards the front)
    const sx1 = pick(k, [0.98, 0.98, 0.98, 0.98, 0.98]);
    const sh = pick(k, [0.11, 0.11, 0.105, 0.105, 0.1]);
    const sy = cy - 0.05;
    const snout = rrPts(cx + rx - 0.08, sy - sh, sx1, sy + sh, pick(k, [0.05, 0.05, 0.05, 0.045, 0.04]));
    const earX = cx + pick(k, [0.15, 0.15, 0.14, 0.14, 0.14]);
    const earW = pick(k, [0.1, 0.1, 0.09, 0.09, 0.085]);
    const earTip = [earX + 0.02, pick(k, [0.08, 0.08, 0.1, 0.1, 0.1])];
    const ear = [[earX - earW, bodyTop(earX - earW) + 0.06], earTip, [earX + earW, bodyTop(earX + earW) + 0.06]];

    const body = k.bool([k.ring(ellPts(cx, cy, rx, ry)), k.ring(snout), k.ring(ear)], []);

    // Legs: two stubs under the body
    const legBot = 0.97;
    const lx = [cx - rx * 0.5, cx + rx * 0.5];
    const legs = k.path(lx.flatMap((x) => [['M', x, bodyBot(x) - 0.02], ['V', legBot]]), { snap: false });

    // Coin slot on the back, clear of the top edge
    const slotX = cx - pick(k, [0.1, 0.09, 0.06, 0.06, 0.06]);
    const slotHalf = pick(k, [0.09, 0.095, 0.1, 0.1, 0.095]);
    const slotY = bodyTop(slotX) + k.gapN(1.5);
    const slot = k.path([['M', slotX - slotHalf, slotY], ['H', slotX + slotHalf]], { snap: false });

    // Eye
    const ex = cx + rx * 0.62, ey = cy - pick(k, [0.06, 0.06, 0.07, 0.07, 0.07]);
    const eye = k.path([['M', ex - 0.004, ey], ['H', ex + 0.004]], { snap: false });

    // Tail (24+)
    const tx = cx - rx;
    const tail = small ? null : k.path([
      ['M', tx + 0.01, cy - 0.04],
      ['C', tx - 0.04, cy - 0.06, tx - 0.06, cy - 0.12, tx - 0.02, cy - 0.15],
    ], { snap: false });

    const outline = [body, legs, slot, eye, ...(tail ? [tail] : [])];

    // Solid
    const slotHole = k.capsule(slotX - slotHalf, slotY + 0.01, slotX + slotHalf, slotY + 0.01, k.holeW(pick(k, [1.5, 1.5, 1.5, 2, 2.5])));
    const eyeHole = k.circle(ex, ey, k.holeN(pick(k, [1.5, 1.5, 1.75, 2, 2.75])) / 2);
    const solid = [
      { d: `${body} ${slotHole} ${eyeHole}`, fill: true },
      { d: legs, fill: false },
      ...(tail ? [{ d: tail, fill: false }] : []),
    ];
    return { outline, solid };
  },
};
