import { pick } from '../lib/shapes.mjs';

export default {
  id: 'labour-automation',
  name: 'Labour Automation',
  kind: 'theme',
  metaphor: 'robot-arm',
  keywords: ['automation', 'robotics', 'labour shortage', 'humanoid robots', 'productivity'],
  reduction: 'Industrial robot arm at every size: domed base on a floor line, upper arm rising to a round elbow joint, forearm reaching right to a two-jaw gripper pointing down. 16 and 20: base, elbow, two links and a square gripper only, with a taller dome and larger elbow so both stay open; solid elbow is a plain disc. 24: solid elbow gets a pivot knockout. 32 and 48: a pivot dot on the base and gripper jaws that turn inward at the tips.',
  draw(k) {
    const t = k.tier;

    // Base: a dome sitting on a floor line.
    const bx = 0.28, br = pick(k, [0.29, 0.28, 0.26, 0.25, 0.24]);
    const fy = 1.0;
    const floorL = 0.0, floorR = bx + br + pick(k, [0.06, 0.06, 0.07, 0.08, 0.08]);
    const dome = k.path([
      ['M', bx - br, fy],
      ['A', br, br, 0, 0, 1, bx + br, fy],
      ['Z'],
    ], { snap: false });
    const floor = k.path([['M', floorL, fy], ['H', floorR]], { snap: false });

    // Elbow joint.
    const er = pick(k, [0.155, 0.145, 0.135, 0.125, 0.12]);
    const ex = 0.4, ey = er + 0.01;

    // Gripper: a bracket opening downward, hung from the wrist.
    const gl = pick(k, [0.64, 0.65, 0.66, 0.66, 0.67]), gr = 1.0;
    const gy = pick(k, [0.56, 0.55, 0.54, 0.53, 0.53]);
    const jaw = pick(k, [0.84, 0.83, 0.82, 0.81, 0.8]);
    const wx = (gl + gr) / 2, wy = pick(k, [0.4, 0.4, 0.39, 0.38, 0.38]);

    const edge = (cx, cy, r, tx, ty) => {
      const dx = tx - cx, dy = ty - cy, d = Math.hypot(dx, dy);
      return [cx + (dx / d) * r, cy + (dy / d) * r];
    };

    // Upper arm: dome top to elbow.
    const sx = bx, sy = fy - br;
    const [e1x, e1y] = edge(ex, ey, er, sx, sy);
    const upper = k.path([['M', sx, sy], ['L', e1x, e1y]], { snap: false });

    // Forearm: elbow to wrist, then down to the gripper.
    const [e2x, e2y] = edge(ex, ey, er, wx, wy);
    const fore = k.path([['M', e2x, e2y], ['L', wx, wy], ['V', gy]], { snap: false });

    const elbow = k.circle(ex, ey, er);

    const tip = t >= 3 ? 0.05 : 0;
    const gripSegs = [['M', gl + tip, jaw]];
    if (tip) gripSegs.push(['L', gl, jaw - tip]);
    gripSegs.push(['V', gy], ['H', gr], ['V', jaw - tip]);
    if (tip) gripSegs.push(['L', gr - tip, jaw]);
    const grip = k.path(gripSegs, { snap: false });

    const pivotY = fy - br * 0.45;
    const extraOutline = t >= 3
      ? [k.path([['M', bx - 0.004, pivotY], ['H', bx + 0.004]], { snap: false })]
      : [];

    const solidElbow = t >= 2
      ? elbow + k.circle(ex, ey, k.holeN(pick(k, [1.5, 1.5, 1.5, 2, 2.75])) / 2)
      : elbow;
    const solidDome = t >= 3
      ? dome + k.circle(bx, pivotY, k.holeN(pick(k, [1.5, 1.5, 1.5, 1.75, 2.5])) / 2)
      : dome;

    return {
      outline: [floor, dome, upper, fore, elbow, grip, ...extraOutline],
      solid: [
        { d: floor, fill: false },
        { d: solidDome, fill: true },
        { d: upper, fill: false },
        { d: fore, fill: false },
        { d: solidElbow, fill: true },
        { d: grip, fill: false },
      ],
    };
  },
};
