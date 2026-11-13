// Builds data/{schemes,nodes,mappings} for standards published by permission (GICS, Fitch) from the
// owner-supplied lists in standards-private/ (git-ignored). Run locally: node scripts/standards-licensed.mjs
// These schemes are NOT covered by the MIT licence — see THIRD-PARTY.md and SPEC.md §3.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const concepts = new Set(JSON.parse(readFileSync('data/index.json', 'utf8')).map((c) => c.id));
const slug = (s) => s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const PERMISSION = 'Published with permission for non-commercial use (confirmed by the project owner, 2026-11-13). Not covered by the MIT licence; do not reuse commercially.';
// Name → concept, beyond exact name matches. Only where the picture clearly fits.
const ALIAS = {
  'oil-gas-consumable-fuels': 'oil-gas', 'containers-packaging': 'packaging', 'semiconductors-semiconductor-equipment': 'semiconductors',
  'independent-power-and-renewable-electricity-producers': 'renewable-energy', 'renewable-electricity': 'renewable-energy', 'marine-transportation': 'marine-shipping',
  'rail-transportation': 'rail', 'asset-management-custody-banks': 'asset-management', 'health-care-facilities': 'hospitals', 'construction-engineering': 'construction',
  'hotels-restaurants-leisure': 'accommodation-food', 'education-services': 'education', 'health-care-equipment-services': 'health-care',
  'pharmaceuticals-biotechnology-life-sciences': 'pharmaceuticals', 'software-services': 'software', 'automobiles-components': 'automobiles', 'capital-goods': 'industrials',
  'media-entertainment': 'media', 'financial-services': 'financials', 'commercial-professional-services': 'professional-services', 'equity-real-estate-investment-trusts-reits': 'real-estate',
  'real-estate-management-development': 'real-estate', 'telecommunication-services': 'telecom', 'diversified-telecommunication-services': 'telecom', 'wireless-telecommunication-services': 'telecom', 'telecommunications': 'telecom',
  'passenger-airlines': 'airlines', 'consumer-discretionary-distribution-retail': 'retail', 'specialty-retail': 'retail', 'broadline-retail': 'retail', 'consumer-staples-distribution-retail': 'retail', 'retailing': 'retail',
  'food-beverage-tobacco': 'food-beverage', 'food-products': 'food-beverage', 'beverages': 'food-beverage', 'food-beverage-tobacco-': 'food-beverage', 'building-products': 'construction-materials', 'building-materials-construction': 'construction-materials',
  'oil-gas-storage-transportation': 'pipelines', 'closed-end-funds': 'funds', 'technology-hardware-equipment': 'information-technology',
  'textiles-apparel-luxury-goods': 'apparel', 'apparel-accessories-luxury-goods': 'apparel', 'apparel-retail': 'apparel', 'home-furnishings': 'furniture', 'air-freight-logistics': 'postal-courier',
  'hotels-resorts-cruise-lines': 'lodging', 'environmental-facilities-services': 'waste-management', 'forest-products': 'forestry', 'agricultural-products-services': 'crops',
  'electrical-components-equipment': 'electrical-equipment', 'heavy-electrical-equipment': 'electrical-equipment',
  // Fitch
  'financial-institutions': 'financials', 'global-power': 'electric-utilities', 'corporates': 'industrials', 'asset-backed-securities': 'abs', 'commercial-mortgage': 'cmbs',
  'residential-mortgage': 'rmbs', 'structured-credit': 'clo', 'cdos-clos': 'clo', 'structured-finance': 'abs', 'u-s-public-finance': 'municipal-bonds', 'healthcare': 'health-care',
  'international-public-finance': 'government', 'local-and-regional-governments': 'government', 'global-infrastructure-and-project-finance': 'construction',
  'fund-and-asset-manager-ratings': 'asset-management', 'asset-managers': 'asset-management', 'investment-managers': 'asset-management', 'consumer-finance-companies': 'consumer-finance',
};
const conceptFor = (name) => { const s = slug(name); return concepts.has(s) ? s : ALIAS[s] && concepts.has(ALIAS[s]) ? ALIAS[s] : null; };
const write = (id, scheme, nodes) => {
  const map = {}; for (const n of nodes) { const c = conceptFor(n.name); if (c) map[n.code] = c; }
  writeFileSync(`data/schemes/${id}.json`, JSON.stringify({ id, ...scheme, licence: 'permission-noncommercial', publish: true, credit: PERMISSION }, null, 1) + '\n');
  writeFileSync(`data/nodes/${id}.json`, JSON.stringify(nodes, null, 1) + '\n');
  writeFileSync(`data/mappings/${id}.json`, JSON.stringify(map, null, 1) + '\n');
  console.log(id, nodes.length, 'nodes,', Object.keys(map).length, 'with their own icon');
};
// Indented outline → rows of { depth, text }.
const outline = (file, skip) => readFileSync(file, 'utf8').split('\n').slice(skip).filter((l) => l.trim()).map((l) => ({ depth: l.match(/^ */)[0].length / 2, text: l.trim() }));

if (existsSync('standards-private/gics-2025.txt')) {
  const LV = ['sector', 'industry group', 'industry', 'sub-industry'];
  const nodes = outline('standards-private/gics-2025.txt', 4).map(({ text }) => { const [, code, name] = text.match(/^(\d{2,8})\s+(.*)$/); return { code, name, level: LV[code.length / 2 - 1], parent: code.length > 2 ? code.slice(0, -2) : null }; });
  write('gics-2025', { name: 'GICS', fullName: 'Global Industry Classification Standard', version: '2025', levels: LV, source: 'GICS is a standard of MSCI Inc. and S&P Dow Jones Indices. Structure effective per the February 2025 methodology.' }, nodes);
}
if (existsSync('standards-private/fitch-market-sectors-2020.txt')) {
  // The taxonomy has no public codes, so nodes get internal position ids (never shown; `codes: false`).
  const stack = [], count = {}, nodes = [];
  for (const { depth, text } of outline('standards-private/fitch-market-sectors-2020.txt', 4)) {
    const parent = depth ? stack[depth - 1] : null, i = (count[parent || ''] = (count[parent || ''] || 0) + 1), code = (parent ? parent + '.' : '') + i;
    stack[depth] = code; stack.length = depth + 1;
    nodes.push({ code, name: text, level: ['group', 'sector', 'sub-sector', 'segment', 'sub-segment'][depth] || 'item', parent });
  }
  const depth = Math.max(...nodes.map((n) => n.code.split('.').length));
  write('fitch-2020', { name: 'Fitch Ratings', fullName: 'Fitch Ratings market sectors', version: '2020', codes: false, levels: ['group', 'sector', 'sub-sector', 'segment', 'sub-segment'].slice(0, depth),
    source: 'Fitch Ratings market sector taxonomy (2020). Historical and partially reconstructed; not verified as complete or current.' }, nodes);
}
