// Extends data/nodes/* below the top two levels from vendored open data.
// Usage: node scripts/standards.mjs <dir with node_modules/{naicsjs,nace-mcp,naics-sic-crosswalk}>
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
