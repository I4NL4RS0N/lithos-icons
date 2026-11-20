import { pick } from '../lib/shapes.mjs';

export default {
  id: 'beverages',
  name: 'Beverages',
  kind: 'industry',
  parent: 'food-beverage',
  metaphor: 'bottle-glass',
  keywords: ['beverage', 'drinks', 'spirits', 'brewers', 'soft drinks'],
  reduction: 'Every size: a full-height bottle on the left and a stemmed glass on the right, kept apart by at least 1.25px of clear space. 16: bare bottle, no label. 20+: a label band across the bottle (two lines in outline, a knockout in solid). Solid: bottle and glass bowl filled, stem and foot stay strokes.',
  draw(k) {
    // A bottle with a stemmed glass beside it: the drinks trade, wine, beer and spirits alike.
    const P = (px) => px / k.L;
    const t = k.tier;

    // bottle
    const bx0 = 0.02;
    const bx1 = pick(k, [0.46, 0.45, 0.45, 0.45, 0.45]);
    const neckW = Math.max(P(2 * k.sw + 1.25), pick(k, [0.25, 0.22, 0.2, 0.18, 0.17]));
    const cx = (bx0 + bx1) / 2;
    const nx0 = cx - neckW / 2, nx1 = cx + neckW / 2;
    const ySh = pick(k, [0.52, 0.5, 0.5, 0.5, 0.5]); // where the straight body starts
    const yN = pick(k, [0.26, 0.24, 0.23, 0.23, 0.23]);    // where the neck starts
    const r = pick(k, [0.1, 0.1, 0.1, 0.09, 0.08]);
    const bottle = k.path([
      ['M', nx0, 0], ['H', nx1], ['V', yN],
      ['C', nx1, yN + 0.1, bx1, ySh - 0.1, bx1, ySh],
      ['V', 1 - r], ['Q', bx1, 1, bx1 - r, 1],
      ['H', bx0 + r], ['Q', bx0, 1, bx0, 1 - r],
      ['V', ySh],
      ['C', bx0, ySh - 0.1, nx0, yN + 0.1, nx0, yN],
      ['Z'],
    ], { snap: false });

    // glass
    const gap = k.gapN(pick(k, [1.25, 1.5, 1.5, 2, 3]));
    const gx0 = bx1 + gap, gx1 = 0.98;
    const gcx = (gx0 + gx1) / 2;
    const gy0 = pick(k, [0.3, 0.32, 0.35, 0.36, 0.36]);
    const gyb = pick(k, [0.72, 0.72, 0.72, 0.72, 0.72]);
    const w = gx1 - gx0;
    const bowl = k.path([
      ['M', gx0, gy0], ['H', gx1],
      ['C', gx1, gy0 + (gyb - gy0) * 0.75, gcx + w * 0.3, gyb, gcx, gyb],
      ['C', gcx - w * 0.3, gyb, gx0, gy0 + (gyb - gy0) * 0.75, gx0, gy0],
      ['Z'],
    ], { snap: false });
    const fw = pick(k, [0.15, 0.15, 0.15, 0.14, 0.14]);
    const stem = k.path([['M', gcx, gyb], ['V', 1], ['M', gcx - fw, 1], ['H', gcx + fw]], { snap: false });

    // label band (20+)
    const outline = [bottle, bowl, stem];
    const solid = [];
    let bottleSolid = bottle;
    if (t >= 1) {
      const la = pick(k, [0, 0.64, 0.64, 0.64, 0.64]);
      const lb = la + Math.max(k.gapN(1.75), pick(k, [0, 0.18, 0.18, 0.18, 0.18]));
      outline.push(k.path([['M', bx0, la], ['H', bx1], ['M', bx0, lb], ['H', bx1]], { snap: false }));
      const g = k.grow;
      const inset = P(pick(k, [0, 0.25, 0.25, 0.5, 0.75])); // visible wall = inset + one stroke
      bottleSolid += ' ' + k.rrect(bx0 + inset, la - g, bx1 - inset, lb + g, P(pick(k, [0, 0.5, 0.5, 0.75, 1])));
    }
    solid.push({ d: bottleSolid, fill: true }, { d: bowl, fill: true }, { d: stem, fill: false });
    return { outline, solid };
  },
};
