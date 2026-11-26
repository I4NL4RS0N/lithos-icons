import { pick } from '../lib/shapes.mjs';

export default {
  id: 'money-market-funds',
  name: 'Money Market Funds',
  kind: 'industry',
  parent: 'funds',
  metaphor: 'wallet',
  keywords: ['money market funds', 'MMF', 'cash management', 'short-term liquidity'],
  reduction: 'Every size: a full-width wallet with a banknote standing up out of its top and a clasp tab on the right edge. 16 and 20: the tab is plain. 24+: a snap dot on the tab. Solid: wallet filled, the tab split off by a cut that runs to the right edge, note filled separately with a clear gap above the wallet (at 16 and 20 the solid note stands a little taller so the strip stays readable); the snap dot is knocked out of the tab.',
  draw(k) {
    // Cash kept ready to hand: a wallet with a note sticking out of it.
    const P = (px) => px / k.L;
    const t = k.tier;

    // wallet body
    const x0 = 0, x1 = 1;
    const yb = pick(k, [0.34, 0.32, 0.31, 0.3, 0.3]);
    const y1 = 0.96;
    const r = pick(k, [0.13, 0.12, 0.12, 0.11, 0.1]);
    const body = k.rrect(x0, yb, x1, y1, r);

    // banknote tipped out of the top at an angle, so it reads as paper and never as a handle
    const th0 = (10 * Math.PI) / 180;
    const e = [Math.cos(th0), -Math.sin(th0)];   // along the note
    const n = [-Math.sin(th0), -Math.cos(th0)];  // up the note
    const nw = pick(k, [0.66, 0.66, 0.66, 0.66, 0.66]);
    const BL = [0.12, 0.42];                       // hidden inside the wallet
    // top-left corner height; solid 16/20 stand the note taller so the gap above the wallet leaves a real strip
    const topY = k.solid && t < 2 ? 0.1 : 0.13;
    const nh = (BL[1] - topY) / Math.cos(th0);
    const add = (p, v, s) => [p[0] + v[0] * s, p[1] + v[1] * s];
    const TL = add(BL, n, nh), TR = add(TL, e, nw), BR = add(BL, e, nw);
    // where the note's sides cross the wallet top
    const atY = (p, q, y) => [p[0] + ((q[0] - p[0]) * (y - p[1])) / (q[1] - p[1]), y];
    const nr = P(pick(k, [0.75, 1, 1, 1.5, 2]));
    const L0 = atY(BL, TL, yb), R0 = atY(BR, TR, yb);
    const tl1 = add(TL, n, -nr), tl2 = add(TL, e, nr), tr1 = add(TR, e, -nr), tr2 = add(TR, n, -nr);
    const noteOpen = k.path([
      ['M', ...L0], ['L', ...tl1], ['Q', ...TL, ...tl2], ['L', ...tr1], ['Q', ...TR, ...tr2], ['L', ...R0],
    ], { snap: false });
    const notePoly = [BL, TL, TR, BR];

    // clasp tab on the right edge
    const cy = (yb + y1) / 2;
    const th = pick(k, [0.16, 0.16, 0.16, 0.15, 0.15]);
    const tx = pick(k, [0.58, 0.6, 0.6, 0.62, 0.63]);
    const tr = P(pick(k, [1, 1.25, 1.5, 2, 3]));
    const tabPts = [['M', x1, cy - th], ['H', tx + tr], ['Q', tx, cy - th, tx, cy - th + tr],
      ['V', cy + th - tr], ['Q', tx, cy + th, tx + tr, cy + th], ['H', x1]];
    const tab = k.path(tabPts, { snap: false });
    const dotX = (tx + x1) / 2 + P(0.25);
    const dot = k.path([['M', dotX - 0.004, cy], ['H', dotX + 0.004]], { snap: false });

    const outline = [body, noteOpen, tab];
    if (t >= 2) outline.push(dot);

    // solid
    const cutW = k.holeW(pick(k, [1.25, 1.25, 1.25, 1.75, 2.5]));
    const tabLine = [[x1 + 0.2, cy - th], [tx, cy - th], [tx, cy + th], [x1 + 0.2, cy + th]];
    let walletSolid = k.bool([k.ring(rrectPts(x0, yb, x1, y1, r))], [k.fat(tabLine, cutW / 2)]);
    if (t >= 2) walletSolid += ' ' + k.circle(dotX, cy, k.holeN(pick(k, [0, 0, 1.75, 2.25, 3.5])) / 2);
    const noteBottom = yb - k.gapN(pick(k, [1, 1, 1.25, 1.5, 2]));
    const noteSolid = k.bool([k.ring(notePoly)], [k.ring([[-1, noteBottom], [2, noteBottom], [2, 2], [-1, 2]])]);

    return {
      outline,
      solid: [
        { d: walletSolid, fill: true },
        { d: noteSolid, fill: true },
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
