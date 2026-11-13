// Roadmap batch 1: industries and credit categories the first sets lacked. Metaphors from data/research/<id>.json.
import { KEY } from '../../scripts/lib/kit.mjs';
import { pick } from '../lib/shapes.mjs';

const R = KEY.radius;
const seg = (k, pts) => k.poly(pts, { closed: false, snap: false });
const ellipsePts = (cx, cy, rx, ry, n = 28) => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * 2 * Math.PI; return [cx + rx * Math.sin(a), cy - ry * Math.cos(a)]; });

export default [
  {
    id: 'renewable-energy', name: 'Renewable Energy', kind: 'industry', parent: 'utilities', metaphor: 'wind-turbine',
    keywords: ['renewables', 'wind', 'solar', 'clean energy', 'independent power producers', 'green energy'],
    reduction: '24+: ground line.',
    draw(k) {
      const hx = 0.5, hy = 0.38, L = 0.36, hub = 0.06;
      const tip = (deg) => [hx + L * Math.cos((deg * Math.PI) / 180), hy + L * Math.sin((deg * Math.PI) / 180)];
      const start = (deg) => [hx + hub * 1.6 * Math.cos((deg * Math.PI) / 180), hy + hub * 1.6 * Math.sin((deg * Math.PI) / 180)];
      const blades = [-90, 30, 150].map((d) => [k.tier >= 1 ? start(d) : [hx, hy], tip(d)]);
      const mast = [[hx, k.tier >= 1 ? hy + hub * 1.6 : hy], [hx, 1]];
      const hubC = k.tier >= 1 ? [k.circle(hx, hy, hub)] : [];
      const ground = k.tier >= 2 ? [k.path([['M', 0.28, 1], ['H', 0.72]])] : [];
      return {
        outline: [...blades.map((b) => seg(k, b)), seg(k, mast), ...hubC, ...ground],
        solid: [...blades.map((b) => ({ d: k.offsetLine(b, k.sw * 0.55), fill: true })), { d: seg(k, mast), fill: false }, ...hubC.map((d) => ({ d, fill: true })), ...ground.map((d) => ({ d, fill: false }))],
      };
    },
  },
  {
    id: 'marine-shipping', name: 'Marine Shipping', kind: 'industry', parent: 'transportation', metaphor: 'cargo-ship',
    keywords: ['shipping', 'ports', 'containers', 'freight', 'maritime', 'tankers'],
    reduction: '20+: funnel. 32+: container dividers.',
    draw(k) {
      const hull = k.poly([[0.02, 0.62], [0.98, 0.62], [0.84, 0.94], [0.16, 0.94]], { snap: false });
      const cy = 0.62 - k.gapN(0.2), cargo = k.path([['M', 0.2, cy], ['V', 0.36], ['H', 0.62], ['V', cy]], { snap: false });
      const funnel = k.tier >= 1 ? [k.path([['M', 0.78, cy], ['V', 0.18]], { snap: false })] : [];
      const div = k.tier >= 3 ? [k.path([['M', 0.41, 0.36], ['V', cy]], { snap: false })] : [];
      return {
        outline: [hull, cargo, ...funnel, ...div],
        solid: [{ d: hull, fill: true }, { d: k.poly([[0.2, 0.36], [0.62, 0.36], [0.62, 0.62 - k.gapN(1)], [0.2, 0.62 - k.gapN(1)]], { snap: false }), fill: true }, ...funnel.map(() => ({ d: k.path([['M', 0.78, 0.62 - k.gapN(1)], ['V', 0.18]], { snap: false }), fill: false }))],
      };
    },
  },
  {
    id: 'rail', name: 'Rail', kind: 'industry', parent: 'transportation', metaphor: 'train-front',
    keywords: ['railroads', 'trains', 'transit', 'freight rail', 'passenger rail'],
    reduction: '16: window as a line. 24+: headlights.',
    draw(k) {
      const body = k.rrect(0.16, 0.02, 0.84, 0.8, R);
      const legs = [seg(k, [[0.32, 0.8], [0.18, 1]]), seg(k, [[0.68, 0.8], [0.82, 1]])];
      const winBox = [0.3, 0.16, 0.7, 0.42], wy = 0.36;
      const win = k.tier >= 1 ? k.rrect(...winBox, 0.04) : k.path([['M', 0.16, wy], ['H', 0.84]]);
      const lights = k.tier >= 2 ? [[0.33, 0.62], [0.67, 0.62]] : [];
      return {
        outline: [body, ...legs, win, ...lights.map(([x, y]) => k.path([['M', x - 0.005, y], ['H', x + 0.005]], { snap: false }))],
        solid: [{ d: body + (k.tier >= 1 ? k.offsetPoly([[winBox[0], winBox[1]], [winBox[2], winBox[1]], [winBox[2], winBox[3]], [winBox[0], winBox[3]]], k.sw / 2) : k.capsule(0.3, wy, 0.7, wy, k.holeW(k.sw)))
          + lights.map(([x, y]) => k.circle(x, y, k.holeN(k.sw) / 2)).join(''), fill: true }, ...legs.map((d) => ({ d, fill: false }))],
      };
    },
  },
  {
    id: 'capital-markets', name: 'Capital Markets', kind: 'industry', parent: 'financials', metaphor: 'candlesticks',
    keywords: ['stock market', 'trading', 'exchanges', 'brokerage', 'investment banking', 'securities'],
    reduction: 'None — three candles at all sizes.',
    draw(k) {
      const w = 0.09, cs = [[0.16, 0.3, 0.46, 0.8, 0.96], [0.5, 0.04, 0.2, 0.56, 0.76], [0.84, 0.24, 0.4, 0.7, 0.9]];
      const o = [], s = [];
      for (const [x, wt, bt, bb, wb] of cs) {
        const body = k.rrect(x - w, bt, x + w, bb, 0.03);
        o.push(body, k.path([['M', x, wt], ['V', bt]]), k.path([['M', x, bb], ['V', wb]]));
        s.push({ d: body, fill: true }, { d: k.path([['M', x, wt], ['V', wb]]), fill: false });
      }
      return { outline: o, solid: s };
    },
  },
  {
    id: 'asset-management', name: 'Asset Management', kind: 'industry', parent: 'financials', metaphor: 'pie-chart',
    keywords: ['investment managers', 'funds', 'portfolio', 'wealth management', 'allocation', 'custody'],
    reduction: 'None — pie and slice at all sizes.',
    draw(k) {
      const cx = 0.46, cy = 0.54, r = 0.44, off = Math.max(0.08, k.gapN(1) * 0.8) + (k.solid ? k.sw / k.L * 0.75 : 0);
      const pie = k.path([['M', cx, cy], ['L', cx, cy - r], ['A', r, r, 0, 1, 0, cx + r, cy], ['Z']], { snap: false });
      const sx = cx + off, sy = cy - off, rr = r - 0.04;
      const slice = k.path([['M', sx, sy], ['L', sx, sy - rr], ['A', rr, rr, 0, 0, 1, sx + rr, sy], ['Z']], { snap: false });
      return { outline: [pie, slice], solid: [{ d: pie, fill: true }, { d: slice, fill: true }] };
    },
  },
  {
    id: 'consumer-finance', name: 'Consumer Finance', kind: 'industry', parent: 'financials', metaphor: 'credit-card',
    keywords: ['credit cards', 'payments', 'personal loans', 'lending', 'card issuers'],
    reduction: '20+: detail line under the stripe.',
    draw(k) {
      const card = k.rrect(0, 0.16, 1, 0.84, R), sy = 0.4, dy = 0.64;
      const stripe = k.path([['M', 0, sy], ['H', 1]]), detail = k.tier >= 1 ? [k.path([['M', 0.16, dy], ['H', 0.4]])] : [];
      return {
        outline: [card, stripe, ...detail],
        solid: [{ d: card + k.capsule(0.1, sy, 0.9, sy, k.holeW(k.sw)) + (detail.length ? k.capsule(0.16, dy, 0.4, dy, k.holeW(k.sw * 0.6)) : ''), fill: true }],
      };
    },
  },
  {
    id: 'hospitals', name: 'Hospitals', kind: 'industry', parent: 'health-care', metaphor: 'hospital-building',
    keywords: ['health care providers', 'health care facilities', 'clinics', 'acute care', 'health systems'],
    reduction: '24+: door.',
    draw(k) {
      const g = k.grow, door = k.tier >= 2, cy = door ? 0.36 : 0.46, a = 0.14;
      const shell = k.rrect(0.12, 0.04, 0.88, 1, R * 0.7);
      const cross = [k.path([['M', 0.5 - a, cy], ['H', 0.5 + a]]), k.path([['M', 0.5, cy - a], ['V', cy + a]])];
      const doorP = door ? [k.path([['M', 0.4, 1], ['V', 0.72], ['H', 0.6], ['V', 1]])] : [];
      const h = 0.0001, plus = [[0.5 - h, cy - a], [0.5 + h, cy - a], [0.5 + h, cy - h], [0.5 + a, cy - h], [0.5 + a, cy + h], [0.5 + h, cy + h], [0.5 + h, cy + a], [0.5 - h, cy + a], [0.5 - h, cy + h], [0.5 - a, cy + h], [0.5 - a, cy - h], [0.5 - h, cy - h]];
      return {
        outline: [shell, ...cross, ...doorP],
        solid: [{ d: shell + k.offsetPoly(plus, k.sw) + (door ? k.offsetPoly([[0.42, 0.76], [0.58, 0.76], [0.58, 1.2], [0.42, 1.2]], k.sw / 2) : ''), fill: true }],
      };
    },
  },
  {
    id: 'sovereigns', name: 'Sovereigns', kind: 'asset-class', metaphor: 'globe',
    keywords: ['sovereign debt', 'government bonds', 'countries', 'treasuries', 'supranationals', 'global'],
    reduction: 'None — globe, equator and meridian at all sizes.',
    draw(k) {
      const globe = k.circle(0.5, 0.5, 0.5), eq = k.path([['M', 0, 0.5], ['H', 1]]);
      const mer = ellipsePts(0.5, 0.5, 0.22, 0.5), showMer = true;
      return {
        outline: [globe, eq, ...(showMer ? [k.poly(mer.slice(0, -1), { snap: false })] : [])],
        solid: [{ d: globe + k.offsetLines([[[0.1, 0.5], [0.9, 0.5]], ellipsePts(0.5, 0.5, 0.2, 0.4)], k.sw * 0.95), fill: true }],
      };
    },
  },
  {
    id: 'media', name: 'Media', kind: 'industry', parent: 'communication-services', metaphor: 'play-screen',
    keywords: ['entertainment', 'streaming', 'broadcasting', 'publishing', 'advertising', 'film', 'video'],
    reduction: 'None — screen and play mark at all sizes.',
    draw(k) {
      const screen = k.rrect(0, 0.12, 1, 0.88, R), tri = [[0.4, 0.34], [0.68, 0.5], [0.4, 0.66]];
      return { outline: [screen, k.poly(tri, { snap: false })], solid: [{ d: screen + k.offsetPoly(tri, k.sw * 0.75), fill: true }] };
    },
  },
  {
    id: 'packaging', name: 'Packaging', kind: 'industry', parent: 'materials', metaphor: 'box',
    keywords: ['containers', 'paper packaging', 'cartons', 'boxes', 'glass', 'plastics'],
    reduction: '20+: tape.',
    draw(k) {
      const ly = 0.36, lid = k.rrect(0, 0.12, 1, ly, 0.04), body = k.path([['M', 0.08, ly], ['V', 0.94], ['Q', 0.08, 1, 0.14, 1], ['H', 0.86], ['Q', 0.92, 1, 0.92, 0.94], ['V', ly]]);
      const tape = k.tier >= 1 ? [k.path([['M', 0.38, 0.56], ['H', 0.62]])] : [];
      const sy = ly + k.gapN(0.6);
      return {
        outline: [lid, body, ...tape],
        solid: [{ d: lid, fill: true }, { d: k.path([['M', 0.08, sy], ['V', 0.94], ['Q', 0.08, 1, 0.14, 1], ['H', 0.86], ['Q', 0.92, 1, 0.92, 0.94], ['V', sy], ['Z']]) + (tape.length ? k.capsule(0.38, 0.62, 0.62, 0.62, k.holeW(k.sw * 0.8)) : ''), fill: true }],
      };
    },
  },
  {
    id: 'paper-forest-products', name: 'Paper & Forest Products', kind: 'industry', parent: 'materials', metaphor: 'conifer',
    keywords: ['forestry', 'timber', 'pulp', 'paper', 'wood products', 'lumber'],
    reduction: '16–20: single-tier tree. 24+: two tiers.',
    draw(k) {
      const ty = 0.84, tree = k.tier >= 2
        ? [[0.5, 0.02], [0.84, 0.46], [0.66, 0.46], [0.94, ty], [0.06, ty], [0.34, 0.46], [0.16, 0.46]]
        : [[0.5, 0.02], [0.92, ty], [0.08, ty]];
      const trunk = k.path([['M', 0.5, ty], ['V', 1]]);
      return { outline: [k.poly(tree, { snap: false }), trunk], solid: [{ d: k.poly(tree, { snap: false }), fill: true }, { d: trunk, fill: false }] };
    },
  },
  {
    id: 'it-services', name: 'IT Services', kind: 'industry', parent: 'information-technology', metaphor: 'cloud',
    keywords: ['cloud', 'hosting', 'data centers', 'consulting', 'outsourcing', 'infrastructure', 'internet services'],
    reduction: 'None — single shape.',
    draw(k) {
      const cloud = k.path([['M', 0.26, 0.86], ['H', 0.74], ['A', 0.24, 0.24, 0, 0, 0, 0.8, 0.39], ['A', 0.31, 0.31, 0, 0, 0, 0.2, 0.44], ['A', 0.21, 0.21, 0, 0, 0, 0.26, 0.86], ['Z']], { snap: false });
      return { outline: [cloud], solid: [{ d: cloud, fill: true }] };
    },
  },
];
