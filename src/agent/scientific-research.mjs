import { pick } from '../lib/shapes.mjs';

export default {
  id: 'scientific-research',
  name: 'Scientific research and development',
  kind: 'industry',
  parent: 'professional-services',
  metaphor: 'microscope',
  keywords: ['research', 'R&D', 'laboratory', 'science', 'technical testing'],
  reduction: '16–20: straight tube, arm, stage and base. 24+: wider eyepiece collar on top of the tube. 32+: narrow objective below the tube.',
  draw(k) {
    // Tilted straight-sided tube as one closed silhouette; arm, stage and base are single strokes.
    const hw = Math.max(0.105, (2 * k.sw + 1.4) / 2 / k.L); // half tube width, normalized; stays open at 16
    const g = k.grow;
    const dir = [0.17, 0.46], n = Math.hypot(...dir), ux = dir[0] / n, uy = dir[1] / n;
    const nx = -uy, ny = ux, lift = (h) => h * Math.abs(ny); // rise of a corner above the axis point
    const onAxis = (y, x0, y0) => [x0 + ((y - y0) * ux) / uy, y];
    const rect = (p, q, h) => [
      [p[0] - nx * h, p[1] - ny * h], [p[0] + nx * h, p[1] + ny * h],
      [q[0] + nx * h, q[1] + ny * h], [q[0] - nx * h, q[1] - ny * h],
    ];
    const botY = pick(k, [0.55, 0.55, 0.56, 0.56, 0.56]);
    const top = [0.3, lift(hw) + 0.01], bot = onAxis(botY, top[0], top[1]);
    const parts = [k.ring(rect(top, bot, hw))];
    if (k.tier >= 2) {
      const cw = hw + pick(k, [0, 0, 1, 1.25, 1.75]) / k.L, cl = pick(k, [0, 0, 0.11, 0.1, 0.09]);
      const c0 = onAxis(lift(cw) + 0.01, top[0], top[1]), c1 = onAxis(c0[1] + cl * uy, top[0], top[1]);
      parts.push(k.ring(rect(c0, c1, cw)));
    }
    if (k.tier >= 3) {
      // objective: a narrower nose below the tube
      const ow = hw * 0.55, o1 = onAxis(botY + pick(k, [0, 0, 0, 0.05, 0.06]), top[0], top[1]);
      parts.push(k.ring(rect(onAxis(botY - 0.05, top[0], top[1]), o1, ow)));
    }
    const tube = k.bool(parts);
    // arm leaves the back of the tube a little above mid-height and curves down to the base
    const m = onAxis(0.3, top[0], top[1]);
    const arm = k.path([['M', m[0] - nx * hw, m[1] - ny * hw], ['C', 0.98, 0.3, 1.0, 0.8, 0.7, 0.98]], { snap: false });
    const stageY = 0.78;
    const stage = k.path([['M', 0.12, stageY], ['H', 0.62]]);
    const base = k.path([['M', 0.12, 0.98], ['H', 0.9]]);
    void g;
    return {
      outline: [tube, arm, stage, base],
      solid: [{ d: tube, fill: true }, { d: arm, fill: false }, { d: stage, fill: false }, { d: base, fill: false }],
    };
  },
};
