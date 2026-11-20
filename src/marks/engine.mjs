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
const pickPrim = (r) => { const tot = WEIGHTS.reduce((s, w) => s + w[1], 0); let x = r() * tot; for (const [k, w] of WEIGHTS) { if ((x -= w) < 0) return k; } return 'sq'; };

// Symmetry groups, as transforms on the 100 x 100 mark box. flip = the transform reverses handedness (arcs change sweep).
const T = {
  I: [(x, y) => [x, y], false], MX: [(x, y) => [100 - x, y], true], MY: [(x, y) => [x, 100 - y], true],
  R90: [(x, y) => [100 - y, x], false], R180: [(x, y) => [100 - x, 100 - y], false], R270: [(x, y) => [y, 100 - x], false],
};
const GROUPS = { none: ['I'], mx: ['I', 'MX'], my: ['I', 'MY'], mxy: ['I', 'MX', 'MY', 'R180'], rot4: ['I', 'R90', 'R180', 'R270'] };
const rot90cell = ([x, y]) => [1 - y, x];
const f2 = (v) => +v.toFixed(2);

export function geoParams(seed) {
  const r = mulberry(seed);
  const n = r() < 0.2 ? 3 : r() < 0.5 ? 2 : 4;
  const sym = n === 3 ? 'none' : ['mx', 'my', 'mxy', 'rot4', 'rot4', 'mxy'][Math.floor(r() * 6)];
  const cells = [], base = (i, j) => (sym === 'none' ? true : sym === 'mx' ? i < n / 2 : sym === 'my' ? j < n / 2 : i < n / 2 && j < n / 2);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (base(i, j)) cells.push({ i, j, p: pickPrim(r), o: Math.floor(r() * 4) });
  return { n, sym, cells };
}

// The mark as one path (even-odd fill) in a 100 x 100 box.
export function geoPath(seed) {
  const { n, sym, cells } = geoParams(seed), s = 100 / n, out = [];
  for (const c of cells) {
    if (!c.p) continue;
    let ops = PRIM[c.p].map((op) => op.slice());
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

export const FONT_LIST = [{ id: 'geo', name: 'Geometric' }, { id: 'inter', name: 'Inter' }, { id: 'space-grotesk', name: 'Space Grotesk' }, { id: 'poppins', name: 'Poppins' }, { id: 'archivo-black', name: 'Archivo Black' }, { id: 'bebas-neue', name: 'Bebas Neue' }, { id: 'syne', name: 'Syne' }, { id: 'unbounded', name: 'Unbounded' }, { id: 'dm-serif-display', name: 'DM Serif Display' }, { id: 'playfair-display', name: 'Playfair Display' }];
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

export const markId = (m) => (m.k === 'l' ? `l-${m.ch}` : `g-${m.seed.toString(36)}`);
export const parseMarkId = (s) => { const m = /^(g|l)-([0-9a-z]+)$/i.exec(s || ''); if (!m) return null; if (m[1] === 'l') return LETTERS[m[2].toUpperCase()] ? { k: 'l', ch: m[2].toUpperCase() } : null; const seed = parseInt(m[2], 36); return Number.isFinite(seed) ? { k: 'g', seed } : null; };

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
export const CURATED = [2, 4, 22, 29, 44, 57, 60, 62, 63, 72, 141, 147, 159, 165, 204, 210, 219, 278, 305, 316, 329, 387, 390, 400, 403, 408, 410, 414, 422, 428, 442, 459, 463, 498, 507, 539, 547, 596, 682, 741, 747, 785, 807, 833, 837, 897, 931, 1116];
