// Drawing kit: per-size grid, stroke and detail tier.
// Concepts draw in normalized live-area coordinates (0..1). The kit maps them to
// pixels for one size and snaps to a 0.25px grid. Each size gets its own geometry
// via `tier`, its own stroke and its own padding — nothing is scaled from 24.

export const SIZES = [16, 20, 24, 32, 48];

export const GRID = {
  16: { pad: 1, stroke: 1.25, min: 1, max: 1.75, tier: 0 },
  20: { pad: 1, stroke: 1.5, min: 1, max: 2, tier: 1 },
  24: { pad: 2, stroke: 1.75, min: 1.25, max: 2.5, tier: 2 },
  32: { pad: 2, stroke: 2.25, min: 1.5, max: 3, tier: 3 },
  48: { pad: 3, stroke: 3, min: 2, max: 4, tier: 4 },
};

const r2 = (v) => +v.toFixed(2);
const snap = (v) => Math.round(v * 4) / 4;

// Keylines (normalized live area) so round, square and rectangular shapes carry equal optical weight.
export const KEY = {
  circle: [0, 0, 1, 1],
  square: [0.08, 0.08, 0.92, 0.92],
  portrait: [0.12, 0, 0.88, 1],
  landscape: [0, 0.12, 1, 0.88],
  radius: 0.14, // standard corner radius
};

export function kit(size, style) {
  const { pad, stroke: sw, tier } = GRID[size];
  const L = size - 2 * pad;
  const solid = style === 'solid';
  const X = (t, s = true) => r2(s ? snap(pad + t * L) : pad + t * L);
  const len = (t) => r2(t * L);

  // Path DSL: [['M',x,y],['L',x,y],['H',x],['V',y],['C',..6],['Q',..4],['A',rx,ry,rot,laf,sf,x,y],['Z']]
  function path(cmds, { snap: s = true } = {}) {
    return cmds
      .map(([c, ...a]) => {
        switch (c) {
          case 'M': case 'L': case 'H': case 'V': case 'C': case 'Q':
            return c + a.map((v) => X(v, s)).join(' ');
          case 'A':
            return `A${len(a[0])} ${len(a[1])} ${a[2]} ${a[3]} ${a[4]} ${X(a[5], s)} ${X(a[6], s)}`;
          case 'Z':
            return 'Z';
        }
      })
      .join('');
  }

  // Rounded rect in normalized coords; r normalized.
  function rrect(x0, y0, x1, y1, r) {
    return path([
      ['M', x0 + r, y0], ['H', x1 - r], ['A', r, r, 0, 0, 1, x1, y0 + r],
      ['V', y1 - r], ['A', r, r, 0, 0, 1, x1 - r, y1],
      ['H', x0 + r], ['A', r, r, 0, 0, 1, x0, y1 - r],
      ['V', y0 + r], ['A', r, r, 0, 0, 1, x0 + r, y0], ['Z'],
    ]);
  }

  function circle(cx, cy, r) {
    return path([['M', cx - r, cy], ['A', r, r, 0, 1, 0, cx + r, cy], ['A', r, r, 0, 1, 0, cx - r, cy], ['Z']], { snap: false });
  }

  function poly(pts, { closed = true, snap: s = true } = {}) {
    return path([['M', ...pts[0]], ...pts.slice(1).map((p) => ['L', ...p]), ...(closed ? [['Z']] : [])], { snap: s });
  }

  // Capsule between two normalized points, width in px (absolute). Used for knockouts.
  function capsule(x1, y1, x2, y2, wpx) {
    const ax = X(x1, false), ay = X(y1, false), bx = X(x2, false), by = X(y2, false);
    const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
    const nx = (-dy / d) * (wpx / 2), ny = (dx / d) * (wpx / 2), r = r2(wpx / 2);
    const p = (x, y) => `${r2(x)} ${r2(y)}`;
    return `M${p(ax + nx, ay + ny)}L${p(bx + nx, by + ny)}A${r} ${r} 0 0 0 ${p(bx - nx, by - ny)}L${p(ax - nx, ay - ny)}A${r} ${r} 0 0 0 ${p(ax + nx, ay + ny)}Z`;
  }

  // Solid style paints fills with a baked stroke (same colour) so solid and outline
  // share one footprint. Holes must therefore be drawn larger by one stroke width.
  const holeW = (visualPx) => visualPx + sw; // path width for a hole that reads as visualPx
  const holeN = (visualPx) => holeW(visualPx) / L; // same, normalized
  const grow = sw / 2 / L; // normalized half-stroke

  return { size, style, solid, pad, L, sw, tier, X, len, path, rrect, circle, poly, capsule, holeW, holeN, grow };
}

export function svg(size, style, elements) {
  const { stroke } = GRID[size];
  const common = `xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"`;
  if (style === 'outline') {
    const body = elements.map((d) => `<path d="${d}"/>`).join('');
    return `<svg ${common} fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="li li-outline">${body}</svg>\n`;
  }
  const body = elements
    .map((e) => (e.fill ? `<path d="${e.d}" fill-rule="evenodd"/>` : `<path d="${e.d}" fill="none"/>`))
    .join('');
  return `<svg ${common} fill="currentColor" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="li li-solid">${body}</svg>\n`;
}
