import { pick } from '../lib/shapes.mjs';

export default {
  id: 'climate-risk',
  name: 'Climate Risk',
  kind: 'theme',
  metaphor: 'thermometer-arrow',
  keywords: ['climate risk', 'physical risk', 'transition risk', 'extreme weather', 'net zero'],
  reduction: 'Thermometer (round-topped stem on a round bulb) with a rising arrow beside it, at every size. 16 and 20: plain thermometer silhouette, no interior; solid is a filled silhouette. 24: solid cuts the empty glass above the mercury out of the stem. 32 and 48: outline adds the mercury column ending in a dot in the bulb; solid keeps the stem cut.',
  draw(k) {
    // Thermometer: stem of half-width w on a round bulb.
    const cx = 0.31;
    const w = pick(k, [0.15, 0.15, 0.145, 0.14, 0.135]);
    const r = 0.25;
    const by = 1 - r;            // bulb centre, bottom touches 1
    const top = 0;
    const yj = by - Math.sqrt(r * r - w * w);
    const therm = k.path([
      ['M', cx - w, yj], ['V', top + w],
      ['A', w, w, 0, 0, 1, cx + w, top + w],
      ['V', yj],
      ['A', r, r, 0, 1, 1, cx - w, yj],
      ['Z'],
    ], { snap: false });

    // Rising arrow on the right.
    const ax = 0.83, aTop = 0.03, aBot = pick(k, [0.72, 0.74, 0.76, 0.78, 0.8]);
    const head = pick(k, [0.165, 0.165, 0.165, 0.16, 0.15]);
    const shaft = k.path([['M', ax, aBot], ['V', aTop]], { snap: false });
    const tip = k.path([['M', ax - head, aTop + head], ['L', ax, aTop], ['L', ax + head, aTop + head]], { snap: false });

    // Interior detail at 32+ (outline): mercury column ending in a dot in the bulb.
    const merc = [];
    if (k.tier >= 3) {
      const d = (k.sw / k.L) * 0.5;
      merc.push(k.path([['M', cx, by], ['V', 0.4]], { snap: false }));
      merc.push(k.circle(cx, by, d));
    }

    // Solid: knock out the empty glass above the mercury at 24+.
    let solidTherm = therm;
    if (k.tier >= 2) {
      const hw = k.holeW(pick(k, [1.5, 1.5, 1.75, 2.25, 3]));
      solidTherm += k.capsule(cx, top + w, cx, pick(k, [0.4, 0.4, 0.38, 0.36, 0.36]), hw);
    }

    return {
      outline: [therm, ...merc, shaft, tip],
      solid: [
        { d: solidTherm, fill: true },
        { d: shaft, fill: false },
        { d: tip, fill: false },
      ],
    };
  },
};
