// Lithos Atmospheres (added 2026-11-21): backgrounds for four levels of a page (page, section, card, card hover).
// An atmosphere is plain data. This module turns it into CSS (with motion) and static SVG (for Figma).
import { markSvg, parseMarkId } from '../marks/engine.mjs';

export const LEVELS = ['page', 'section', 'card'];
export const BG_TYPES = ['solid', 'linear', 'radial', 'conic', 'mesh'];
export const PATTERNS = ['none', 'dots', 'grid', 'lines', 'plus', 'waves', 'checks', 'triangles', 'rings', 'scales', 'truchet', 'marks'];
export const MOTIONS = ['none', 'drift', 'flow', 'shimmer', 'pulse'];
export const HOVERS = ['none', 'lift', 'glow', 'shift', 'reveal', 'tint'];

const f = (n) => +(+n).toFixed(2);
const hex = (h) => { h = (h || '#000').replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0); };
const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${f(a)})`; };
const lum = (h) => { const [r, g, b] = hex(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const inkFor = (L) => { const st = L.bg.type === 'solid' ? [L.bg.stops[0]] : L.bg.stops; return st.reduce((a, c) => a + lum(c), 0) / st.length > 0.36 ? '#111214' : '#ffffff'; };
const uri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')}")`;
const MESH_AT = [[18, 22], [84, 16], [80, 84], [16, 82], [52, 50]];

// Pattern tile: { w, h, inner } in px. Drawn in one colour, so CSS and SVG share it.
export function tile(p) {
  const s = p.size, w = p.weight, c = p.color, o = p.opacity, st = `stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" fill="none"`, fl = `fill="${c}" fill-opacity="${o}"`;
  switch (p.type) {
    case 'dots': return { w: s, h: s, inner: `<circle cx="${s / 2}" cy="${s / 2}" r="${f(w)}" ${fl}/>` };
    case 'grid': return { w: s, h: s, inner: `<path d="M0 ${w / 2}H${s}M${w / 2} 0V${s}" ${st}/>` };
    case 'lines': return { w: s, h: s, inner: `<path d="M-1 1l2-2M0 ${s}L${s} 0M${s - 1} ${s + 1}l2-2" ${st} stroke-linecap="square"/>` };
    case 'plus': { const a = s * 0.16; return { w: s, h: s, inner: `<path d="M${s / 2 - a} ${s / 2}H${s / 2 + a}M${s / 2} ${s / 2 - a}V${s / 2 + a}" ${st} stroke-linecap="round"/>` }; }
    case 'waves': return { w: s * 2, h: s, inner: `<path d="M0 ${s / 2}Q${s / 2} ${f(s * 0.1)} ${s} ${s / 2}T${s * 2} ${s / 2}" ${st}/>` };
    case 'checks': return { w: s, h: s, inner: `<path d="M0 0H${s / 2}V${s / 2}H0ZM${s / 2} ${s / 2}H${s}V${s}H${s / 2}Z" ${fl}/>` };
    case 'triangles': return { w: s, h: s, inner: `<path d="M${s / 2} ${f(s * 0.2)}L${f(s * 0.8)} ${f(s * 0.75)}H${f(s * 0.2)}Z" ${fl}/>` };
    case 'rings': return { w: s, h: s, inner: `<circle cx="${s / 2}" cy="${s / 2}" r="${f(s * 0.3)}" ${st}/>` };
    case 'scales': return { w: s, h: s / 2, inner: `<path d="M0 ${s / 2}A${s / 2} ${s / 2} 0 0 1 ${s} ${s / 2}M${-s / 2} 0A${s / 2} ${s / 2} 0 0 1 ${s / 2} 0A${s / 2} ${s / 2} 0 0 1 ${s * 1.5} 0" ${st}/>` };
    case 'truchet': { const h = s / 2, arc = (x, y, o2) => (o2 ? `M${x + h} ${y}A${h} ${h} 0 0 0 ${x} ${y + h}M${x + s} ${y + h}A${h} ${h} 0 0 0 ${x + h} ${y + s}` : `M${x + h} ${y}A${h} ${h} 0 0 1 ${x + s} ${y + h}M${x} ${y + h}A${h} ${h} 0 0 1 ${x + h} ${y + s}`); return { w: s * 2, h: s * 2, inner: `<path d="${arc(0, 0, 1)}${arc(s, 0, 0)}${arc(0, s, 0)}${arc(s, s, 1)}" ${st}/>` }; }
    case 'marks': { const m = parseMarkId(p.mark || 'g-2'); if (!m) return null; const k = s * 0.55, svg = markSvg(m, { bgType: 'none', fg: c, pad: 0 }, k, 'pt').replace('<svg ', `<svg x="${f((s - k) / 2)}" y="${f((s - k) / 2)}" opacity="${o}" `); return { w: s, h: s, inner: svg }; }
    default: return null;
  }
}
const tileSvg = (t) => `<svg xmlns="http://www.w3.org/2000/svg" width="${f(t.w)}" height="${f(t.h)}" viewBox="0 0 ${f(t.w)} ${f(t.h)}">${t.inner}</svg>`;
const grainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.4 -0.2"/></filter><rect width="180" height="180" filter="url(#n)"/></svg>`;
const shapeSvg = (sh) => { const m = parseMarkId(sh.mark || ''); return m ? markSvg(m, { bgType: 'none', fg: sh.color, pad: 0 }, 400, 'sh') : null; };

// CSS gradient layers for a background (top first). The last layer may be a colour.
function bgLayers(bg) {
  const st = bg.stops;
  if (bg.type === 'solid') return [{ img: `linear-gradient(${st[0]},${st[0]})`, size: 'auto', pos: '0 0', grad: true }];
  if (bg.type === 'linear') return [{ img: `linear-gradient(${bg.angle}deg,${st.join(',')})`, size: 'auto', pos: '0 0', grad: true }];
  if (bg.type === 'radial') return [{ img: `radial-gradient(120% 120% at ${bg.cx ?? 30}% ${bg.cy ?? 20}%,${st.join(',')})`, size: 'auto', pos: '0 0', grad: true }];
  if (bg.type === 'conic') return [{ img: `conic-gradient(from ${bg.angle}deg at 50% 50%,${st.join(',')},${st[0]})`, size: 'auto', pos: '0 0', grad: true }];
  const blobs = st.slice(1).map((c, i) => ({ img: `radial-gradient(60% 60% at ${MESH_AT[i % 5][0]}% ${MESH_AT[i % 5][1]}%,${c} 0%,${rgba(c, 0)} 70%)`, size: 'auto', pos: '0 0', grad: true }));
  return [...blobs, { img: `linear-gradient(${st[0]},${st[0]})`, size: 'auto', pos: '0 0', grad: true }];
}

function layers(L) {
  const out = [];
  if (L.grain > 0) out.push({ img: uri(grainSvg.replace('<svg ', `<svg opacity="${f(L.grain)}" `)), size: '180px 180px', pos: '0 0' });
  if (L.shape && L.shape.mark) { const sv = shapeSvg(L.shape); if (sv) out.push({ img: uri(sv.replace('<svg ', `<svg opacity="${f(L.shape.opacity)}" `)), size: `${L.shape.size}% auto`, pos: `${L.shape.x}% ${L.shape.y}%`, rep: 'no-repeat' }); }
  if (L.pat && L.pat.type !== 'none') { const t = tile(L.pat); if (t) out.push({ img: uri(tileSvg(t)), size: `${f(t.w)}px ${f(t.h)}px`, pos: '0 0', pat: t }); }
  return out.concat(bgLayers(L.bg));
}

// Inline style for thumbnails (static, no motion).
export function levelStyle(L) {
  const ls = layers(L);
  return `background-image:${ls.map((l) => l.img).join(',')};background-size:${ls.map((l) => l.size).join(',')};background-position:${ls.map((l) => l.pos).join(',')};background-repeat:${ls.map((l) => l.rep || 'repeat').join(',')};color:${inkFor(L)}`;
}

// CSS for one level, plus its keyframes.
function levelCss(sel, L, name, hover) {
  const ls = layers(L), m = L.motion || { type: 'none', speed: 16 }, ink = inkFor(L), rules = [], keys = [];
  const shiftable = (hover && hover.type === 'shift') || m.type === 'flow';
  if (shiftable) ls.forEach((l) => { if (l.grad) { l.size = '200% 200%'; l.pos = '0% 0%'; } });
  const decl = [`color:${ink}`, `background-color:${L.bg.stops[0]}`, `background-image:${ls.map((l) => l.img).join(',')}`, `background-size:${ls.map((l) => l.size).join(',')}`, `background-position:${ls.map((l) => l.pos).join(',')}`, `background-repeat:${ls.map((l) => l.rep || 'repeat').join(',')}`];
  if (L.radius != null) decl.push(`border-radius:${L.radius}px`);
  const needPos = m.type === 'shimmer' || m.type === 'pulse' || (hover && hover.type === 'reveal');
  if (needPos) decl.push('position:relative', 'isolation:isolate', 'overflow:hidden');
  if (m.type === 'drift') {
    const end = ls.map((l) => (l.pat ? `${f(l.pat.w * 2)}px ${f(l.pat.h * 2)}px` : l.pos)).join(',');
    keys.push(`@keyframes ${name}-drift{to{background-position:${end}}}`);
    decl.push(`animation:${name}-drift ${m.speed}s linear infinite`);
  } else if (m.type === 'flow') {
    const end = ls.map((l) => (l.grad ? '100% 100%' : l.pos)).join(',');
    keys.push(`@keyframes ${name}-flow{to{background-position:${end}}}`);
    decl.push(`animation:${name}-flow ${m.speed}s ease-in-out infinite alternate`);
  }
  rules.push(`${sel}{${decl.join(';')}}`);
  if (m.type === 'shimmer') {
    rules.push(`${sel}::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(105deg,transparent 35%,${rgba(ink === '#ffffff' ? '#ffffff' : '#ffffff', ink === '#ffffff' ? 0.16 : 0.5)} 50%,transparent 65%);background-size:250% 100%;animation:${name}-shim ${m.speed}s ease-in-out infinite}`);
    keys.push(`@keyframes ${name}-shim{from{background-position:120% 0}to{background-position:-120% 0}}`);
  }
  if (m.type === 'pulse' && !(hover && hover.type === 'reveal')) {
    const c = L.bg.stops[L.bg.stops.length - 1];
    rules.push(`${sel}::before{content:"";position:absolute;inset:-20%;z-index:-1;pointer-events:none;background:radial-gradient(40% 40% at 70% 35%,${rgba(c, 0.55)},transparent 70%),radial-gradient(35% 35% at 25% 75%,${rgba(L.bg.stops[1] || c, 0.45)},transparent 70%);animation:${name}-pulse ${m.speed}s ease-in-out infinite alternate}`);
    keys.push(`@keyframes ${name}-pulse{from{transform:scale(1) rotate(0)}to{transform:scale(1.15) rotate(8deg);opacity:.7}}`);
  }
  if (hover && hover.type !== 'none') {
    const c = hover.color, k = hover.strength;
    rules.push(`${sel}{transition:transform .25s ease,box-shadow .25s ease,background-position .6s ease}`);
    if (hover.type === 'lift') rules.push(`${sel}:hover{transform:translateY(-${f(2 + 4 * k)}px);box-shadow:0 ${f(8 + 16 * k)}px ${f(24 + 30 * k)}px -12px ${rgba('#000000', 0.25 + 0.25 * k)}}`);
    if (hover.type === 'glow') rules.push(`${sel}:hover{box-shadow:0 0 0 1.5px ${rgba(c, 0.9)},0 10px ${f(30 + 40 * k)}px -6px ${rgba(c, 0.35 + 0.4 * k)}}`);
    if (hover.type === 'shift') rules.push(`${sel}:hover{background-position:${ls.map((l) => (l.grad ? '100% 100%' : l.pos)).join(',')}}`);
    if (hover.type === 'tint') rules.push(`${sel}:hover{box-shadow:inset 0 0 0 999px ${rgba(c, 0.06 + 0.14 * k)}}`);
    if (hover.type === 'reveal') {
      const t = tile({ type: hover.pattern || 'dots', size: 14, weight: 1.6, color: c, opacity: 0.5 + 0.4 * k, mark: hover.mark });
      rules.push(`${sel}::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:0;transition:opacity .35s ease;background-image:${uri(tileSvg(t))};background-size:${f(t.w)}px ${f(t.h)}px;-webkit-mask-image:radial-gradient(120% 90% at 100% 100%,#000,transparent 70%);mask-image:radial-gradient(120% 90% at 100% 100%,#000,transparent 70%)}`, `${sel}:hover::before{opacity:1}`);
    }
  }
  return { css: rules.join('\n'), keys };
}

// Full stylesheet. prefix lets the site scope a preview; export uses the default classes.
export function atmosCss(A, prefix = '.atm') {
  const parts = [], keys = [];
  for (const lv of LEVELS) { const r = levelCss(`${prefix}-${lv}`, A[lv], `${prefix.replace(/[^a-z0-9]/gi, '')}-${lv}`, lv === 'card' ? A.hover : null); parts.push(r.css); keys.push(...r.keys); }
  return `${parts.join('\n')}\n${keys.join('\n')}\n@media (prefers-reduced-motion:reduce){${LEVELS.map((l) => `${prefix}-${l},${prefix}-${l}::before,${prefix}-${l}::after`).join(',')}{animation:none!important;transition:none!important}}`;
}

export function exportCss(A) {
  return `/* Lithos Atmosphere: ${A.name || 'Custom'}\n   Use .atm-page on <body> or a wrapper, .atm-section on bands, .atm-card on tiles (hover is built in).\n   Motion stops for people who ask their device to reduce motion. */\n${atmosCss(A).replace(/\}/g, '}\n').replace(/\n\n/g, '\n')}`;
}

// Static SVG of one level, for Figma (paste as layers) and download.
export function levelSvgDoc(L, w, h) {
  const d = [], b = L.bg, st = b.stops, id = 'a' + Math.abs(JSON.stringify(L).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)).toString(36);
  let base;
  if (b.type === 'solid') base = `<rect width="${w}" height="${h}" fill="${st[0]}"/>`;
  else if (b.type === 'linear' || b.type === 'conic') {
    const a = ((b.angle - 90) * Math.PI) / 180, dx = Math.cos(a) / 2, dy = Math.sin(a) / 2;
    d.push(`<linearGradient id="${id}g" x1="${f(0.5 - dx)}" y1="${f(0.5 - dy)}" x2="${f(0.5 + dx)}" y2="${f(0.5 + dy)}">${st.map((c, i) => `<stop offset="${f(i / Math.max(1, st.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient>`);
    base = `<rect width="${w}" height="${h}" fill="url(#${id}g)"/>`;
  } else if (b.type === 'radial') {
    d.push(`<radialGradient id="${id}g" cx="${(b.cx ?? 30) / 100}" cy="${(b.cy ?? 20) / 100}" r="1.2">${st.map((c, i) => `<stop offset="${f(i / Math.max(1, st.length - 1))}" stop-color="${c}"/>`).join('')}</radialGradient>`);
    base = `<rect width="${w}" height="${h}" fill="url(#${id}g)"/>`;
  } else {
    base = `<rect width="${w}" height="${h}" fill="${st[0]}"/>` + st.slice(1).map((c, i) => { d.push(`<radialGradient id="${id}m${i}" cx="${MESH_AT[i % 5][0] / 100}" cy="${MESH_AT[i % 5][1] / 100}" r=".6"><stop offset="0" stop-color="${c}"/><stop offset=".7" stop-color="${c}" stop-opacity="0"/></radialGradient>`); return `<rect width="${w}" height="${h}" fill="url(#${id}m${i})"/>`; }).join('');
  }
  const body = [base];
  if (L.pat && L.pat.type !== 'none') { const t = tile(L.pat); if (t) { d.push(`<pattern id="${id}p" width="${f(t.w)}" height="${f(t.h)}" patternUnits="userSpaceOnUse">${t.inner}</pattern>`); body.push(`<rect width="${w}" height="${h}" fill="url(#${id}p)"/>`); } }
  if (L.shape && L.shape.mark) { const sv = shapeSvg(L.shape); if (sv) { const sz = (w * L.shape.size) / 100; body.push(sv.replace('<svg ', `<svg x="${f((w - sz) * (L.shape.x / 100))}" y="${f((h - sz) * (L.shape.y / 100))}" width="${f(sz)}" height="${f(sz)}" opacity="${L.shape.opacity}" `).replace(/ width="400" height="400"/, '')); } }
  if (L.grain > 0) { d.push(`<filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.4 -0.2"/></filter>`); body.push(`<rect width="${w}" height="${h}" filter="url(#${id}n)" opacity="${f(L.grain)}"/>`); }
  const clip = L.radius ? `<clipPath id="${id}c"><rect width="${w}" height="${h}" rx="${L.radius}"/></clipPath>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${d.join('')}${clip}</defs><g${clip ? ` clip-path="url(#${id}c)"` : ''}>${body.join('')}</g></svg>`;
}

// ---------- presets ----------
const P = (type, size, weight, color, opacity, extra = {}) => ({ type, size, weight, color, opacity, ...extra });
const NOP = { type: 'none', size: 24, weight: 1, color: '#ffffff', opacity: 0.2 };
const NOS = { mark: null, size: 60, x: 100, y: 50, opacity: 0.1, color: '#ffffff' };
const M = (type = 'none', speed = 18) => ({ type, speed });
const lvl = (bg, o = {}) => ({ bg, pat: o.pat || NOP, shape: o.shape || NOS, grain: o.grain ?? 0, motion: o.motion || M(), ...(o.radius != null ? { radius: o.radius } : {}) });
const bg = (type, stops, angle = 135) => ({ type, stops, angle });

export const PRESETS = [
  { name: 'Graphite grid', page: lvl(bg('solid', ['#0d0e10']), { pat: P('grid', 32, 1, '#ffffff', 0.05) }), section: lvl(bg('radial', ['#23262b', '#0d0e10']), { pat: P('grid', 32, 1, '#ffffff', 0.08), motion: M('drift', 30) }), card: lvl(bg('linear', ['#1b1d21', '#141518'], 160), { radius: 16 }), hover: { type: 'glow', color: '#7aa2ff', strength: 0.6 } },
  { name: 'Aurora', page: lvl(bg('mesh', ['#070a14', '#1d2b6b', '#5b2a86']), { grain: 0.08 }), section: lvl(bg('mesh', ['#0a0f24', '#2f5bff', '#9b4dff', '#00d1b2']), { grain: 0.1, motion: M('pulse', 10) }), card: lvl(bg('linear', ['rgba(255,255,255,0)', '#ffffff'].map(() => '#12172e'), 160), { radius: 18 }), hover: { type: 'glow', color: '#9b4dff', strength: 0.8 } },
  { name: 'Paper dots', page: lvl(bg('solid', ['#f6f3ee']), { pat: P('dots', 22, 1.1, '#111111', 0.12) }), section: lvl(bg('solid', ['#efe9df']), { pat: P('dots', 22, 1.4, '#111111', 0.18), grain: 0.12 }), card: lvl(bg('solid', ['#ffffff']), { radius: 14 }), hover: { type: 'lift', color: '#111111', strength: 0.6 } },
  { name: 'Blueprint', page: lvl(bg('solid', ['#0b2a5b']), { pat: P('grid', 24, 1, '#ffffff', 0.08) }), section: lvl(bg('linear', ['#0d3a7d', '#0b2a5b'], 180), { pat: P('grid', 48, 1.2, '#ffffff', 0.16), motion: M('drift', 40) }), card: lvl(bg('solid', ['#0f3470']), { pat: P('plus', 18, 1, '#ffffff', 0.14), radius: 6 }), hover: { type: 'reveal', color: '#8fc1ff', strength: 0.7, pattern: 'grid' } },
  { name: 'Sunset mesh', page: lvl(bg('linear', ['#fff4ec', '#ffe9f0'], 180)), section: lvl(bg('mesh', ['#ff7a59', '#ffb36b', '#ff4f8b', '#ffd36e']), { grain: 0.14, motion: M('flow', 14) }), card: lvl(bg('solid', ['#ffffff']), { radius: 20 }), hover: { type: 'tint', color: '#ff7a59', strength: 0.6 } },
  { name: 'Mint truchet', page: lvl(bg('solid', ['#eaf7f1'])), section: lvl(bg('linear', ['#0f9d77', '#0b7c63'], 135), { pat: P('truchet', 36, 2.5, '#ffffff', 0.16), motion: M('drift', 36) }), card: lvl(bg('solid', ['#ffffff']), { pat: P('truchet', 22, 1.2, '#0f9d77', 0.08), radius: 16 }), hover: { type: 'lift', color: '#0f9d77', strength: 0.7 } },
  { name: 'Noir rings', page: lvl(bg('solid', ['#09090b'])), section: lvl(bg('radial', ['#1d1d22', '#09090b']), { pat: P('rings', 40, 1, '#ffffff', 0.08), shape: { mark: 'g-2', size: 44, x: 96, y: 50, opacity: 0.08, color: '#ffffff' } }), card: lvl(bg('solid', ['#131317']), { radius: 12 }), hover: { type: 'reveal', color: '#ffffff', strength: 0.4, pattern: 'rings' } },
  { name: 'Citrus waves', page: lvl(bg('solid', ['#fffbe8'])), section: lvl(bg('linear', ['#ffe14d', '#ffb800'], 120), { pat: P('waves', 26, 2, '#111111', 0.1), motion: M('drift', 22) }), card: lvl(bg('solid', ['#ffffff']), { radius: 18 }), hover: { type: 'shift', color: '#ffb800', strength: 0.6 } },
  { name: 'Lilac haze', page: lvl(bg('linear', ['#f5f2ff', '#eef4ff'], 180), { grain: 0.06 }), section: lvl(bg('mesh', ['#efe9ff', '#c9b8ff', '#a8d4ff', '#ffd1f0']), { grain: 0.08, motion: M('pulse', 12) }), card: lvl(bg('linear', ['#ffffff', '#f7f4ff'], 160), { radius: 22 }), hover: { type: 'glow', color: '#8b6cff', strength: 0.5 } },
  { name: 'Terminal', page: lvl(bg('solid', ['#050806']), { pat: P('lines', 6, 0.6, '#3cff8f', 0.05) }), section: lvl(bg('radial', ['#0c1f13', '#050806']), { pat: P('plus', 20, 1, '#3cff8f', 0.22), motion: M('shimmer', 6) }), card: lvl(bg('solid', ['#0a120c']), { radius: 4 }), hover: { type: 'glow', color: '#3cff8f', strength: 0.7 } },
  { name: 'Sandstone', page: lvl(bg('solid', ['#efe6da']), { grain: 0.16 }), section: lvl(bg('linear', ['#d9b99b', '#c49473'], 160), { pat: P('scales', 30, 1.2, '#ffffff', 0.18), grain: 0.14 }), card: lvl(bg('solid', ['#f7f1e8']), { radius: 10 }), hover: { type: 'lift', color: '#7a5233', strength: 0.5 } },
  { name: 'Marks pattern', page: lvl(bg('solid', ['#111214'])), section: lvl(bg('linear', ['#2b2fff', '#151880'], 140), { pat: P('marks', 56, 1, '#ffffff', 0.14, { mark: 'f-tr-1' }), motion: M('drift', 50) }), card: lvl(bg('solid', ['#1a1b1f']), { radius: 16 }), hover: { type: 'reveal', color: '#7d80ff', strength: 0.8, pattern: 'marks', mark: 'f-tr-1' } },
  { name: 'Prism', page: lvl(bg('solid', ['#0b0b0f'])), section: lvl(bg('conic', ['#ff4d6d', '#ffb84d', '#4dffb8', '#4d9bff', '#b84dff'], 0), { grain: 0.1, motion: M('flow', 16) }), card: lvl(bg('solid', ['#14141a']), { radius: 18 }), hover: { type: 'glow', color: '#ff4d6d', strength: 0.6 } },
  { name: 'Checker pop', page: lvl(bg('solid', ['#fafafa'])), section: lvl(bg('solid', ['#ff5a36']), { pat: P('checks', 40, 1, '#ffffff', 0.12), motion: M('drift', 30) }), card: lvl(bg('solid', ['#ffffff']), { radius: 0 }), hover: { type: 'shift', color: '#ff5a36', strength: 0.6 } },
  { name: 'Ocean', page: lvl(bg('linear', ['#e8f4ff', '#f6fbff'], 180)), section: lvl(bg('linear', ['#003b73', '#0074b7', '#60a3d9'], 160), { pat: P('waves', 40, 1.4, '#ffffff', 0.12), motion: M('drift', 26) }), card: lvl(bg('solid', ['#ffffff']), { radius: 16 }), hover: { type: 'lift', color: '#0074b7', strength: 0.7 } },
  { name: 'Triangles', page: lvl(bg('solid', ['#121212'])), section: lvl(bg('linear', ['#222', '#121212'].map((c) => (c.length === 4 ? '#222222' : c)), 180), { pat: P('triangles', 28, 1, '#ffffff', 0.06), shape: { mark: 'f-gm-1', size: 38, x: 92, y: 40, opacity: 0.12, color: '#ffffff' } }), card: lvl(bg('solid', ['#1a1a1a']), { radius: 14 }), hover: { type: 'reveal', color: '#ffffff', strength: 0.5, pattern: 'triangles' } },
];
PRESETS[1].card = lvl(bg('linear', ['#151b38', '#0e1226'], 160), { radius: 18 });
export const clone = (o) => JSON.parse(JSON.stringify(o));
