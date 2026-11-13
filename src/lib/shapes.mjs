// Shared shape helpers for concept files.
export const pick = (k, arr) => arr[k.tier];

// Teardrop polygon (apex up, round bottom).
export function dropPts(cx, top, bot, w, n = 24) {
  const r = w / 2, cy = bot - r, d = cy - top, a = Math.asin(Math.min(1, r / d));
  const phiR = a - Math.PI / 2, phiL = 1.5 * Math.PI - a;
  const pts = [[cx, top]];
  for (let i = 0; i <= n; i++) { const p = phiR + ((phiL - phiR) * i) / n; pts.push([cx + r * Math.cos(p), cy + r * Math.sin(p)]); }
  return pts;
}

// Arc on circle (cx, cy, r) from a0 to a1 degrees (y-down, 0 = right), as path commands.
export function arc(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return [['M', x0, y0], ['A', r, r, 0, Math.abs(a1 - a0) > 180 ? 1 : 0, a1 > a0 ? 1 : 0, x1, y1]];
}

// Flame fitted to a box.
export function flame(x0, y0, x1, y1) {
  const X = (t) => x0 + t * (x1 - x0), Y = (t) => y0 + t * (y1 - y0);
  return [['M', X(0.5), Y(0)], ['C', X(0.62), Y(0.2), X(0.86), Y(0.36), X(0.86), Y(0.64)], ['C', X(0.86), Y(0.85), X(0.7), Y(1), X(0.5), Y(1)],
    ['C', X(0.3), Y(1), X(0.14), Y(0.85), X(0.14), Y(0.64)], ['C', X(0.14), Y(0.48), X(0.24), Y(0.36), X(0.33), Y(0.27)],
    ['C', X(0.36), Y(0.38), X(0.42), Y(0.44), X(0.47), Y(0.46)], ['C', X(0.44), Y(0.3), X(0.45), Y(0.14), X(0.5), Y(0)], ['Z']];
}

// Gear polygon.
export function gearPts(cx, cy, Ro, Ri, N, tipFrac, rootFrac) {
  const pitch = (2 * Math.PI) / N, ht = pitch * tipFrac, hr = pitch * rootFrac, pts = [];
  for (let i = 0; i < N; i++) {
    const a = i * pitch - Math.PI / 2;
    for (const [r, da] of [[Ri, -hr], [Ro, -ht], [Ro, ht], [Ri, hr]]) pts.push([cx + r * Math.cos(a + da), cy + r * Math.sin(a + da)]);
  }
  return pts;
}

// Plus sign as 12-point polygon (zero-width; use offsetPoly to give it weight).
export function plusPts(cx, cy, a) {
  return [[cx, cy - a], [cx, cy], [cx + a, cy], [cx, cy], [cx, cy + a], [cx, cy], [cx - a, cy], [cx, cy]];
}

// Samplers (normalized point lists) for boolean shapes.
export const circlePts = (cx, cy, r, n = 40) => Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
export const quadPts = (p0, c, p1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]; });
