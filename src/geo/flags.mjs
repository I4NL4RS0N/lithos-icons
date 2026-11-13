// Pilot flags, 4:3 frame. Official colours; detail reduced at small sizes (tier 0=16 … 4=48).
// draw({ x0, y0, W, H, tier, r2 }) returns SVG elements (clipped to a rounded rect by the builder).

const rect = (x, y, w, h, fill, r2) => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" fill="${fill}"/>`;

export const FLAGS = [
  {
    iso2: 'us', name: 'United States', colors: { red: '#B22234', white: '#FFFFFF', blue: '#3C3B6E' },
    reduction: '16–24: 7 stripes. 32+: 13 stripes. Stars: none at 16–20, 6 at 24, 30 at 32, 50 at 48.',
    draw({ x0, y0, W, H, tier, r2 }) {
      const n = tier >= 3 ? 13 : 7, sh = H / n, cantonRows = tier >= 3 ? 7 : 4;
      let s = rect(x0, y0, W, H, '#FFFFFF', r2);
      for (let i = 0; i < n; i += 2) s += rect(x0, y0 + i * sh, W, sh, '#B22234', r2);
      const cw = Math.min(W * 0.5, 0.76 * H * (W / H > 1.6 ? 1 : 1)), ch = sh * cantonRows;
      s += rect(x0, y0, cw, ch, '#3C3B6E', r2);
      const grid = tier >= 4 ? 'full' : tier === 3 ? [5, 6] : tier === 2 ? [2, 3] : null;
      if (grid === 'full') {
        for (let row = 0; row < 9; row++) {
          const cols = row % 2 ? 5 : 6;
          for (let c = 0; c < cols; c++) {
            const cx = x0 + cw * ((c * 2 + (row % 2 ? 2 : 1)) / 12), cy = y0 + ch * ((row + 1) / 10);
            s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(Math.max(0.35, ch / 30))}" fill="#FFFFFF"/>`;
          }
        }
      } else if (grid) {
        const [rows, cols] = grid;
        for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) {
          const cx = x0 + cw * ((c + 0.5) / cols), cy = y0 + ch * ((row + 0.5) / rows);
          s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(Math.max(0.4, ch / (rows * 5)))}" fill="#FFFFFF"/>`;
        }
      }
      return s;
    },
  },
  {
    iso2: 'jp', name: 'Japan', colors: { white: '#FFFFFF', red: '#BC002D' },
    reduction: 'None.',
    draw({ x0, y0, W, H, r2 }) {
      return rect(x0, y0, W, H, '#FFFFFF', r2) + `<circle cx="${r2(x0 + W / 2)}" cy="${r2(y0 + H / 2)}" r="${r2(H * 0.3)}" fill="#BC002D"/>`;
    },
  },
  {
    iso2: 'de', name: 'Germany', colors: { black: '#000000', red: '#DD0000', gold: '#FFCC00' },
    reduction: 'None.',
    draw({ x0, y0, W, H, r2 }) {
      return rect(x0, y0, W, H / 3, '#000000', r2) + rect(x0, y0 + H / 3, W, H / 3, '#DD0000', r2) + rect(x0, y0 + (2 * H) / 3, W, H / 3, '#FFCC00', r2);
    },
  },
  {
    iso2: 'fr', name: 'France', colors: { blue: '#000091', white: '#FFFFFF', red: '#E1000F' },
    reduction: 'None.',
    draw({ x0, y0, W, H, r2 }) {
      return rect(x0, y0, W / 3, H, '#000091', r2) + rect(x0 + W / 3, y0, W / 3, H, '#FFFFFF', r2) + rect(x0 + (2 * W) / 3, y0, W / 3, H, '#E1000F', r2);
    },
  },
  {
    iso2: 'br', name: 'Brazil', colors: { green: '#009B3A', yellow: '#FEDF00', blue: '#002776', white: '#FFFFFF' },
    reduction: '16–24: green, rhombus, globe. 32+: white band. 48: stars as dots.',
    draw({ x0, y0, W, H, tier, r2 }) {
      const mx = W * 0.085, my = H * 0.12, cx = x0 + W / 2, cy = y0 + H / 2, gr = H * 0.25;
      let s = rect(x0, y0, W, H, '#009B3A', r2);
      s += `<path d="M${r2(x0 + mx)} ${r2(cy)}L${r2(cx)} ${r2(y0 + my)}L${r2(x0 + W - mx)} ${r2(cy)}L${r2(cx)} ${r2(y0 + H - my)}Z" fill="#FEDF00"/>`;
      s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(gr)}" fill="#002776"/>`;
      if (tier >= 3) {
        const bw = Math.max(0.8, gr * 0.16);
        s += `<path d="M${r2(cx - gr * 0.98)} ${r2(cy + gr * 0.05)}Q${r2(cx)} ${r2(cy - gr * 0.55)} ${r2(cx + gr * 0.96)} ${r2(cy + gr * 0.3)}" fill="none" stroke="#FFFFFF" stroke-width="${r2(bw)}"/>`;
      }
      if (tier >= 4) {
        for (const [dx, dy] of [[-0.4, 0.45], [-0.15, 0.6], [0.1, 0.5], [0.35, 0.62], [0.2, 0.25], [-0.45, 0.2], [0.55, 0.4]])
          s += `<circle cx="${r2(cx + dx * gr)}" cy="${r2(cy + dy * gr)}" r="${r2(gr * 0.045)}" fill="#FFFFFF"/>`;
      }
      return s;
    },
  },
];
