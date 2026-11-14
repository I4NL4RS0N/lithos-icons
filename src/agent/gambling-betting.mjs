import { pick } from '../lib/shapes.mjs';

export default {
  id: 'gambling-betting',
  name: 'Gambling and betting activities',
  kind: 'industry',
  parent: 'arts-recreation',
  metaphor: 'tilted-die',
  keywords: ['gambling', 'betting', 'casino', 'lottery', 'gaming'],
  reduction: '16 and 20: the three face (three pips on one diagonal, about 2.25px and 2.7px dots with wide gaps), a lighter 10-11 degree tilt and a slightly larger body so edges stay crisp and the footprint matches siblings. 24 up: the five face at a 14 degree tilt, pips growing to 4px at 48. Solid: pips are knockouts sized per size.',
  draw(k) {
    // One die, turned so it reads as a thrown die and not a square button.
    const ang = (-pick(k, [10, 11, 14, 14, 14]) * Math.PI) / 180, ca = Math.cos(ang), sa = Math.sin(ang);
    const rot = (x, y) => [0.5 + x * ca - y * sa, 0.5 + x * sa + y * ca];
    const s = pick(k, [0.93, 0.92, 0.88, 0.88, 0.88]) / 2; // half side; rotated extent stays near 0..1
    const r = 0.15;
    const e = s - r;
    const die = k.path([
      ['M', ...rot(-e, -s)], ['L', ...rot(e, -s)], ['A', r, r, 0, 0, 1, ...rot(s, -e)],
      ['L', ...rot(s, e)], ['A', r, r, 0, 0, 1, ...rot(e, s)],
      ['L', ...rot(-e, s)], ['A', r, r, 0, 0, 1, ...rot(-s, e)],
      ['L', ...rot(-s, -e)], ['A', r, r, 0, 0, 1, ...rot(-e, -s)], ['Z'],
    ], { snap: false });

    const o = pick(k, [0.23, 0.23, 0.22, 0.22, 0.22]); // pip offset from centre
    // 16/20: the three face (one diagonal) so pips stay well apart; 24 up: the five face
    const face = k.tier < 2
      ? [[o, -o], [0, 0], [-o, o]]
      : [[-o, -o], [o, -o], [0, 0], [-o, o], [o, o]];
    const pips = face.map(([x, y]) => rot(x, y));

    // pip = tiny stroked circle whose radius stays under half a stroke, so it renders as a solid dot
    const grow = Math.min(pick(k, [0.5, 0.6, 0.75, 1.0, 1.35]), k.sw * 0.46) / k.L;
    const pip = ([x, y]) => k.circle(x, y, grow);

    const holeR = k.holeN(pick(k, [2.5, 3, 2.75, 3.5, 4.75])) / 2;
    const holes = pips.map(([x, y]) => k.circle(x, y, holeR)).join(' ');

    return {
      outline: [die, ...pips.map(pip)],
      solid: [{ d: `${die} ${holes}`, fill: true }],
    };
  },
};
