import { KEY } from '../../scripts/lib/kit.mjs';
import { pick, circlePts } from '../lib/shapes.mjs';

export default {
  id: 'sanctions-frozen-assets',
  name: 'Sanctions',
  kind: 'theme',
  metaphor: 'padlock',
  keywords: ['sanctions', 'frozen assets', 'asset freeze', 'export bans', 'secondary sanctions'],
  reduction: 'Closed padlock: a wide rounded body with a round shackle on top, at every size and in both styles. 16: body + shackle + a short vertical keyhole slot (both styles). 20 and 24: outline keeps the slot (a ring would clog); solid knocks out a round keyhole with a stem. 32 and 48: round keyhole with a stem in both styles. Solid: body filled with the keyhole knocked out; the shackle stays a plain stroke, so outline and solid share one footprint.',
  draw(k) {
    const t = k.tier;
    // Body: wide, sits on the bottom of the live area
    const x0 = 0.06, x1 = 0.94;
    const by0 = pick(k, [0.44, 0.44, 0.43, 0.43, 0.43]);
    const by1 = 0.99;
    const body = k.rrect(x0, by0, x1, by1, KEY.radius);

    // Shackle: half circle on two straight legs, legs end at body top
    const sr = pick(k, [0.25, 0.25, 0.25, 0.25, 0.24]);
    const scx = 0.5;
    const top = 0.03;
    const scy = top + sr;
    const shackle = k.path([
      ['M', scx - sr, by0],
      ['V', scy],
      ['A', sr, sr, 0, 0, 1, scx + sr, scy],
      ['V', by0],
    ], { snap: false });

    // Keyhole, centred in body
    const cy = (by0 + by1) / 2;
    let keyO, keyHole;
    if (t === 0) {
      const h = 0.08;
      keyO = [k.path([['M', 0.5, cy - h], ['V', cy + h]])];
      keyHole = k.capsule(0.5, cy - h, 0.5, cy + h, k.holeW(1.75));
    } else {
      const kr = pick(k, [0, 0.07, 0.065, 0.065, 0.06]);
      const ky = cy - pick(k, [0, 0.06, 0.06, 0.06, 0.06]);
      const stemEnd = cy + pick(k, [0, 0.14, 0.14, 0.14, 0.14]);
      // outline: a slot at 20/24 (a ring clogs there); ring + stem at 32+
      keyO = t <= 2
        ? [k.path([['M', 0.5, cy - 0.09], ['V', cy + 0.09]])]
        : [
          k.circle(0.5, ky, kr),
          k.path([['M', 0.5, ky + kr], ['V', stemEnd]], { snap: false }),
        ];
      // solid: round hole + stem as one knockout
      keyHole = k.bool(
        [k.ring(circlePts(0.5, ky, kr + k.grow)),
         k.fat([[0.5, ky], [0.5, stemEnd]], k.holeW(pick(k, [1.5, 1.5, 1.5, 1.75, 2.25])) / 2)],
        [],
      );
    }

    const outline = [body, shackle, ...keyO];
    const solid = [
      { d: `${body} ${keyHole}`, fill: true },
      { d: shackle, fill: false },
    ];
    return { outline, solid };
  },
};
