// Browser entry: lets the site redraw icons live from Customize settings.
import { kit, svg, GRID, SIZES } from '../scripts/lib/kit.mjs';
import sectors from './concepts/sectors.mjs';
import industries from './concepts/industries.mjs';
import credit from './concepts/credit.mjs';
import economy from './concepts/economy.mjs';
import roadmap1 from './concepts/roadmap1.mjs';
import roadmap2 from './concepts/roadmap2.mjs';
import roadmap3 from './concepts/roadmap3.mjs';

const draw = Object.fromEntries([...sectors, ...industries, ...credit, ...economy, ...roadmap1, ...roadmap2, ...roadmap3].map((c) => [c.id, c.draw]));
export const has = (id) => id in draw;
export function render(id, size, style, opts) {
  const k = kit(size, style, opts);
  return svg(size, style, draw[id](k)[style], k.sw).trim();
}
export { GRID, SIZES };
