import { pick } from '../lib/shapes.mjs';

export default {
  id: 'equipment-finance',
  name: 'Equipment Finance',
  kind: 'industry',
  parent: 'loans',
  metaphor: 'forklift',
  keywords: ['equipment leasing', 'equipment ABS', 'capital equipment loans'],
  reduction: 'Every size: a side-on forklift facing right, a chassis with a cab whose roof guard and slanted front post frame a window, two wheels below kept clear of the chassis and of each other, and a full-height mast with forks along the ground. 16 and 20: square counterweight, plain wheels. 24+: rounded counterweight. 32+: wheel hubs. Solid: chassis and cab one fill with the window knocked out, wheels filled, mast and forks stay strokes.',
  draw(k) {
    // A forklift: the archetypal piece of leased capital equipment.
    const P = (px) => px / k.L;
    const t = k.tier;
    const g = (px) => k.gapN(px);                                   // stroke-centre distance for px of clear space
    const gw = pick(k, [1, 1.25, 1.5, 2, 3]);                       // clear space between parts

    const r = pick(k, [0.125, 0.12, 0.12, 0.115, 0.11]);            // wheel radius
    const wy = 1 - r;
    const wx0 = 0.02 + r;                                           // rear wheel
    const wx1 = Math.max(wx0 + 2 * r + g(gw), 0.5);                 // front wheel
    const mx = Math.max(wx1 + r + g(gw), 0.82);                     // mast
    const bodyR = mx - g(gw);                                       // front of chassis
    const yc = wy - r - g(gw);                                      // chassis bottom, clear of the wheels
    const yb = pick(k, [0.33, 0.35, 0.37, 0.38, 0.38]);               // chassis top / cab floor
    const cx0 = pick(k, [0.14, 0.15, 0.15, 0.16, 0.16]);            // cab rear post
    const cTop = 0;                                                 // roof guard
    const cFront = bodyR - 0.1;                                     // front post foot
    const cRoof = cFront - pick(k, [0.12, 0.12, 0.13, 0.13, 0.13]); // front post top
    const back = t >= 2 ? pick(k, [0, 0, 0.08, 0.08, 0.07]) : 0;    // rounded counterweight

    const bodyPts = [[0.02, yc]];
    if (back) {
      for (let i = 0; i <= 6; i++) {
        const a = Math.PI + (i / 6) * (Math.PI / 2);
        bodyPts.push([0.02 + back + back * Math.cos(a), yb + back + back * Math.sin(a)]);
      }
    } else bodyPts.push([0.02, yb]);
    bodyPts.push([cx0, yb], [cx0, cTop], [cRoof, cTop], [cFront, yb], [bodyR, yb], [bodyR, yc]);
    const body = k.poly(bodyPts, { closed: true, snap: false });

    const floor = k.path([['M', cx0, yb], ['H', cFront]], { snap: false });
    const wheels = [wx0, wx1].map((x) => k.circle(x, wy, r));
    const mast = k.path([['M', mx, 0], ['V', 1], ['H', 1]], { snap: false });

    const outline = [body, floor, ...wheels, mast];
    const dot = (x, y) => k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false });
    if (t >= 3) outline.push(dot(wx0, wy), dot(wx1, wy));

    // solid: window knocked out of the cab
    const win = [[cx0, yb], [cx0, cTop], [cRoof, cTop], [cFront, yb]];
    const winHole = k.offsetPoly(win, -P(pick(k, [0, 0, 0.25, 0.5, 0.75])));
    const hubR = k.holeN(pick(k, [0, 0, 0, 2, 3])) / 2;
    const solid = [{ d: body + ' ' + winHole, fill: true }];
    for (const x of [wx0, wx1]) solid.push({ d: k.circle(x, wy, r) + (t >= 3 ? ' ' + k.circle(x, wy, hubR) : ''), fill: true });
    solid.push({ d: mast, fill: false });

    return { outline, solid };
  },
};
