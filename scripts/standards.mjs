// Extends data/nodes/* below the top two levels from vendored open data.
// Usage: node scripts/standards.mjs <dir with node_modules/{naicsjs,nace-mcp,naics-sic-crosswalk}> [isic_rev4.csv]
// Sources are read as text/JSON only (never executed). See THIRD-PARTY.md.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const V = join(process.argv[2] || '../vendor-std', 'node_modules');
const load = (id) => JSON.parse(readFileSync(`data/nodes/${id}.json`, 'utf8'));
const save = (id, nodes, levels) => {
  writeFileSync(`data/nodes/${id}.json`, JSON.stringify(nodes, null, 1) + '\n');
  const p = `data/schemes/${id}.json`, s = JSON.parse(readFileSync(p, 'utf8'));
  s.levels = levels; writeFileSync(p, JSON.stringify(s, null, 1) + '\n');
  console.log(id, nodes.length, 'nodes');
};

{ // NAICS 2022: 4-, 5- and 6-digit codes; parent = code minus its last digit.
  const LV = { 4: 'industry group', 5: 'NAICS industry', 6: 'national industry' };
  const top = load('naics-2022').filter((n) => n.code.length <= 3 || n.code.includes('-')), have = new Set(top.map((n) => n.code));
  const text = readFileSync(join(V, 'naicsjs/NAICS_CODES.js'), 'utf8');
  const deep = [...text.matchAll(/^\s*"(\d{4,6})":\s*"(.*)",?\s*$/gm)].map(([, code, name]) => ({ code, name: name.trim(), level: LV[code.length], parent: code.slice(0, -1) }));
  deep.forEach((n) => have.add(n.code));
  save('naics-2022', [...top, ...deep.filter((n) => have.has(n.parent))], ['sector', 'subsector', 'industry group', 'NAICS industry', 'national industry']);
}
{ // NACE Rev. 2.1: groups and classes.
  const top = load('nace-2.1').filter((n) => !n.code.includes('.'));
  const rows = JSON.parse(readFileSync(join(V, 'nace-mcp/data/codes-2.1.json'), 'utf8'));
  const deep = rows.filter((r) => r.Group).map((r) => (r.Class ? { code: r.Class, name: r.Activity, level: 'class', parent: r.Group } : { code: r.Group, name: r.Activity, level: 'group', parent: r.Division }));
  save('nace-2.1', [...top, ...deep], ['section', 'division', 'group', 'class']);
}
{ // SIC 1987: 4-digit industries (titles from the Census NAICS–SIC concordance), under their major group.
  const top = load('sic-1987').filter((n) => n.code.length <= 2), groups = new Set(top.map((n) => n.code));
  const rows = JSON.parse(readFileSync(join(V, 'naics-sic-crosswalk/naics-sic-crosswalk.json'), 'utf8'));
  const seen = new Map();
  for (const r of rows) if (/^\d{4}$/.test(r.sic || '') && r.sicDescription && groups.has(r.sic.slice(0, 2)) && !seen.has(r.sic)) seen.set(r.sic, r.sicDescription.trim().replace(/\bNec\b/g, 'NEC').replace(/^./, (c) => c.toUpperCase()));
  const deep = [...seen].sort().map(([code, name]) => ({ code, name, level: 'industry', parent: code.slice(0, 2) }));
  save('sic-1987', [...top, ...deep], ['division', 'major group', 'industry']);
}

if (process.argv[3]) { // ISIC Rev.4: divisions, groups, classes from a Code,Description CSV; sections are the standard's 21 letters.
  const SECTIONS = [['A', 'Agriculture, forestry and fishing', 1, 3], ['B', 'Mining and quarrying', 5, 9], ['C', 'Manufacturing', 10, 33], ['D', 'Electricity, gas, steam and air conditioning supply', 35, 35],
    ['E', 'Water supply; sewerage, waste management and remediation activities', 36, 39], ['F', 'Construction', 41, 43], ['G', 'Wholesale and retail trade; repair of motor vehicles and motorcycles', 45, 47],
    ['H', 'Transportation and storage', 49, 53], ['I', 'Accommodation and food service activities', 55, 56], ['J', 'Information and communication', 58, 63], ['K', 'Financial and insurance activities', 64, 66],
    ['L', 'Real estate activities', 68, 68], ['M', 'Professional, scientific and technical activities', 69, 75], ['N', 'Administrative and support service activities', 77, 82],
    ['O', 'Public administration and defence; compulsory social security', 84, 84], ['P', 'Education', 85, 85], ['Q', 'Human health and social work activities', 86, 88], ['R', 'Arts, entertainment and recreation', 90, 93],
    ['S', 'Other service activities', 94, 96], ['T', 'Activities of households as employers; undifferentiated goods- and services-producing activities of households for own use', 97, 98], ['U', 'Activities of extraterritorial organizations and bodies', 99, 99]];
  const LV = { 2: 'division', 3: 'group', 4: 'class' };
  const rows = readFileSync(process.argv[3], 'utf8').split(/\r?\n/).slice(1).map((l) => l.match(/^(\d{2,4}),"?(.*?)"?$/)).filter(Boolean)
    .map(([, code, name]) => ({ code, name: name.replace(/""/g, '"'), level: LV[code.length], parent: code.length > 2 ? code.slice(0, -1) : SECTIONS.find(([, , a, b]) => +code >= a && +code <= b)[0] }));
  const nodes = [...SECTIONS.map(([code, name]) => ({ code, name, level: 'section', parent: null })), ...rows];
  writeFileSync('data/nodes/isic-4.json', JSON.stringify(nodes, null, 1) + '\n');
  writeFileSync('data/schemes/isic-4.json', JSON.stringify({ id: 'isic-4', name: 'ISIC', fullName: 'International Standard Industrial Classification of All Economic Activities', version: 'Rev. 4',
    levels: ['section', 'division', 'group', 'class'], licence: 'public', publish: true, source: 'United Nations Statistics Division (https://unstats.un.org/unsd/classifications/Econ/isic). Structure via the polca/premise repository (BSD-3-Clause).' }, null, 1) + '\n');
  console.log('isic-4', nodes.length, 'nodes');
}
