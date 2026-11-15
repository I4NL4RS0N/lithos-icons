import { pick } from '../lib/shapes.mjs';

export default {
  id: 'medical-devices',
  name: 'Medical Devices',
  kind: 'industry',
  parent: 'health-care',
  metaphor: 'stethoscope',
  keywords: ['medical devices', 'stethoscope', 'diagnostics'],
  reduction: 'Stethoscope at every size: ear tubes as a U with inward tips, a tube looping down and up into a round chest piece on the right. 16 and 20: chest piece slightly smaller and lower so it stays clear of the U; plain ring in outline, plain disc in solid. 24: solid gets a centre knockout. 32 and 48: outline adds an inner disc. Tubes stay live strokes in both styles; only the chest piece is filled in solid.',
  draw(k) {
    // Ear tubes: a U whose tops hook inwards to the ear tips.
    const xl = 0.04, xr = 0.52;
    const ux = (xl + xr) / 2, ur = (xr - xl) / 2, uy = 0.32;
    const ubot = uy + ur;
    const tip = 0.08;
    const U = k.path([
      ['M', xl + tip, 0.0], ['L', xl, 0.09], ['V', uy],
      ['A', ur, ur, 0, 0, 0, xr, uy],
      ['V', 0.09], ['L', xr - tip, 0.0],
    ], { snap: false });

    // Chest piece.
    const cr = pick(k, [0.18, 0.185, 0.19, 0.19, 0.19]);
    const cx = 1 - cr - 0.02, cy = pick(k, [0.64, 0.64, 0.63, 0.63, 0.63]);

    // Tube from the bottom of the U down, round and up into the chest piece.
    const tube = k.path([
      ['M', ux, ubot], ['V', 0.74],
      ['C', ux, 1.05, cx, 1.07, cx, cy + cr],
    ], { snap: false });

    const chest = k.circle(cx, cy, cr);
    const inner = k.tier >= 3 ? [k.circle(cx, cy, cr * 0.38)] : [];

    const solidChest = k.tier >= 2
      ? chest + k.circle(cx, cy, k.holeN(pick(k, [1.5, 1.5, 1.75, 2.25, 3])) / 2)
      : chest;

    return {
      outline: [U, tube, chest, ...inner],
      solid: [
        { d: U, fill: false },
        { d: tube, fill: false },
        { d: solidChest, fill: true },
      ],
    };
  },
};
