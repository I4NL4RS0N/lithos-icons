import { pick, quadPts, circlePts } from '../lib/shapes.mjs';

export default {
  id: 'rental-leasing',
  name: 'Rental & Leasing',
  kind: 'industry',
  parent: 'administrative-services',
  metaphor: 'key-tag',
  keywords: ['rental', 'leasing', 'equipment hire'],
  reduction: 'Key standing upright on the right (ring bow, shaft, two teeth) with a luggage-style tag tied to its bow by a curved cord on the left. 16: tag is a plain shape with no eyelet; bow slightly larger and teeth spaced wider so they stay apart. 20+: the tag gets an eyelet (a dot in outline, a knocked-out hole in solid). Solid: bow and tag filled, bow hole and eyelet knocked out; shaft, teeth and cord stay strokes.',
  draw(k) {
    // Key: ring bow, shaft, two teeth.
    const bx = 0.69, by = pick(k, [0.22, 0.22, 0.22, 0.21, 0.21]);
    const br = pick(k, [0.2, 0.19, 0.19, 0.18, 0.18]);
    const shaftTop = by + br, shaftBot = 0.98;
    const t1 = pick(k, [0.74, 0.76, 0.77, 0.79, 0.8]);
    const tw = pick(k, [0.17, 0.16, 0.15, 0.15, 0.15]);
    const teeth = k.path([
      ['M', bx, t1], ['H', bx + tw],
      ['M', bx, shaftBot], ['H', bx + tw * 0.8],
    ]);
    const shaft = k.path([['M', bx, shaftTop], ['V', shaftBot]]);
    const bow = k.circle(bx, by, br);

    // Tag: portrait, pointed top end, rounded base.
    const x0 = 0.05, x1 = 0.41, yt = 0.42, ys = yt + 0.13, yb = 0.98;
    const tx = (x0 + x1) / 2, r = 0.1;
    const tag = k.path([
      ['M', tx - 0.07, yt], ['L', tx + 0.07, yt], ['L', x1, ys],
      ['V', yb - r], ['Q', x1, yb, x1 - r, yb],
      ['H', x0 + r], ['Q', x0, yb, x0, yb - r],
      ['V', ys], ['Z'],
    ], { snap: false });
    const tagPts = [
      [tx - 0.07, yt], [tx + 0.07, yt], [x1, ys],
      ...quadPts([x1, yb - r], [x1, yb], [x1 - r, yb], 8),
      ...quadPts([x0 + r, yb], [x0, yb], [x0, yb - r], 8),
      [x0, ys],
    ];

    // Cord from the tag's top into the bow.
    const cord = k.path([['M', tx, yt], ['Q', tx, by, bx - br, by]], { snap: false });

    // Eyelet (20+).
    const eyelet = k.tier >= 1;
    const hy = yt + 0.1;

    const outline = [bow, shaft, teeth, tag, cord];
    if (eyelet) outline.push(k.path([['M', tx - 0.004, hy], ['H', tx + 0.004]], { snap: false }));

    // Solid.
    const bowHole = k.circle(bx, by, k.holeN(pick(k, [2, 2.5, 3, 4, 6])) / 2);
    const tagSolid = eyelet
      ? k.bool([k.ring(tagPts)], [k.ring(circlePts(tx, hy, k.holeN(pick(k, [0, 1.5, 1.75, 2.25, 3])) / 2, 24))])
      : k.bool([k.ring(tagPts)], []);

    return {
      outline,
      solid: [
        { d: bow + ' ' + bowHole, fill: true },
        { d: shaft, fill: false },
        { d: teeth, fill: false },
        { d: tagSolid, fill: true },
        { d: cord, fill: false },
      ],
    };
  },
};
