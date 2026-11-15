import { pick } from '../lib/shapes.mjs';

export default {
  id: 'cyber-and-outage-risk',
  name: 'Cyber & Outage Risk',
  kind: 'theme',
  metaphor: 'cracked-shield',
  keywords: ['cyber risk', 'cyberattack', 'IT outage', 'operational resilience', 'ransomware'],
  reduction: 'One shield split by a two-kink crack at every size; the crack enters on the right shoulder and leaves on the lower-left curve so it never pinches the points. 16 and 20: wider shield and a slightly flatter zigzag so the gaps stay open. Solid: the crack is a knockout cut right through (1.5px at 16 up to 2.75px at 48), leaving two halves.',
  draw(k) {
    // Shield on the portrait keyline: flat shoulders, straight sides, curved point.
    const x0 = pick(k, [0.07, 0.08, 0.09, 0.1, 0.1]), x1 = 1 - x0;
    const top = 0.01, sh = 0.17, side = 0.5, bot = 0.99;
    const shield = k.path([
      ['M', 0.5, top], ['L', x1, sh], ['L', x1, side],
      ['C', x1, 0.75, 0.7, 0.9, 0.5, bot],
      ['C', 0.3, 0.9, x0, 0.75, x0, side],
      ['L', x0, sh], ['Z'],
    ], { snap: false });

    // Sampled shield for booleans (solid).
    const cub = (p0, p1, p2, p3, n) => Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n, u = 1 - t;
      return [
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ];
    });
    const pts = [
      [0.5, top], [x1, sh], [x1, side],
      ...cub([x1, side], [x1, 0.75], [0.7, 0.9], [0.5, bot], 16).slice(1),
      ...cub([0.5, bot], [0.3, 0.9], [x0, 0.75], [x0, side], 16).slice(1),
      [x0, sh],
    ];

    // Crack: enters on the right shoulder, leaves on the lower-left curve,
    // so it never meets the shield's points at a sharp angle.
    const s0 = 0.64, sy = top + ((s0 - 0.5) / (x1 - 0.5)) * (sh - top);
    const crack = k.tier < 2
      ? [[s0, sy], [0.42, 0.42], [0.61, 0.6], [0.41, 0.945]]
      : [[s0, sy], [0.42, 0.38], [0.62, 0.58], [0.41, 0.945]];
    const crackOut = k.poly(crack, { closed: false, snap: false });

    // Solid: extend the cut past both ends so it splits the shield fully.
    const ext = (a, b, d) => {
      const dx = a[0] - b[0], dy = a[1] - b[1], m = Math.hypot(dx, dy);
      return [a[0] + (dx / m) * d, a[1] + (dy / m) * d];
    };
    const n = crack.length;
    const cut = [ext(crack[0], crack[1], 0.12), ...crack.slice(1, -1), ext(crack[n - 1], crack[n - 2], 0.12)];
    const halves = k.bool([k.ring(pts)], [k.fat(cut, k.holeW(pick(k, [1.5, 1.5, 1.75, 2.25, 2.75])) / 2)]);

    return {
      outline: [shield, crackOut],
      solid: [{ d: halves, fill: true }],
    };
  },
};
