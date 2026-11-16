import { KEY } from '../../scripts/lib/kit.mjs';
import { pick } from '../lib/shapes.mjs';

export default {
  id: 'private-credit',
  name: 'Private Credit',
  kind: 'theme',
  metaphor: 'safe',
  keywords: ['private credit', 'direct lending', 'shadow banking', 'risk transfer', 'non-bank lenders'],
  reduction: 'Front of a strongbox safe on two feet: a combination dial (ring with a centre hub) left of centre and a vertical lever handle to its right, at every size and in both styles. 16 and 20: body, feet, dial ring + hub, handle. 24+: adds three short tick marks (top, left, bottom) around the dial. Solid: body filled with the dial ring, handle and (24+) ticks knocked out; feet stay plain strokes, so outline and solid share one footprint.',
  draw(k) {
    const t = k.tier;
    const x0 = 0.03, x1 = 0.97;
    const y0 = 0.02;
    const y1 = pick(k, [0.84, 0.85, 0.86, 0.87, 0.88]);
    const body = k.rrect(x0, y0, x1, y1, KEY.radius);

    // Feet
    const fy = 0.99;
    const fi = pick(k, [0.18, 0.18, 0.17, 0.16, 0.15]);
    const feet = k.path([
      ['M', x0 + fi, y1], ['V', fy],
      ['M', x1 - fi, y1], ['V', fy],
    ]);

    // Dial, left of centre
    const cy = (y0 + y1) / 2;
    const r = pick(k, [0.2, 0.19, 0.17, 0.17, 0.16]);
    const cx = pick(k, [0.4, 0.4, 0.43, 0.43, 0.43]);
    const dial = k.circle(cx, cy, r);
    const hub = k.path([['M', cx - 0.004, cy], ['H', cx + 0.004]], { snap: false });

    // Lever handle, right of dial
    const hx = pick(k, [0.78, 0.78, 0.8, 0.8, 0.8]);
    const hh = pick(k, [0.15, 0.15, 0.14, 0.14, 0.13]);
    const handle = k.path([['M', hx, cy - hh], ['V', cy + hh]]);

    // Ticks (24+)
    const a = r + k.gapN(pick(k, [1.5, 1.5, 1.25, 1.5, 2]));
    const b = a + 0.055;
    const tickSegs = [
      [cx, cy - a, cx, cy - b],
      [cx, cy + a, cx, cy + b],
      [cx - a, cy, cx - b, cy],
    ];
    const ticks = t >= 2
      ? k.path(tickSegs.flatMap(([p, q, u, v]) => [['M', p, q], ['L', u, v]]), { snap: false })
      : null;

    const outline = [body, feet, dial, hub, handle, ...(ticks ? [ticks] : [])];

    // Solid: knock out ring, handle and ticks
    const band = k.holeN(pick(k, [1.5, 1.5, 1.5, 2, 2.75])) / 2;
    const ringHole = `${k.circle(cx, cy, r + band)} ${k.circle(cx, cy, r - band)}`;
    const hw = k.holeW(pick(k, [1.5, 1.5, 1.5, 2, 2.75]));
    const handleHole = k.capsule(hx, cy - hh, hx, cy + hh, hw);
    let tickHoles = '';
    if (t >= 2) {
      const tw = k.holeW(pick(k, [1, 1, 1.5, 1.75, 2.25]));
      const visOuter = r + band - k.grow;
      const tickVisR = tw / 2 / k.L - k.grow;
      const sa = visOuter + pick(k, [1, 1, 1, 1.25, 1.75]) / k.L + tickVisR;
      const sb = sa + pick(k, [0, 0, 0.045, 0.05, 0.055]);
      tickHoles = [
        k.capsule(cx, cy - sb, cx, cy - sa, tw),
        k.capsule(cx, cy + sa, cx, cy + sb, tw),
        k.capsule(cx - sb, cy, cx - sa, cy, tw),
      ].join(' ');
    }
    const solid = [
      { d: `${body} ${ringHole} ${handleHole} ${tickHoles}`, fill: true },
      { d: feet, fill: false },
    ];
    return { outline, solid };
  },
};
