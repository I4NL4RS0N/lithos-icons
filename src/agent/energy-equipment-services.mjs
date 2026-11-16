import { pick } from '../lib/shapes.mjs';

export default {
  id: 'energy-equipment-services',
  name: 'Energy Equipment & Services',
  kind: 'industry',
  parent: 'oil-gas',
  metaphor: 'drilling-rig',
  keywords: ['oilfield services', 'drilling', 'energy equipment', 'rigs'],
  reduction: 'Every size: a land drilling rig: a wide substructure block (rig floor) carrying a tapering lattice derrick with a crown bar on top. 16 to 24: one girt with a single X brace below it, the derrick head left open. 32 and 48: a second girt with a short X above the first, and a drill-floor opening in the substructure. Solid: the substructure and crown are filled; the derrick stays live strokes.',
  draw(k) {
    const t = k.tier;
    // Substructure (rig floor) across the bottom.
    const sy = pick(k, [0.73, 0.74, 0.76, 0.77, 0.78]);
    const sub = k.rrect(0.04, sy, 0.96, 1.0, pick(k, [0.06, 0.06, 0.07, 0.07, 0.07]));

    // Derrick legs from the floor up to the crown.
    const top = 0.04;
    const bl = pick(k, [0.2, 0.2, 0.2, 0.2, 0.2]), tl = pick(k, [0.4, 0.4, 0.41, 0.41, 0.42]);
    const legX = (y, left) => {
      const x = bl + (tl - bl) * ((sy - y) / (sy - top));
      return left ? x : 1 - x;
    };
    const legs = k.path([['M', bl, sy], ['L', tl, top], ['M', 1 - bl, sy], ['L', 1 - tl, top]], { snap: false });

    // Crown bar on top, wider than the derrick head.
    const cw = pick(k, [0.2, 0.2, 0.19, 0.18, 0.18]);
    const crown = k.path([['M', 0.5 - cw, top], ['H', 0.5 + cw]]);

    // Girt and X bracing.
    const gy = pick(k, [0.36, 0.36, 0.4, 0.4, 0.42]);
    const girts = [gy];
    const xs = [[gy, sy]];
    if (t >= 3) xs.push([top + 0.12, gy]);
    if (t >= 3) girts.push(top + 0.12);
    const girtD = girts.map((y) => k.path([['M', legX(y, true), y], ['L', legX(y, false), y]], { snap: false }));
    const xD = xs.map(([y0, y1]) => k.path([
      ['M', legX(y0, true), y0], ['L', legX(y1, false), y1],
      ['M', legX(y0, false), y0], ['L', legX(y1, true), y1],
    ], { snap: false }));

    // Drill-floor opening (32, 48).
    const hole = t >= 3 ? [k.path([['M', 0.4, (sy + 1) / 2], ['H', 0.6]])] : [];
    const holeCut = t >= 3 ? ' ' + k.capsule(0.4, (sy + 1) / 2, 0.6, (sy + 1) / 2, k.holeW(pick(k, [1.5, 1.5, 1.5, 2, 2.5]))) : '';

    const strokes = [legs, crown, ...girtD, ...xD];
    return {
      outline: [sub, ...strokes, ...hole],
      solid: [
        { d: sub + holeCut, fill: true },
        ...strokes.map((d) => ({ d, fill: false })),
      ],
    };
  },
};
