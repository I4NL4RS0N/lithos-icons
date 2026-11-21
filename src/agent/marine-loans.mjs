import { pick } from '../lib/shapes.mjs';

export default {
  id: 'marine-loans',
  name: 'Marine Loans',
  kind: 'industry',
  parent: 'abs',
  metaphor: 'sailboat',
  keywords: ['boat loans', 'marine finance', 'yacht finance', 'recreational vessel ABS'],
  reduction: 'Every size: a sailboat — a tall mast, a large mainsail on the right and a smaller jib on the left, each kept clear of the mast, over a wide hull with a raked bow. 16 and 20: plain sails and hull. 24+: a slight curve on the mainsail edge. 32+: two portholes in the hull (dots in outline, knockouts in solid). Solid: sails and hull filled, mast stays a stroke.',
  draw(k) {
    const P = (px) => px / k.L;
    const t = k.tier;

    // vertical layout
    const yH = pick(k, [0.74, 0.73, 0.72, 0.72, 0.72]);     // deck line (top of hull)
    const yS = yH - k.gapN(pick(k, [1.25, 1.5, 1.5, 2, 3])); // foot of both sails
    const mx = pick(k, [0.4, 0.41, 0.42, 0.42, 0.42]);      // mast
    const g = k.gapN(pick(k, [1.25, 1.5, 1.5, 2, 3]));        // sail ↔ mast clearance

    // mainsail (right of mast)
    const mTop = pick(k, [0.04, 0.04, 0.04, 0.04, 0.04]);
    const mx0 = mx + g, mx1 = pick(k, [0.96, 0.95, 0.94, 0.93, 0.92]);
    const bow = t >= 2 ? 0.06 : 0;
    const main = k.path([
      ['M', mx0, mTop], ['V', yS], ['H', mx1],
      ['Q', (mx0 + mx1) / 2 + bow, (mTop + yS) / 2 + bow * 0.4, mx0, mTop],
      ['Z'],
    ], { snap: false });

    // jib (left of mast), lower and smaller
    const jTop = pick(k, [0.16, 0.17, 0.18, 0.18, 0.18]);
    const jx0 = mx - g, jx1 = pick(k, [0.02, 0.04, 0.06, 0.07, 0.08]);
    const jib = k.path([['M', jx0, jTop], ['V', yS], ['H', jx1], ['Z']], { snap: false });

    // hull: wide deck, raked bow on the right, rounded stern on the left
    const hull = k.path([
      ['M', 0.02, yH], ['H', 0.98],
      ['L', 0.8, 1], ['H', 0.2],
      ['Q', 0.08, 1, 0.02, yH],
      ['Z'],
    ], { snap: false });

    const mast = k.path([['M', mx, 0], ['V', yH]]);

    const outline = [main, jib, hull, mast];
    let hullSolid = hull;
    if (t >= 3) {
      const py = (yH + 1) / 2;
      const xs = [0.36, 0.56];
      const dot = (x) => k.path([['M', x - 0.004, py], ['H', x + 0.004]], { snap: false });
      outline.push(...xs.map(dot));
      const r = k.holeN(pick(k, [0, 0, 0, 2.5, 3.75])) / 2;
      hullSolid += ' ' + xs.map((x) => k.circle(x, py, r)).join(' ');
    }

    return {
      outline,
      solid: [
        { d: main, fill: true },
        { d: jib, fill: true },
        { d: hullSolid, fill: true },
        { d: mast, fill: false },
      ],
    };
  },
};
