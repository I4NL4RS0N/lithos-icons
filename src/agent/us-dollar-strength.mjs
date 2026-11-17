import { pick } from '../lib/shapes.mjs';

export default {
  id: 'us-dollar-strength',
  name: 'US Dollar Strength',
  kind: 'theme',
  metaphor: 'note-uptrend',
  keywords: ['dollar rally', 'strong dollar', 'DXY', 'greenback', 'dollar index'],
  reduction: 'A wide landscape banknote across the bottom (rounded bill with a round centre medallion) under a rising zig-zag trend arrow that runs from the left edge to the top-right corner. No currency symbol. 16: bill, medallion and a two-step trend line. 20+: two small dots either side of the medallion. Solid: bill filled with the medallion and dots knocked out; the trend arrow stays a plain stroke.',
  draw(k) {
    // Banknote: wide landscape bill across the bottom
    const nx0 = 0, nx1 = 1;
    const ny0 = pick(k, [0.45, 0.45, 0.46, 0.47, 0.48]);
    const ny1 = pick(k, [0.98, 0.97, 0.96, 0.96, 0.96]);
    const r = pick(k, [0.1, 0.11, 0.12, 0.12, 0.12]);
    const note = k.rrect(nx0, ny0, nx1, ny1, r);
    const mcx = 0.5, mcy = (ny0 + ny1) / 2;
    const mr = pick(k, [0.12, 0.115, 0.115, 0.105, 0.1]);
    const medallion = k.circle(mcx, mcy, mr);
    const showDots = k.tier >= 1;
    const dx = pick(k, [0, 0.17, 0.17, 0.16, 0.15]);
    const dot = (x, y) => k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false });
    const dots = showDots ? [dot(nx0 + dx, mcy), dot(nx1 - dx, mcy)] : [];

    // Rising trend arrow above the bill
    const low = ny0 - pick(k, [0.19, 0.18, 0.17, 0.16, 0.15]);
    const tip = [0.96, pick(k, [0.07, 0.065, 0.06, 0.06, 0.055])];
    const trend = [
      [0.03, low],
      [pick(k, [0.38, 0.36, 0.36, 0.36, 0.36]), pick(k, [0.1, 0.13, 0.13, 0.14, 0.15])],
      [pick(k, [0.58, 0.56, 0.56, 0.56, 0.56]), pick(k, [0.23, 0.25, 0.26, 0.27, 0.28])],
      tip,
    ];
    const line = k.poly(trend, { closed: false, snap: false });
    // Arrowhead: two wings at ±42° around the last segment's direction
    const hl = pick(k, [0.25, 0.22, 0.2, 0.19, 0.18]);
    const [px, py] = trend[2];
    const ang = Math.atan2(py - tip[1], px - tip[0]);
    const wa = (42 * Math.PI) / 180;
    const w1 = [tip[0] + hl * Math.cos(ang - wa), tip[1] + hl * Math.sin(ang - wa)];
    const w2 = [tip[0] + hl * Math.cos(ang + wa), tip[1] + hl * Math.sin(ang + wa)];
    const head = k.path([['M', ...w1], ['L', ...tip], ['L', ...w2]], { snap: false });

    const outline = [note, medallion, ...dots, line, head];

    // Solid: bill filled, medallion and dots knocked out; arrow stays a stroke
    const hole = k.circle(mcx, mcy, mr + k.grow);
    const dh = k.holeN(pick(k, [0, 1.5, 1.75, 2.25, 3])) / 2;
    const dotHoles = showDots ? [k.circle(nx0 + dx, mcy, dh), k.circle(nx1 - dx, mcy, dh)] : [];
    const solid = [
      { d: [note, hole, ...dotHoles].join(' '), fill: true },
      { d: line, fill: false },
      { d: head, fill: false },
    ];
    return { outline, solid };
  },
};
