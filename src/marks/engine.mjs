// Lithos Brand Marks: pure functions, no DOM. A mark is { k: 'g', seed } (geometric) or { k: 'l', ch } (letter).
// Geometric marks are tile compositions: a small grid of quarter discs, triangles, circles and so on, mirrored or rotated.
export const mulberry = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

// Cell primitives in a unit square. Ops: M x y, L x y, A r sweep x y (circular arc, never more than half a turn), Z.
const PRIM = {
  sq: [['M', 0, 0], ['L', 1, 0], ['L', 1, 1], ['L', 0, 1], ['Z']],
  qd: [['M', 0, 0], ['L', 1, 0], ['A', 1, 1, 0, 1], ['Z']],
  qi: [['M', 1, 0], ['L', 1, 1], ['L', 0, 1], ['A', 1, 0, 1, 0], ['Z']],
  hd: [['M', 0, 0], ['L', 1, 0], ['A', 0.5, 1, 0, 0], ['Z']],
  tri: [['M', 0, 0], ['L', 1, 0], ['L', 0, 1], ['Z']],
  ci: [['M', 0.5, 0], ['A', 0.5, 1, 0.5, 1], ['A', 0.5, 1, 0.5, 0], ['Z']],
  cs: [['M', 0.5, 0.22], ['A', 0.28, 1, 0.5, 0.78], ['A', 0.28, 1, 0.5, 0.22], ['Z']],
  lens: [['M', 0, 0], ['A', 1, 1, 1, 1], ['A', 1, 1, 0, 0], ['Z']],
  dm: [['M', 0.5, 0], ['L', 1, 0.5], ['L', 0.5, 1], ['L', 0, 0.5], ['Z']],
  bar: [['M', 0, 0], ['L', 1, 0], ['L', 1, 0.5], ['L', 0, 0.5], ['Z']],
};
const WEIGHTS = [['sq', 3], ['qd', 4], ['qi', 2], ['hd', 2], ['tri', 3], ['ci', 2], ['cs', 1], ['lens', 2], ['dm', 1], ['bar', 1], [null, 2]];
const pickPrim = (r, W = WEIGHTS) => { const tot = W.reduce((s, w) => s + w[1], 0); let x = r() * tot; for (const [k, w] of W) { if ((x -= w) < 0) return k; } return 'sq'; };

// Symmetry groups, as transforms on the 100 x 100 mark box. flip = the transform reverses handedness (arcs change sweep).
const T = {
  I: [(x, y) => [x, y], false], MX: [(x, y) => [100 - x, y], true], MY: [(x, y) => [x, 100 - y], true],
  R90: [(x, y) => [100 - y, x], false], R180: [(x, y) => [100 - x, 100 - y], false], R270: [(x, y) => [y, 100 - x], false],
};
const GROUPS = { none: ['I'], mx: ['I', 'MX'], my: ['I', 'MY'], mxy: ['I', 'MX', 'MY', 'R180'], rot4: ['I', 'R90', 'R180', 'R270'] };
const rot90cell = ([x, y]) => [1 - y, x];
const f2 = (v) => +v.toFixed(2);

export function geoParams(seed, W = WEIGHTS) {
  const r = mulberry(seed);
  const n = r() < 0.2 ? 3 : r() < 0.5 ? 2 : 4;
  const sym = n === 3 ? 'none' : ['mx', 'my', 'mxy', 'rot4', 'rot4', 'mxy'][Math.floor(r() * 6)];
  const cells = [], base = (i, j) => (sym === 'none' ? true : sym === 'mx' ? i < n / 2 : sym === 'my' ? j < n / 2 : i < n / 2 && j < n / 2);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (base(i, j)) cells.push({ i, j, p: pickPrim(r, W), o: Math.floor(r() * 4) });
  return { n, sym, cells };
}

// The mark as one path (even-odd fill) in a 100 x 100 box.
export function geoPath(seed, prims = PRIM, W = WEIGHTS) {
  const { n, sym, cells } = geoParams(seed, W), s = 100 / n, out = [];
  for (const c of cells) {
    if (!c.p) continue;
    let ops = prims[c.p].map((op) => op.slice());
    for (let k = 0; k < c.o; k++) ops = ops.map((op) => (op[0] === 'M' || op[0] === 'L' ? [op[0], ...rot90cell([op[1], op[2]])] : op[0] === 'A' ? ['A', op[1], op[2], ...rot90cell([op[3], op[4]])] : op));
    for (const g of GROUPS[sym]) {
      const [fn, flip] = T[g];
      let d = '';
      for (const op of ops) {
        if (op[0] === 'Z') d += 'Z';
        else if (op[0] === 'A') { const [x, y] = fn((c.i + op[3]) * s, (c.j + op[4]) * s); d += `A${f2(op[1] * s)} ${f2(op[1] * s)} 0 0 ${flip ? 1 - op[2] : op[2]} ${f2(x)} ${f2(y)}`; }
        else { const [x, y] = fn((c.i + op[1]) * s, (c.j + op[2]) * s); d += `${op[0]}${f2(x)} ${f2(y)}`; }
      }
      out.push(d);
    }
  }
  return out.join('');
}

// Pattern families (added 2026-11-20): rosettes, bursts, bars, checks, dials and hex cubes. id = f-<family>-<seed>.
export const FAMILIES = [['ov', 'Overlaps'], ['bu', 'Bursts'], ['st', 'Bars'], ['ck', 'Checks'], ['rb', 'Dials'], ['hx', 'Hex'], ['sc', 'Scoops'], ['sl', 'Slices'], ['pl', 'Planets'], ['pw', 'Pinwheels'], ['sp', 'Stars']];
const P = (a, d = 50, c = 50) => [c + d * Math.cos((a * Math.PI) / 180), c + d * Math.sin((a * Math.PI) / 180)];
const xy = (p) => `${f2(p[0])} ${f2(p[1])}`;
const circ = (cx, cy, r) => `M${f2(cx - r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 0 ${f2(cx + r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 0 ${f2(cx - r)} ${f2(cy)}Z`;
const ell = (cx, cy, rx, ry, deg) => { const a = (deg * Math.PI) / 180, dx = rx * Math.cos(a), dy = rx * Math.sin(a); return `M${f2(cx - dx)} ${f2(cy - dy)}A${f2(rx)} ${f2(ry)} ${deg} 1 0 ${f2(cx + dx)} ${f2(cy + dy)}A${f2(rx)} ${f2(ry)} ${deg} 1 0 ${f2(cx - dx)} ${f2(cy - dy)}Z`; };
const pol = (pts) => `M${pts.map(xy).join('L')}Z`;
const cap = (p, q, w) => { const a = Math.atan2(q[1] - p[1], q[0] - p[0]) + Math.PI / 2, nx = w * Math.cos(a), ny = w * Math.sin(a); return `M${f2(p[0] + nx)} ${f2(p[1] + ny)}L${f2(q[0] + nx)} ${f2(q[1] + ny)}A${f2(w)} ${f2(w)} 0 0 0 ${f2(q[0] - nx)} ${f2(q[1] - ny)}L${f2(p[0] - nx)} ${f2(p[1] - ny)}A${f2(w)} ${f2(w)} 0 0 0 ${f2(p[0] + nx)} ${f2(p[1] + ny)}Z`; };
const sector = (r1, r2, a1, a2) => `M${xy(P(a1, r2))}A${r2} ${r2} 0 0 1 ${xy(P(a2, r2))}L${xy(P(a2, r1))}A${r1} ${r1} 0 0 0 ${xy(P(a1, r1))}Z`;
const pick = (r, a) => a[Math.floor(r() * a.length)];
const shrink = (pts, k) => { const c = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]; return pts.map((p) => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]); };
const clipY = (poly, y1, y2) => {
  const cut = (pts, keep, hit) => { const o = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], ka = keep(a), kb = keep(b); if (ka) o.push(a); if (ka !== kb) o.push(hit(a, b)); } return o; };
  const at = (y) => (a, b) => [a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]), y];
  return cut(cut(poly, (p) => p[1] >= y1, at(y1)), (p) => p[1] <= y2, at(y2));
};
const biteArc = (a, b, depth) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), R = (L * L / 4 + depth * depth) / (2 * depth); return `A${f2(R)} ${f2(R)} 0 0 0 ${xy(b)}`; };
const regular = (n, R, off = -90) => Array.from({ length: n }, (_, k) => P(off + (k * 360) / n, R));
export function famPath(fam, seed) {
  if (fam === 'sk') return skPath(seed);
  if (fam === 'an') return angPath(seed);
  const r = mulberry(seed * 7919 + fam.charCodeAt(0) * 131 + fam.charCodeAt(1));
  let d = '';
  if (fam === 'ov') {
    if (r() < 0.5) { const n = 2 + Math.floor(r() * 3), ry = 11 + r() * 12, off = pick(r, [0, 0, 22.5]); for (let i = 0; i < n; i++) d += ell(50, 50, 47, ry, off + (i * 180) / n); }
    else { const k = 2 + Math.floor(r() * 2), R = 26 + r() * 6, dd = 48 - R, rot = pick(r, [0, 30, 45, 90]); for (let i = 0; i < k; i++) { const [x, y] = P(rot - 90 + (i * 360) / k, k === 2 ? dd : dd * 0.95); d += circ(x, y, R); } }
  } else if (fam === 'bu') {
    const n = pick(r, [5, 6, 6, 8, 8]), gap = 0.14 + r() * 0.2, r1 = 14 + r() * 16, alt = r() < 0.4, step = 360 / n;
    for (let i = 0; i < n; i++) { const a = i * step - 90; d += sector(r1, alt && i % 2 ? 36 : 48, a + (step * gap) / 2, a + step - (step * gap) / 2); }
  } else if (fam === 'st') {
    const m = 3 + Math.floor(r() * 3), mode = pick(r, ['ramp', 'peak', 'valley', 'even']), rot = pick(r, [0, 0, 45, 90]), round = r() < 0.65, pitch = 88 / m, w = pitch * (round ? 0.32 : 0.36);
    const rt = (p) => { const a = (rot * Math.PI) / 180, x = p[0] - 50, y = p[1] - 50; return [50 + x * Math.cos(a) - y * Math.sin(a), 50 + x * Math.sin(a) + y * Math.cos(a)]; };
    const sc = rot === 45 ? 0.74 : 1;
    for (let i = 0; i < m; i++) {
      const t = m === 1 ? 0 : i / (m - 1), h = (mode === 'ramp' ? 0.4 + 0.6 * t : mode === 'peak' ? 0.45 + 0.55 * (1 - Math.abs(t - 0.5) * 2) : mode === 'valley' ? 0.45 + 0.55 * Math.abs(t - 0.5) * 2 : 1) * 46 * sc - (round ? w : 0);
      const x = 50 + (i - (m - 1) / 2) * pitch, y1 = mode === 'ramp' ? 50 + 46 * sc - (round ? w : 0) : 50 + h, y0 = mode === 'ramp' ? y1 - 2 * h : 50 - h;
      d += round ? cap(rt([x, y0]), rt([x, y1]), w) : pol([rt([x - w, y0 - 0]), rt([x + w, y0]), rt([x + w, y1]), rt([x - w, y1])]);
    }
  } else if (fam === 'ck') {
    if (r() < 0.45) { const nr = pick(r, [4, 5, 6]), h = 100 / nr, gy = 3 + r() * 2.5, par = r() < 0.5 ? 0 : 1, cols = pick(r, [2, 4]); for (let j = 0; j < nr; j++) for (let i = 0; i < cols * 1; i++) if ((i + j) % 2 === par) d += pol([[(i * 100) / cols, j * h + gy / 2], [((i + 1) * 100) / cols, j * h + gy / 2], [((i + 1) * 100) / cols, (j + 1) * h - gy / 2], [(i * 100) / cols, (j + 1) * h - gy / 2]]); return d; }
    const n = pick(r, [3, 3, 3, 4]), s = 100 / n, g = s * (0.12 + r() * 0.1), a = pick(r, ['sq', 'ci', 'dm']), b = pick(r, [null, 'dot', 'ci']), par = r() < 0.5 ? 0 : 1;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const cx = (i + 0.5) * s, cy = (j + 0.5) * s, h = s / 2 - g, t = (i + j) % 2 === par ? a : b;
      if (t === 'sq') d += pol([[cx - h, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h]]);
      else if (t === 'ci') d += circ(cx, cy, h);
      else if (t === 'dm') d += pol([[cx, cy - h * 1.15], [cx + h * 1.15, cy], [cx, cy + h * 1.15], [cx - h * 1.15, cy]]);
      else if (t === 'dot') d += circ(cx, cy, h * 0.4);
    }
  } else if (fam === 'rb') {
    const m = pick(r, [6, 8, 8, 10]), r1 = 19 + r() * 9, alt = r() < 0.5, flat = r() < 0.5, w = Math.min(((Math.PI * 2 * r1) / m) * 0.36, 7.5);
    for (let i = 0; i < m; i++) { const a = (i * 360) / m - 90, r2 = alt && i % 2 ? 36 : 47 - w; d += flat ? pol([[-w, 0], [w, 0], [w, 1], [-w, 1]].map(([u, v]) => { const q = P(a, r1 + w + v * (r2 - r1 - w), 0), n = P(a + 90, u, 0); return [50 + q[0] + n[0], 50 + q[1] + n[1]]; })) : cap(P(a, r1 + w), P(a, r2), w); }
  } else if (fam === 'sc') {
    const mode = pick(r, ['side', 'side', 'side', 'corner', 'hex', 'hex']), hole = r() < 0.6;
    if (mode === 'corner') { const c = 20 + r() * 12; d += `M${f2(c)} 0L${f2(100 - c)} 0A${f2(c)} ${f2(c)} 0 0 0 100 ${f2(c)}L100 ${f2(100 - c)}A${f2(c)} ${f2(c)} 0 0 0 ${f2(100 - c)} 100L${f2(c)} 100A${f2(c)} ${f2(c)} 0 0 0 0 ${f2(100 - c)}L0 ${f2(c)}A${f2(c)} ${f2(c)} 0 0 0 ${f2(c)} 0Z`; if (hole) d += circ(50, 50, 13 + r() * 9); }
    else { const V = mode === 'hex' ? regular(6, 49) : mode === 'oct' ? regular(8, 49, -67.5) : [[0, 0], [100, 0], [100, 100], [0, 100]], dep = (mode === 'side' ? 15 : 10) + r() * 9; d += `M${xy(V[0])}`; for (let i = 0; i < V.length; i++) d += biteArc(V[i], V[(i + 1) % V.length], dep); d += 'Z'; if (hole) d += circ(50, 50, 12 + r() * 10); }
  } else if (fam === 'sl') {
    const shape = pick(r, ['circle', 'circle', 'hex', 'dia', 'tri', 'sq']), n = 3 + Math.floor(r() * 3), g = 6 + r() * 3, shift = r() < 0.75 ? 4 + r() * 7 : 0;
    const wts = Array.from({ length: n }, () => 0.7 + r() * 0.8), tot = wts.reduce((a, b) => a + b, 0), H = 94 - (n - 1) * g;
    const poly = { hex: regular(6, 47), dia: [[50, 3], [97, 50], [50, 97], [3, 50]], tri: [[50, 6], [96, 92], [4, 92]], sq: [[8, 8], [92, 8], [92, 92], [8, 92]] }[shape];
    let y = 3;
    for (let i = 0; i < n; i++) {
      const h = (wts[i] / tot) * H, y1 = y, y2 = y + h, dx = shift && i % 2 ? shift : -shift * 0;
      y += h + g;
      if (shape === 'circle') { const R = 47, xa = Math.sqrt(Math.max(0, R * R - (y1 - 50) ** 2)), xb = Math.sqrt(Math.max(0, R * R - (y2 - 50) ** 2)); d += `M${f2(50 + dx - xa)} ${f2(y1)}L${f2(50 + dx + xa)} ${f2(y1)}A${R} ${R} 0 0 1 ${f2(50 + dx + xb)} ${f2(y2)}L${f2(50 + dx - xb)} ${f2(y2)}A${R} ${R} 0 0 1 ${f2(50 + dx - xa)} ${f2(y1)}Z`; }
      else { const c = clipY(poly, y1, y2).map((q) => [q[0] + dx, q[1]]); if (c.length > 2) d += pol(c); }
    }
  } else if (fam === 'pl') {
    const mode = pick(r, ['planet', 'planet', 'eye', 'duo']);
    if (mode === 'planet') { d += circ(50, 50, 33 + r() * 6) + ell(50, 50, 48, 9 + r() * 7, pick(r, [-35, -22, 22, 35, 0])); }
    else if (mode === 'eye') { d += ell(50, 50, 47, 24 + r() * 8, 0) + circ(50, 50, 10 + r() * 8); }
    else { const ry = 12 + r() * 6; d += circ(50, 50, 36) + ell(50, 50 - 17, 48, ry, 0) + ell(50, 50 + 17, 48, ry, 0); }
  } else if (fam === 'pw') {
    const mode = pick(r, ['full', 'full', 'fan']);
    if (mode === 'full') { const n = pick(r, [6, 8, 8, 10]), off = pick(r, [0, 15, 22.5]); for (let i = 0; i < n; i += 2) { const a = off + (i * 360) / n - 90, st = 360 / n; d += `M50 50L${xy(P(a, 47))}A47 47 0 0 1 ${xy(P(a + st, 47))}Z`; } }
    else { const n = pick(r, [5, 7, 9]), st = 180 / n; for (let i = 0; i < n; i += 2) d += `M50 72L${xy(P(180 + i * st, 47, 50).map((v, k) => (k ? v + 22 : v)))}A47 47 0 0 1 ${xy(P(180 + (i + 1) * st, 47, 50).map((v, k) => (k ? v + 22 : v)))}Z`; }
  } else if (fam === 'sp') {
    const n = pick(r, [4, 4, 4, 6, 8]), V = regular(n, 47), chord = 2 * 47 * Math.sin(Math.PI / n), R = chord * pick(r, [0.75, 1, 1.35]);
    d += `M${xy(V[0])}`; for (let i = 0; i < n; i++) d += `A${f2(R)} ${f2(R)} 0 0 0 ${xy(V[(i + 1) % n])}`; d += 'Z';
    if (r() < 0.4) d += circ(50, 50, 7 + r() * 6);
  } else {
    const V = [0, 1, 2, 3, 4, 5].map((k) => P(-90 + k * 60, 48)), c = [50, 50], mode = pick(r, ['cube', 'cube', 'ring', 'pin', 'ring2']);
    if (mode === 'cube') for (const q of [[c, V[0], V[1], V[2]], [c, V[2], V[3], V[4]], [c, V[4], V[5], V[0]]]) d += pol(shrink(q, 0.9));
    else if (mode === 'pin') for (let k = 0; k < 6; k += 2) d += pol(shrink([c, V[k], V[(k + 1) % 6]], 0.92));
    else { const hex = (rr, o = 0) => pol([0, 1, 2, 3, 4, 5].map((k) => P(-90 + o + k * 60, rr))); d += hex(48) + hex(28 + r() * 6); if (mode === 'ring2') d += hex(12); }
  }
  return d;
}
// Angular set (added 2026-11-20): chamfers, 45-degree triangles, pinwheels, stencil rings, zigzags. id = f-an-<seed>.
const ANG = {
  sq: PRIM.sq, tri: PRIM.tri, dm: PRIM.dm, bar: PRIM.bar,
  ch1: [['M', 0, 0], ['L', 0.5, 0], ['L', 1, 0.5], ['L', 1, 1], ['L', 0, 1], ['Z']],
  ch2: [['M', 0, 0], ['L', 0.25, 0], ['L', 1, 0.75], ['L', 1, 1], ['L', 0, 1], ['Z']],
  trap: [['M', 0, 0], ['L', 1, 0], ['L', 0.7, 0.5], ['L', 0.3, 0.5], ['Z']],
  par: [['M', 0, 1], ['L', 0.5, 0], ['L', 1, 0], ['L', 0.5, 1], ['Z']],
};
const ANGW = [['sq', 3], ['tri', 4], ['ch1', 3], ['ch2', 2], ['trap', 2], ['bar', 1], ['dm', 1], ['par', 2], [null, 2]];
const rotQ = (pts, k) => pts.map(([x, y]) => { let p = [x, y]; for (let i = 0; i < k; i++) p = [100 - p[1], p[0]]; return p; });
const ANGAREA = { sq: 1, tri: 0.5, dm: 0.5, bar: 0.5, ch1: 0.875, ch2: 0.72, trap: 0.35, par: 0.5 };
const goodAng = (seed) => { const { n, sym, cells } = geoParams(seed, ANGW), mult = GROUPS[sym].length, live = cells.filter((c) => c.p), shapes = live.length * mult, cover = live.reduce((a, c) => a + ANGAREA[c.p], 0) * mult / (n * n); return shapes >= 3 && shapes <= (n === 4 ? 9 : n === 3 ? 6 : 4) && cover >= 0.4 && cover <= 0.8 && new Set(live.map((c) => c.p)).size >= 2; };
const angMode = (seed) => pick(mulberry(seed * 104729 + 17), ['grid', 'grid', 'grid', 'grid', 'grid', 'grid', 'plus', 'pin', 'pin', 'pin', 'zig', 'ring', 'ring', 'chev']);
export function angPath(seed) {
  const r = mulberry(seed * 104729 + 17), mode = pick(r, ['grid', 'grid', 'grid', 'grid', 'grid', 'grid', 'plus', 'pin', 'pin', 'pin', 'zig', 'ring', 'ring', 'chev']);
  let d = '';
  if (mode === 'grid') { let g = seed * 7 + 5000; for (let i = 0; i < 400 && !goodAng(g); i++) g++; return geoPath(g, ANG, ANGW); }
  if (mode === 'plus') {
    const hw = 11 + r() * 8, c = 5 + r() * 7, a = 47, b = r() < 0.5 ? 47 : 36 + r() * 8, arm = (L) => [[-hw, -hw], [-hw, -L + c], [-hw + c, -L], [hw - c, -L], [hw, -L + c], [hw, -hw]];
    const pts = []; for (let k = 0; k < 4; k++) pts.push(...rotQ(arm(k % 2 ? b : a).map(([x, y]) => [50 + x, 50 + y]), 0).map(([x, y]) => { let u = x - 50, v = y - 50; for (let i = 0; i < k; i++) [u, v] = [-v, u]; return [50 + u, 50 + v]; }));
    d = pol(pts);
  } else if (mode === 'pin') {
    const g = 3 + r() * 4, c = 14 + r() * 24, cs = Math.floor(r() * 4), sym = pick(r, ['rot', 'rot', 'mir']);
    const base = [[g, g], [50 - g, g], [50 - g, 50 - g], [g, 50 - g]], cut = (pts) => { const q = pts[cs], pr = pts[(cs + 3) % 4], nx = pts[(cs + 1) % 4], u = (a, b, t) => [a[0] + ((b[0] - a[0]) * t) / Math.hypot(b[0] - a[0], b[1] - a[1]), a[1] + ((b[1] - a[1]) * t) / Math.hypot(b[0] - a[0], b[1] - a[1])]; const o = pts.slice(0, cs); o.push(u(q, pr, c), u(q, nx, c)); return o.concat(pts.slice(cs + 1)); };
    const blk = cut(base);
    for (let k = 0; k < 4; k++) d += pol(sym === 'rot' ? rotQ(blk, k) : blk.map(([x, y]) => (k & 1 ? [100 - x, y] : [x, y])).map(([x, y]) => (k & 2 ? [x, 100 - y] : [x, y])));
  } else if (mode === 'zig') {
    const n = 2, th = 28 + r() * 9, flip = r() < 0.5, hi = 10 + r() * 6, lo = 44 + r() * 8, T = [], B = [];
    for (let k = 0; k <= 2 * n; k++) { const x = 6 + (k * 88) / (2 * n), y = k % 2 ? lo : hi; T.push([x, y]); B.push([x, Math.min(94, y + th)]); }
    let pts = [...T, ...B.reverse()]; if (flip) pts = pts.map(([x, y]) => [x, 100 - y]); d = pol(pts);
  } else if (mode === 'ring') {
    const sd = pick(r, [4, 6, 8]), off = sd === 4 ? -45 : sd === 6 ? pick(r, [-90, -60]) : -67.5, O = regular(sd, sd === 4 ? 66 : 48, off), f = 0.45 + r() * 0.22, I = O.map(([x, y]) => [50 + (x - 50) * f, 50 + (y - 50) * f]), k = Math.floor(r() * sd);
    if (sd === 4 || r() < 0.55) { const pts = []; for (let i = 1; i <= sd; i++) pts.push(O[(k + i) % sd]); for (let i = 0; i < sd; i++) pts.push(I[(k - i + sd) % sd]); d = pol(pts); } else d = pol(O) + pol(I);
  } else {
    const n = 2 + Math.floor(r() * 2), t = 14 + r() * 6, h = 24 + r() * 8, st = t + 6 + r() * 4, tot = (n - 1) * st + h + t, y0 = 50 - tot / 2, rot = pick(r, [0, 0, 1, 2, 3]);
    for (let i = 0; i < n; i++) { const y = y0 + i * st; d += pol(rotQ([[50, y], [96, y + h], [96, y + h + t], [50, y + t], [4, y + h + t], [4, y + h]], rot)); }
  }
  return d;
}
export const ANG_CURATED = (() => { const cap = { grid: 58, pin: 14, plus: 2, zig: 4, ring: 5, chev: 4 }, cnt = {}, out = []; for (let sd = 1; out.length < 87 && sd < 4000; sd++) { const m = angMode(sd); if ((cnt[m] = (cnt[m] || 0) + 1) > cap[m]) continue; out.push({ k: 'f', fam: 'an', seed: sd }); } return out; })();
// Sleek set (added 2026-11-20): slanted bars, soft-cornered letter blocks, striped chevrons, hex eyes. id = f-sk-<seed>.
const rpoly = (pts, r) => { const n = pts.length; let d = ''; for (let i = 0; i < n; i++) { const v = pts[i], p = pts[(i + n - 1) % n], q = pts[(i + 1) % n], rr = typeof r === 'function' ? r(i) : r, l1 = Math.hypot(p[0] - v[0], p[1] - v[1]), l2 = Math.hypot(q[0] - v[0], q[1] - v[1]), d1 = Math.min(rr, l1 / 2), d2 = Math.min(rr, l2 / 2); d += (i ? 'L' : 'M') + xy([v[0] + ((p[0] - v[0]) * d1) / l1, v[1] + ((p[1] - v[1]) * d1) / l1]) + 'Q' + xy(v) + ' ' + xy([v[0] + ((q[0] - v[0]) * d2) / l2, v[1] + ((q[1] - v[1]) * d2) / l2]); } return d + 'Z'; };
const TMPL = {
  L: [[24, 12], [50, 12], [50, 62], [82, 62], [82, 88], [24, 88]],
  F: [[24, 12], [84, 12], [84, 34], [50, 34], [50, 46], [72, 46], [72, 66], [50, 66], [50, 88], [24, 88]],
  Z: [[16, 12], [84, 12], [84, 32], [46, 68], [84, 68], [84, 88], [16, 88], [16, 68], [54, 32], [16, 32]],
  N: [[18, 88], [18, 12], [40, 12], [62, 56], [62, 12], [84, 12], [84, 88], [62, 88], [40, 44], [40, 88]],
  K: [[20, 12], [44, 12], [44, 38], [68, 12], [94, 12], [60, 50], [94, 88], [68, 88], [44, 62], [44, 88], [20, 88]],
  A: [[50, 12], [90, 88], [66, 88], [50, 52], [34, 88], [10, 88]],
  M: [[12, 88], [12, 14], [36, 14], [50, 48], [64, 14], [88, 14], [88, 88], [66, 88], [66, 50], [50, 82], [34, 50], [34, 88]],
  Y: [[12, 12], [36, 12], [50, 40], [64, 12], [88, 12], [62, 56], [62, 88], [38, 88], [38, 56]],
};
export function skPath(seed) {
  const r = mulberry(seed * 15485863 + 29), mode = pick(r, ['bars', 'tmpl', 'tmpl', 'tmpl', 'tmpl', 'tmpl', 'stripe', 'hexd', 'dots']);
  let d = '';
  if (mode === 'bars') {
    const k = 2 + Math.floor(r() * 2), h = k === 2 ? 30 : 22, sl = 14 + r() * 10, w = 44 + r() * 14, rad = pick(r, [0, 5, 7]), rd = pick(r, ['all', 'diag']), gap = 8, tot = k * h + (k - 1) * gap, y0 = 50 - tot / 2, drift = pick(r, [-12, 0, 12]);
    for (let i = 0; i < k; i++) { const y = y0 + i * (h + gap), x = 50 - w / 2 + (i - (k - 1) / 2) * drift + (r() < 0.5 ? -4 : 4); d += rpoly([[x + sl, y], [x + w + sl, y], [x + w, y + h], [x, y + h]], rd === 'all' ? rad : (j) => (j % 2 ? 0 : rad)); }
  } else if (mode === 'tmpl') {
    const t = TMPL[pick(r, Object.keys(TMPL))], sh = pick(r, [0, 0, 0.18, 0.28, -0.2]), fl = r() < 0.3, rad = pick(r, [3, 6, 9]);
    let pts = t.map(([x, y]) => [x + (50 - y) * sh, y]); if (fl) pts = pts.map(([x, y]) => [100 - x, y]); d = rpoly(pts, rad);
  } else if (mode === 'stripe') {
    const n = 5 + Math.floor(r() * 3), poly = r() < 0.5 ? [[8, 12], [34, 12], [50, 58], [66, 12], [92, 12], [60, 88], [40, 88]] : [[8, 12], [92, 12], [50, 88]];
    let y = 12; const g0 = 1.5 + r(), H = 76, hs = Array.from({ length: n }, (_, i) => 1 + (n - i) * 0.25), ht = hs.reduce((a, b) => a + b, 0), gs = Array.from({ length: n - 1 }, (_, i) => g0 + i * (1 + r())), gt = gs.reduce((a, b) => a + b, 0), sc = (H - gt) / ht;
    for (let i = 0; i < n; i++) { const c = clipY(poly, y, y + hs[i] * sc); if (c.length > 2) d += pol(c); y += hs[i] * sc + (gs[i] || 0); }
  } else if (mode === 'hexd') {
    const O = regular(6, 47), f = 0.5 + r() * 0.12, I = [[50, 50 - 36 * f * 1.1], [50 + 40 * f * 1.4, 50], [50, 50 + 36 * f * 1.1], [50 - 40 * f * 1.4, 50]];
    d = rpoly(O, 6) + rpoly(I, 4);
  } else {
    const n = pick(r, [6, 8, 8, 10]), R = 33, rx = 10 + r() * 4, ry = 6 + r() * 2, alt = r() < 0.6;
    for (let i = 0; i < n; i++) { const a = (i * 360) / n - 90, [x, y] = P(a, R), big = alt && i % 2 ? 0.72 : 1; d += ell(x, y, rx * big, ry * big, a); }
  }
  return d;
}
export const SK_CURATED = [1, 2, 3, 4, 6, 8, 9, 10, 11, 12, 14, 16, 17, 18, 21, 22, 23, 24, 25, 27, 28, 30, 34, 36, 42, 45, 48, 49, 52, 56, 60, 63, 64, 65, 70, 76, 77, 78, 92, 102].map((seed) => ({ k: 'f', fam: 'sk', seed }));
export const famSeeds = (fam, from, count) => Array.from({ length: count }, (_, i) => from + i);
const PICKS = { ov: [3, 4, 5, 6, 9, 11, 13], bu: [2, 4, 9, 12], st: [1, 2, 3, 5, 9, 10, 13], ck: [1, 2, 4, 13], rb: [1, 10, 13], hx: [1, 2, 4], sc: [5, 6, 9, 16, 19, 17], sl: [2, 11, 4], pl: [3, 4, 5, 1, 2, 6], pw: [1, 2, 3, 6, 9, 10], sp: [1, 13, 5] };
export const FAM_CURATED = FAMILIES.flatMap(([f]) => (PICKS[f] || famSeeds(f, 1, 8)).map((s) => ({ k: 'f', fam: f, seed: s })));

// Letters: stroked skeletons on a 100 box (ink spans about 24..76 by 16..84). Weight, caps and joins are the user's.
export const LETTERS = {
  A: 'M24 84L50 16L76 84M34 60H66', B: 'M26 16H54A17 17 0 0 1 54 50H58A17 17 0 0 1 58 84H26ZM26 50H54',
  C: 'M71 28A27 34 0 1 0 71 72', D: 'M26 16H46A34 34 0 0 1 46 84H26Z', E: 'M74 16H26V84H74M26 50H66', F: 'M74 16H26V84M26 50H66',
  G: 'M71 28A27 34 0 1 0 77 50H52', H: 'M26 16V84M74 16V84M26 50H74', I: 'M50 16V84', J: 'M66 16V60A16 16 0 0 1 34 60',
  K: 'M26 16V84M72 16L26 56M40 44L74 84', L: 'M26 16V84H74', M: 'M24 84V16L50 56L76 16V84', N: 'M26 84V16L74 84V16',
  O: 'M50 16A26 34 0 1 0 50 84A26 34 0 1 0 50 16Z', P: 'M26 84V16H54A17 17 0 0 1 54 50H26', Q: 'M50 16A26 34 0 1 0 50 84A26 34 0 1 0 50 16ZM56 62L76 86',
  R: 'M26 84V16H54A17 17 0 0 1 54 50H26M50 50L74 84', S: 'M73 30C68 18 27 18 27 34C27 50 73 50 73 66C73 82 32 82 27 70',
  0: 'M50 16A22 34 0 1 0 50 84A22 34 0 1 0 50 16Z', 1: 'M36 30L52 16V84', 2: 'M28 36C28 8 72 8 72 36C72 56 28 70 28 84H74',
  3: 'M28 24C34 10 70 10 70 32C70 46 54 50 44 50C56 50 72 54 72 68C72 90 32 90 26 74', 4: 'M62 84V16L24 62H78', 5: 'M72 16H32L30 48C42 40 72 44 72 66C72 90 34 90 26 74',
  6: 'M72 62A22 22 0 1 0 28 62A22 22 0 1 0 72 62ZM28 62C28 30 40 18 66 18', 7: 'M26 16H74L42 84', 8: 'M50 16A18 16 0 1 0 50 48A18 16 0 1 0 50 16ZM50 48A22 18 0 1 0 50 84A22 18 0 1 0 50 48Z',
  9: 'M72 38A22 22 0 1 0 28 38A22 22 0 1 0 72 38ZM72 38C72 70 60 82 34 82',
  T: 'M24 16H76M50 16V84', U: 'M26 16V58A24 24 0 0 0 74 58V16', V: 'M24 16L50 84L76 16', W: 'M20 16L35 84L50 36L65 84L80 16',
  X: 'M26 16L74 84M74 16L26 84', Y: 'M24 16L50 52L76 16M50 52V84', Z: 'M26 16H74L26 84H74',
};

export const FONT_LIST = [{ id: 'geo', name: 'Geometric' }, { id: 'inter', name: 'Inter' }, { id: 'archivo-black', name: 'Archivo Black' }, { id: 'bebas-neue', name: 'Bebas Neue' }, { id: 'syne', name: 'Syne' }, { id: 'unbounded', name: 'Unbounded' }, { id: 'playfair-display', name: 'Playfair Display' }, { id: 'alfa-slab-one', name: 'Alfa Slab One' }, { id: 'pacifico', name: 'Pacifico' }, { id: 'righteous', name: 'Righteous' }, { id: 'orbitron', name: 'Orbitron' }, { id: 'press-start-2p', name: 'Press Start 2P' }, { id: 'space-mono', name: 'Space Mono' }, { id: 'fredoka', name: 'Fredoka' }, { id: 'black-ops-one', name: 'Black Ops One' }, { id: 'bungee', name: 'Bungee' }, { id: 'cinzel', name: 'Cinzel' }, { id: 'permanent-marker', name: 'Permanent Marker' }, { id: 'chakra-petch', name: 'Chakra Petch' }, { id: 'bowlby-one', name: 'Bowlby One' }];
export const FONTS = {}; // id -> { glyph: path } once loaded (outlines made by scripts/marks-fonts.mjs from OFL fonts)
export const registerFont = (f) => { FONTS[f.id] = f.glyphs; };
export const DEFAULT_STYLE = { fg: '#ffffff', bgType: 'solid', bg: '#111111', bg2: '#5b4bff', stops: ['#3b5bff', '#8a4dff'], font: 'geo', bold: 0, angle: 135, shape: 'rounded', radius: 22, pad: 18, borderW: 0, border: '#ffffff', weight: 14, cap: 'butt', join: 'miter' };

const squirclePts = (n = 4, steps = 96) => { const pts = []; for (let i = 0; i < steps; i++) { const t = (i / steps) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); pts.push([50 + 50 * Math.sign(c) * Math.abs(c) ** (2 / n), 50 + 50 * Math.sign(s) * Math.abs(s) ** (2 / n)]); } return pts; };

// A full SVG for one mark with its container. size = pixel width/height (omit for a scalable SVG).
export function markSvg(mark, st = {}, size, uid = 'm') {
  st = { ...DEFAULT_STYLE, ...st };
  const letter = mark.k === 'l', bw = +st.borderW || 0, half = bw / 2;
  const k = (100 - 2 * st.pad) / 100 * (letter ? 1.18 : 1);
  const glyph = letter && st.font !== 'geo' ? FONTS[st.font]?.[mark.ch] : null;
  const ink = glyph
    ? `<path d="${glyph}" fill="${st.fg}"${+st.bold > 0 ? ` stroke="${st.fg}" stroke-width="${st.bold}" stroke-linejoin="round"` : ''}/>`
    : letter
    ? `<path d="${LETTERS[mark.ch]}" fill="none" stroke="${st.fg}" stroke-width="${st.weight}" stroke-linecap="${st.cap}" stroke-linejoin="${st.join}" stroke-miterlimit="2"/>`
    : mark.k === 'f'
    ? `<path d="${famPath(mark.fam, mark.seed)}" fill="${st.fg}" fill-rule="evenodd"/>`
    : `<path d="${geoPath(mark.seed)}" fill="${st.fg}" fill-rule="evenodd"/>`;
  let defs = '', fill = 'none';
  if (st.bgType === 'solid') fill = st.bg;
  if (st.bgType === 'gradient') {
    const stops = Array.isArray(st.stops) && st.stops.length >= 2 ? st.stops : [st.bg, st.bg2];
    const a = (st.angle * Math.PI) / 180, dx = Math.sin(a) / 2, dy = -Math.cos(a) / 2;
    defs = `<defs><linearGradient id="${uid}g" x1="${f2(0.5 - dx)}" y1="${f2(0.5 - dy)}" x2="${f2(0.5 + dx)}" y2="${f2(0.5 + dy)}">${stops.map((c, i) => `<stop offset="${f2(i / (stops.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`;
    fill = `url(#${uid}g)`;
  }
  const stroke = bw ? ` stroke="${st.border}" stroke-width="${bw}"` : '';
  let shape;
  if (st.shape === 'circle') shape = `<circle cx="50" cy="50" r="${50 - half}" fill="${fill}"${stroke}/>`;
  else if (st.shape === 'squircle') { const sc = (100 - bw) / 100; shape = `<path d="M${squirclePts().map(([x, y]) => `${f2(50 + (x - 50) * sc)} ${f2(50 + (y - 50) * sc)}`).join('L')}Z" fill="${fill}"${stroke}/>`; }
  else { const r = st.shape === 'square' ? 0 : Math.max(0, +st.radius - half); shape = `<rect x="${half}" y="${half}" width="${100 - bw}" height="${100 - bw}" rx="${r}" fill="${fill}"${stroke}/>`; }
  const wh = size ? ` width="${size}" height="${size}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg"${wh} viewBox="0 0 100 100">${defs}${shape}<g transform="translate(50 50) scale(${f2(k)}) translate(-50 -50)">${ink}</g></svg>`;
}

export const markId = (m) => (m.k === 'l' ? `l-${m.ch}` : m.k === 'f' ? `f-${m.fam}-${m.seed.toString(36)}` : `g-${m.seed.toString(36)}`);
export const parseMarkId = (s) => { const fm = /^f-(ov|bu|st|ck|rb|hx|sc|sl|pl|pw|sp|an|sk)-([0-9a-z]+)$/i.exec(s || ''); if (fm) { const seed = parseInt(fm[2], 36); return Number.isFinite(seed) ? { k: 'f', fam: fm[1].toLowerCase(), seed } : null; } const m = /^(g|l)-([0-9a-z]+)$/i.exec(s || ''); if (!m) return null; if (m[1] === 'l') return LETTERS[m[2].toUpperCase()] ? { k: 'l', ch: m[2].toUpperCase() } : null; const seed = parseInt(m[2], 36); return Number.isFinite(seed) ? { k: 'g', seed } : null; };

// Quality filter for the curated set and "Generate more": skip plain, empty, near-full or very busy compositions.
const AREA = { sq: 1, qd: 0.785, qi: 0.215, hd: 0.393, tri: 0.5, ci: 0.785, cs: 0.246, lens: 0.571, dm: 0.5, bar: 0.5 };
export function isGood(seed) {
  const { n, sym, cells } = geoParams(seed), mult = GROUPS[sym].length, live = cells.filter((c) => c.p);
  const shapes = live.length * mult, cover = live.reduce((s, c) => s + AREA[c.p], 0) * mult / (n * n);
  const kinds = new Set(live.map((c) => c.p)).size;
  return shapes >= 3 && shapes <= (n === 4 ? 10 : n === 3 ? 6 : 4) && cover >= 0.38 && cover <= 0.78 && kinds >= 2;
}
export function goodSeeds(from, count) { const out = []; for (let s = from; out.length < count; s++) if (isGood(s)) out.push(s); return out; }

// Hand-picked from the generator: distinct, bold, readable at 16px.
export const CURATED = [2, 4, 22, 29, 44, 57, 60, 62, 63, 72, 141, 147, 159, 165, 204, 278, 329, 387, 390, 400, 403, 408, 410, 414, 422, 428, 442, 459, 498, 539, 547, 596, 682, 741, 785, 807, 833, 837, 897, 1116, 1222, 1246, 1485, 1490, 1520, 1525, 1643, 1694, 1717, 1748, 1766, 1789, 1861, 1905, 1991, 2012, 2059, 2083, 2099, 2144];
