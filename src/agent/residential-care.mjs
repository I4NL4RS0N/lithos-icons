import { pick } from '../lib/shapes.mjs';

export default {
  id: 'residential-care',
  name: 'Residential Care',
  kind: 'industry',
  parent: 'health-care',
  metaphor: 'rocking-chair',
  keywords: ['nursing homes', 'elder care', 'assisted living', 'residential care'],
  reduction: 'Rocking chair in side view, facing right: a tall backrest slab leaning back, a seat, an armrest, two legs and a long curved rocker spanning the full width. 16 and 20: backrest is wider so its inside stays open, the armrest is dropped (it would clog between back and seat) and the rocker curves a little less. 24+: armrest with a front post that runs down to the rocker. 32 and 48: deepest rocker curve, slightly narrower backrest. Solid: backrest and a seat slab filled as one L silhouette; legs, arm and rocker stay live strokes.',
  draw(k) {
    const small = k.tier <= 1;

    // Rocker: quadratic from left tip to right tip, sagging in the middle.
    const rx0 = 0.0, rx1 = 1.0;
    const sag = pick(k, [0.24, 0.25, 0.27, 0.28, 0.28]);
    const ry = 0.995 - sag / 2;
    const rcy = ry + sag; // control point y
    const rockerY = (x) => {
      const t = (x - rx0) / (rx1 - rx0), u = 1 - t;
      return u * u * ry + 2 * u * t * rcy + t * t * ry;
    };
    const rocker = k.path([['M', rx0, ry], ['Q', 0.5, rcy, rx1, ry]], { snap: false });

    // Backrest: a slab leaning back.
    const bw = pick(k, [0.27, 0.25, 0.23, 0.22, 0.21]);
    const bTop = 0.0, bBot = pick(k, [0.54, 0.54, 0.55, 0.55, 0.55]);
    const lean = 0.1;
    const bx0 = 0.1; // top-left x
    const back = [
      [bx0, bTop], [bx0 + bw, bTop],
      [bx0 + bw + lean, bBot], [bx0 + lean, bBot],
    ];
    const backPath = k.poly(back, { closed: true, snap: false });

    // Seat: from the back's lower edge forward.
    const seatY = bBot;
    const seatX1 = pick(k, [0.84, 0.84, 0.82, 0.82, 0.82]);
    const seat = k.path([['M', bx0 + bw + lean, seatY], ['H', seatX1]]);

    // Legs down to the rocker.
    const rearX = bx0 + lean + bw * 0.5;
    const frontX = seatX1 - 0.06;
    const rearLeg = k.path([['M', rearX, seatY], ['L', rearX, rockerY(rearX)]], { snap: false });
    const frontLeg = k.path([['M', frontX, small ? seatY : 0.3], ['L', frontX, rockerY(frontX)]], { snap: false });

    // Armrest (24+).
    const armY = 0.3;
    const armX0 = bx0 + bw + lean * (armY / bBot);
    const arm = small ? [] : [k.path([['M', armX0, armY], ['H', seatX1]], { snap: false })];

    const lines = [seat, rearLeg, frontLeg, ...arm, rocker];

    // Solid: backrest and a seat slab as one L silhouette.
    const st = pick(k, [0.07, 0.07, 0.08, 0.08, 0.08]);
    const sx0 = bx0 + lean;
    const body = k.bool([
      k.ring(back),
      k.ring([[sx0, seatY - 0.001], [seatX1, seatY - 0.001], [seatX1, seatY + st], [sx0, seatY + st]]),
    ], []);
    const solidLines = [rearLeg, frontLeg, ...arm, rocker];

    return {
      outline: [backPath, ...lines],
      solid: [
        { d: body, fill: true },
        ...solidLines.map((d) => ({ d, fill: false })),
      ],
    };
  },
};
