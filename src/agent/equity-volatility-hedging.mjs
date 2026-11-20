import { pick } from '../lib/shapes.mjs';

// Dial: a circle cut by a flat chord at y = yc, sampled as points for k.bool.
function dialPts(cx, cy, R, yc, n = 72) {
  const h = Math.asin((yc - cy) / R); // angle of the chord ends below centre
  const a0 = Math.PI - h;              // bottom-left end
  const a1 = 2 * Math.PI + h;          // bottom-right end, going over the top
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * (a1 - a0);
    pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
  }
  return pts;
}

function ringPts(cx, cy, r, n = 24) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

const rad = (d) => (d * Math.PI) / 180;

export default {
  id: 'equity-volatility-hedging',
  name: 'Equity Volatility',
  kind: 'theme',
  metaphor: 'fear-gauge',
  keywords: ['volatility', 'VIX', 'hedging', 'options demand', 'correction'],
  reduction: 'The VIX "fear gauge": a round dial cut flat across the bottom, its needle swung hard over to the high end (upper right). 16: dial and needle only. 20+: a hub ring at the needle root. 24+: two rim ticks on the low (left) side; 32+: three. Solid: dial filled, needle, hub and ticks knocked out.',
  draw(k) {
    const cx = 0.5;
    const cy = 0.5;
    const R = 0.5;
    const yc = pick(k, [0.86, 0.86, 0.87, 0.87, 0.87]);
    const h = Math.asin((yc - cy) / R);
    const xc = R * Math.cos(h);

    const dial = k.path([
      ['M', cx - xc, yc], ['A', R, R, 0, 1, 1, cx + xc, yc], ['Z'],
    ], { snap: false });

    // Hub just below centre; needle swings to the upper right.
    const hy = pick(k, [0.58, 0.58, 0.57, 0.57, 0.57]);
    const ang = rad(-36);
    const nl = pick(k, [0.36, 0.34, 0.32, 0.33, 0.33]);
    const tip = [cx + nl * Math.cos(ang), hy + nl * Math.sin(ang)];
    const hubR = pick(k, [0, 0.075, 0.07, 0.065, 0.06]);
    const root = hubR ? [cx + hubR * Math.cos(ang), hy + hubR * Math.sin(ang)] : [cx, hy];
    const needle = k.path([['M', ...root], ['L', ...tip]], { snap: false });

    const outline = [dial, needle];
    if (hubR) outline.push(k.circle(cx, hy, hubR));

    // Low-side rim ticks (24+), measured from the dial centre.
    const ticks = [];
    if (k.tier >= 2) {
      const r1 = R - k.gapN(pick(k, [0, 0, 1.25, 1.5, 2]));
      const r0 = r1 - pick(k, [0, 0, 0.07, 0.075, 0.075]);
      const angs = k.tier >= 3 ? [-165, -132, -99] : [-160, -115];
      for (const dg of angs) {
        const a = rad(dg);
        ticks.push([[cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)], [cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)]]);
      }
      for (const t of ticks) outline.push(k.path([['M', ...t[0]], ['L', ...t[1]]], { snap: false }));
    }

    // Solid: dial filled; needle, hub and ticks knocked out.
    const nw = k.holeW(pick(k, [1.25, 1.5, 1.5, 2, 2.5])) / 2;
    const cuts = [k.fat([[cx, hy], tip], nw)];
    if (hubR) cuts.push(k.ring(ringPts(cx, hy, hubR + k.grow)));
    const tw = k.holeW(pick(k, [1, 1, 1.25, 1.5, 2])) / 2;
    for (const t of ticks) cuts.push(k.fat(t, tw));
    const solid = [{ d: k.bool([k.ring(dialPts(cx, cy, R, yc))], cuts), fill: true }];
    return { outline, solid };
  },
};
