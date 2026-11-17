import { KEY } from '../../scripts/lib/kit.mjs';
import { pick } from '../lib/shapes.mjs';

export default {
  id: 'accounting-services',
  name: 'Accounting Services',
  kind: 'industry',
  parent: 'professional-services',
  metaphor: 'calculator',
  keywords: ['accounting', 'audit', 'bookkeeping', 'tax services'],
  reduction: 'Portrait body with a display window and round keys at every size. 16: 2×2 keys. 20: 3×2. 24+: 3×3. Outline keys are dots; in solid, keys and display are knockouts with spacing set per size so they never merge.',
  draw(k) {
    // A desk calculator: portrait body, a display window across the top and a grid of round keys.
    // Layout numbers are in pixels of the live area so every size is spaced on its own.
    const P = (px) => px / k.L;
    const body = k.rrect(0.12, 0, 0.88, 1, KEY.radius);
    const grid = (cols, rows, dx, ys) => {
      const out = [];
      for (const y of ys) for (let i = 0; i < cols; i++) out.push([0.5 + P((i - (cols - 1) / 2) * dx), P(y)]);
      return out;
    };

    // outline: [display top, display bottom, columns, column spacing, row centres] — stroke centres, px
    const [dT, dB, oc, cdx, rowsO] = pick(k, [
      [2.75, 6, 2, 4.5, [8.75, 11.5]],
      [3, 7, 3, 3.5, [10.5, 14]],
      [3, 7.25, 3, 3.75, [10.5, 13.75, 17]],
      [4.25, 10, 3, 5, [14.5, 18.75, 23]],
      [6, 15, 3, 7, [22, 29, 36]],
    ]);
    const keysO = grid(oc, rowsO.length, cdx, rowsO);
    const dw = P(((oc - 1) / 2) * cdx + k.sw / 2); // window reaches the outer edges of the key dots
    const display = k.rrect(0.5 - dw, P(dT), 0.5 + dw, P(dB), P(pick(k, [0.5, 0.6, 0.75, 1, 1.5])));
    const dot = ([x, y]) => k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false });

    // solid: visible sizes in px — [display top, display height, gap, key diameter, key gap, cols, rows]
    const [sT, sH, sG, kd, kg, sc, sr] = pick(k, [
      [2, 2.25, 1.5, 2.25, 1.75, 2, 2],
      [2.75, 2.5, 2.5, 2.5, 2, 3, 2],
      [2.75, 2.5, 1.75, 2.25, 1.75, 3, 3],
      [4, 3.5, 3, 3, 2.5, 3, 3],
      [5.5, 5.5, 4.5, 4.5, 3.75, 3, 3],
    ]);
    const half = k.sw / 2; // the fill's edge stroke eats this much off each side of a hole
    const step = kd + kg;
    const ys = Array.from({ length: sr }, (_, i) => sT + sH + sG + kd / 2 + i * step);
    const spanX = ((sc - 1) * step + kd) / 2; // half the visible width of the key grid
    const dHole = k.rrect(0.5 - P(spanX + half), P(sT - half), 0.5 + P(spanX + half), P(sT + sH + half), P(0.5 + half));
    const kHole = ([x, y]) => k.circle(x, y, P(kd / 2 + half));
    const solid = [body, dHole, ...grid(sc, sr, step, ys).map(kHole)].join(' ');

    return {
      outline: [body, display, ...keysO.map(dot)],
      solid: [{ d: solid, fill: true }],
    };
  },
};
