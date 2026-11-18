import { pick } from '../lib/shapes.mjs';

export default {
  id: 'data-centres',
  name: 'Data Centres',
  kind: 'industry',
  parent: 'cmbs',
  metaphor: 'server-rack',
  keywords: ['data centres', 'colocation', 'hyperscale', 'server farms'],
  reduction: 'Every size: a server rack cabinet standing on two short feet, split into stacked server units, each with a drive slot on the left and a status light on the right. 16 and 20: two units. 24 to 48: three units, with wider gaps as the size grows. Solid: the units are separate filled blocks (the dividers become cuts through the cabinet) with slot and light knocked out.',
  draw(k) {
    const P = (px) => px / k.L;
    const x0 = 0.1, x1 = 0.9, y0 = 0;
    const footPx = pick(k, [2.25, 2.5, 2.75, 3.75, 5.5]);
    const y1 = 1 - P(footPx); // bottom of the cabinet; feet run from here to the floor
    const r = pick(k, [0.12, 0.12, 0.12, 0.11, 0.1]);
    const n = pick(k, [2, 2, 3, 3, 3]);
    const h = (y1 - y0) / n;
    const divs = Array.from({ length: n - 1 }, (_, i) => y0 + h * (i + 1));
    const mids = Array.from({ length: n }, (_, i) => y0 + h * (i + 0.5));

    const fx = pick(k, [0.26, 0.26, 0.25, 0.25, 0.25]);
    const feet = k.path([['M', fx, y1], ['V', 1], ['M', 1 - fx, y1], ['V', 1]]);

    // unit contents
    const sl0 = pick(k, [0.27, 0.26, 0.25, 0.24, 0.23]), sl1 = pick(k, [0.5, 0.5, 0.5, 0.5, 0.5]);
    const ledX = pick(k, [0.71, 0.72, 0.73, 0.74, 0.74]);
    const dot = (x, y) => k.path([['M', x - 0.004, y], ['H', x + 0.004]], { snap: false });

    const body = k.rrect(x0, y0, x1, y1, r);
    const outline = [
      body,
      feet,
      ...divs.map((y) => k.path([['M', x0, y], ['H', x1]])),
      ...mids.map((y) => k.path([['M', sl0, y], ['H', sl1]])),
      ...mids.map((y) => dot(ledX, y)),
    ];

    // solid: cabinet cut into separate blocks; slot and light knocked out of each
    const cutW = k.holeW(pick(k, [1.25, 1.5, 1.25, 2, 3]));
    const slotW = k.holeW(pick(k, [1.25, 1.5, 1.25, 2, 3]));
    const ledR = k.holeN(pick(k, [1.5, 1.75, 1.75, 2.25, 3.5])) / 2;
    const rounded = k.bool(
      [k.ring(rrectPts(x0, y0, x1, y1, r))],
      divs.map((y) => k.fat([[x0 - 0.2, y], [x1 + 0.2, y]], cutW / 2)),
    );
    const holes = mids.map((y) => k.capsule(sl0, y, sl1, y, slotW) + ' ' + k.circle(ledX, y, ledR)).join(' ');

    return {
      outline,
      solid: [
        { d: rounded + ' ' + holes, fill: true },
        { d: feet, fill: false },
      ],
    };
  },
};

function rrectPts(x0, y0, x1, y1, r, n = 8) {
  const out = [];
  const corner = (cx, cy, a0) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  return out;
}
