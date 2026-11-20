import { pick } from '../lib/shapes.mjs';

export default {
  id: 'ai-capex-buildout',
  name: 'AI Capex Buildout',
  kind: 'theme',
  metaphor: 'gpu-card',
  keywords: ['AI capex', 'AI buildout', 'data center spending', 'hyperscaler spending', 'AI bubble'],
  reduction: 'Every size: an AI graphics card seen side-on: a tall card body with one large cooling fan at the right, a stack of heatsink fin slots at the left, the PC bracket (with its top screw tab) running past the body above and below, and the edge connector under the body. 16: fan hub is a dot, two wide-spaced fins; 20-24: hub dot, three fins; 32-48: hub ring, four fins, keyed connector. Solid: body filled, fan and fins cut out, hub filled inside the fan, connector a separate filled strip with a 1px gap from the body.',
  draw(k) {
    const bx = pick(k, [0.08, 0.08, 0.07, 0.06, 0.05]); // bracket line = card's left edge
    const x1 = 1;
    const y0 = pick(k, [0.1, 0.1, 0.1, 0.1, 0.1]);
    const y1 = pick(k, [0.82, 0.8, 0.8, 0.8, 0.8]);
    const r = pick(k, [0.12, 0.12, 0.12, 0.11, 0.1]);

    const body = k.path([
      ['M', bx, y0], ['H', x1 - r], ['Q', x1, y0, x1, y0 + r],
      ['V', y1 - r], ['Q', x1, y1, x1 - r, y1], ['H', bx], ['Z'],
    ]);
    // bracket: screw tab bent out at the top, tongue running down past the body
    const bracket = k.path([['M', 0, 0], ['H', bx], ['V', 1]]);

    // edge connector
    const c0 = pick(k, [0.36, 0.36, 0.36, 0.34, 0.32]);
    const c1 = pick(k, [0.86, 0.86, 0.86, 0.86, 0.86]);
    const cy = pick(k, [0.98, 0.97, 0.96, 0.95, 0.94]);
    const notch = k.tier >= 3; // key notch in the connector
    const n0 = c0 + 0.24 * (c1 - c0);
    const nw = k.gapN(1);

    // fan: concentric with the rounded right end
    const half = (y1 - y0) / 2;
    const fy = y0 + half;
    const fr = half - k.gapN(pick(k, [1, 1.25, 1.5, 2, 2.5]));
    const fx = x1 - half;

    // heatsink fins: short horizontal slots between bracket and fan
    const fins = pick(k, [2, 3, 3, 4, 4]);
    const side = k.gapN(1);
    const fl = bx + side;
    const frt = fx - fr - side;
    const pitch = k.gapN(pick(k, [2, 1, 1.25, 1.5, 2]));
    const fys = [];
    for (let i = 0; i < fins; i++) fys.push(fy + (i - (fins - 1) / 2) * pitch);

    const dot = (x, y) => k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false });

    // ---------- outline ----------
    const conn = notch
      ? k.path([['M', c0, y1], ['V', cy], ['H', n0], ['M', n0 + nw, cy], ['H', c1], ['V', y1]])
      : k.path([['M', c0, y1], ['V', cy], ['H', c1], ['V', y1]]);
    const outline = [body, bracket, conn, k.circle(fx, fy, fr)];
    for (const y of fys) outline.push(k.path([['M', fl, y], ['H', frt]]));
    if (k.tier <= 2) outline.push(dot(fx, fy));
    else outline.push(k.circle(fx, fy, pick(k, [0, 0, 0, 0.06, 0.06])));

    // ---------- solid ----------
    let holes = ' ' + k.circle(fx, fy, fr + k.grow);
    for (const y of fys) holes += ' ' + k.capsule(fl, y, frt, y, k.holeW(1));
    const solid = [{ d: body + holes, fill: true }, { d: bracket, fill: false }];

    // hub filled inside the fan hole
    const hubVis = pick(k, [2.25, 2.75, 3.25, 4.5, 6]) / k.L; // visible diameter
    solid.push({ d: k.circle(fx, fy, Math.max(hubVis / 2 - k.grow, 0.004)), fill: true });

    // connector strip, separated from the body
    const ty = Math.min(y1 + k.gapN(1), cy);
    const strip = (a, b) => (ty < cy - 0.005
      ? { d: k.path([['M', a, ty], ['H', b], ['V', cy], ['H', a], ['Z']]), fill: true }
      : { d: k.path([['M', a, cy], ['H', b]]), fill: false });
    if (notch) { solid.push(strip(c0, n0)); solid.push(strip(n0 + nw, c1)); }
    else solid.push(strip(c0, c1));

    return { outline, solid };
  },
};
