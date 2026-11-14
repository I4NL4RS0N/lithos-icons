// Lithos Icons MCP server (Streamable HTTP, stateless JSON). Endpoint: /mcp
// Reads the published site itself (index.json, std/<id>.json, icons/…svg), so it needs no bundled data
// and is always in step with the latest deploy.

const SIZES = [16, 20, 24, 32, 48];
const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, mcp-protocol-version, mcp-session-id',
};

const TOOLS = [
  {
    name: 'search_icons',
    description: 'Find Lithos finance icons by name or keyword (for example "bank", "oil", "germany", "credit card"). Returns ids to pass to get_icon. Covers sectors, industries, credit asset classes, topics, countries and regions.',
    inputSchema: { type: 'object', properties: {
      query: { type: 'string', description: 'Word or phrase to look for.' },
      kind: { type: 'string', enum: ['sector', 'industry', 'asset-class', 'theme', 'country', 'region'], description: 'Only this kind of icon.' },
      limit: { type: 'integer', minimum: 1, maximum: 50, description: 'Most results to return (default 10).' } }, required: ['query'] },
  },
  {
    name: 'get_icon',
    description: 'Get an icon as SVG, ready to paste into code. Outline icons use currentColor and a live stroke, so stroke_width can be changed. Each size (16, 20, 24, 32, 48) is drawn separately, so pick the size you will actually show.',
    inputSchema: { type: 'object', properties: {
      id: { type: 'string', description: 'Icon id from search_icons, for example "banks" or "country-de".' },
      style: { type: 'string', enum: ['outline', 'solid'], description: 'Default outline.' },
      size: { type: 'integer', enum: SIZES, description: 'Pixel size, default 24.' },
      stroke_width: { type: 'number', minimum: 0.5, maximum: 4, description: 'Outline only. Overrides the default stroke width for this size.' },
      color: { type: 'string', description: 'Optional CSS colour. Leave out to inherit the text colour (currentColor).' } }, required: ['id'] },
  },
  {
    name: 'lookup_code',
    description: 'Find the icon for a classification code or title. Standards: gics-2025, fitch-2020, naics-2022, nace-2.1, isic-4, sic-1987 (call list_collections for the exact ids). Give a code ("5221") or part of a title ("commercial banking"). Says whether the code has its own icon or borrows its parent’s.',
    inputSchema: { type: 'object', properties: {
      standard: { type: 'string', description: 'Standard id, for example "naics-2022".' },
      code: { type: 'string', description: 'Exact code, for example "4010".' },
      query: { type: 'string', description: 'Part of a title, when you do not know the code.' },
      limit: { type: 'integer', minimum: 1, maximum: 25, description: 'Most results for a title search (default 10).' } }, required: ['standard'] },
  },
  {
    name: 'list_collections',
    description: 'List what is available: icon kinds with counts, the standards that can be looked up, and the sizes and styles.',
    inputSchema: { type: 'object', properties: {} },
  },
];

const cache = new Map(); // module-level; lasts as long as the function instance stays warm
async function getJson(origin, path) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit.v;
  const res = await fetch(origin + path);
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  const v = await res.json();
  cache.set(path, { v, at: Date.now() });
  return v;
}
const norm = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9. ]+/g, ' ').replace(/\s+/g, ' ').trim();
const text = (t, extra) => ({ content: [{ type: 'text', text: t }], ...extra });
const fail = (t) => ({ content: [{ type: 'text', text: t }], isError: true });

function score(c, terms) {
  const name = norm(c.name), id = norm(c.id), kws = (c.keywords || []).map(norm);
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (name === t || id === t) s = 100;
    else if (name.startsWith(t) || id.startsWith(t)) s = 60;
    else if (name.split(' ').includes(t)) s = 50;
    else if (kws.includes(t)) s = 40;
    else if (name.includes(t) || kws.some((k) => k.includes(t))) s = 20;
    else if (norm(c.metaphor).includes(t) || norm(c.iso3).toLowerCase() === t || norm(c.iso2) === t) s = 15;
    if (!s) return 0;
    total += s;
  }
  return total;
}

async function searchIcons(origin, { query, kind, limit = 10 }) {
  const terms = norm(query).split(' ').filter(Boolean);
  if (!terms.length) return fail('Give a word to search for.');
  const index = await getJson(origin, '/index.json');
  const hits = index.filter((c) => (!kind || c.kind === kind) && c.status !== 'deprecated').map((c) => [score(c, terms), c]).filter(([s]) => s)
    .sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name)).slice(0, Math.min(50, limit));
  if (!hits.length) return text(`No icons match “${query}”. Try a broader word, or list_collections to see what exists.`);
  const rows = hits.map(([, c]) => ({ id: c.id, name: c.name, kind: c.kind, parent: c.parent || undefined, iso2: c.iso2 || undefined }));
  return text(rows.map((r) => `${r.id} — ${r.name} (${r.kind}${r.parent ? ', under ' + r.parent : ''})`).join('\n'), { structuredContent: { results: rows } });
}

async function getIcon(origin, { id, style = 'outline', size = 24, stroke_width, color }) {
  if (!SIZES.includes(size)) return fail(`size must be one of ${SIZES.join(', ')}.`);
  if (!['outline', 'solid'].includes(style)) return fail('style must be "outline" or "solid".');
  const index = await getJson(origin, '/index.json');
  const c = index.find((x) => x.id === id);
  if (!c) return fail(`No icon with id “${id}”. Use search_icons to find the id.`);
  const res = await fetch(`${origin}/icons/${c.id}/${style}-${size}.svg`);
  if (!res.ok) return fail(`Could not load ${c.id} ${style} ${size}px (${res.status}).`);
  let svg = (await res.text()).trim();
  if (stroke_width != null && style === 'outline') svg = svg.replace(/stroke-width="[^"]*"/, `stroke-width="${+stroke_width}"`);
  if (color) { const safe = String(color).replace(/[^#a-zA-Z0-9(),.%\s-]/g, ''); svg = svg.replace(/currentColor/g, safe); }
  const url = `${origin}/icons/${c.id}/${style}-${size}.svg`;
  const flag = c.kind === 'country' && c.iso2 ? `${origin}/flags/${c.iso2.toLowerCase()}/4x3-${size}.svg` : undefined;
  const notes = [`${c.name} · ${style} · ${size}px`, `File: ${url}`, flag ? `Flag: ${flag}` : null, c.reduction ? `At small sizes: ${c.reduction}` : null].filter(Boolean).join('\n');
  return { content: [{ type: 'text', text: svg }, { type: 'text', text: notes }], structuredContent: { id: c.id, name: c.name, style, size, svg, url, flag } };
}

async function lookupCode(origin, { standard, code, query, limit = 10 }) {
  const index = await getJson(origin, '/index.json');
  let tree;
  try { tree = await getJson(origin, `/std/${encodeURIComponent(standard)}.json`); } catch { return fail(`Unknown standard “${standard}”. Call list_collections for the ids.`); }
  const byId = Object.fromEntries(index.map((c) => [c.id, c]));
  const nodes = tree.nodes.map(([c, name, parent, ci, direct]) => ({ code: c, name, parent, icon: ci >= 0 ? tree.ids[ci] : null, direct: !!direct }));
  const row = (n) => ({ code: n.code, title: n.name, icon: n.icon, icon_name: n.icon ? byId[n.icon]?.name : undefined, own_icon: n.direct });
  const line = (r) => `${r.code} — ${r.title} → ${r.icon ? `${r.icon} (${r.icon_name})${r.own_icon ? '' : ', borrowed from a parent'}` : 'no icon yet'}`;
  if (code) {
    const n = nodes.find((x) => x.code === String(code).trim());
    if (!n) return text(`Code “${code}” is not in ${standard}. Try query with part of its title.`);
    const chain = []; for (let p = nodes.find((x) => x.code === n.parent); p; p = nodes.find((x) => x.code === p.parent)) chain.unshift(`${p.code} ${p.name}`);
    return text(`${line(row(n))}${chain.length ? `\nWithin: ${chain.join(' › ')}` : ''}`, { structuredContent: { ...row(n), within: chain } });
  }
  const terms = norm(query).split(' ').filter(Boolean);
  if (!terms.length) return fail('Give a code or part of a title.');
  const hits = nodes.filter((n) => terms.every((t) => norm(n.name).includes(t) || norm(n.code).startsWith(t))).slice(0, Math.min(25, limit));
  if (!hits.length) return text(`Nothing in ${standard} matches “${query}”.`);
  return text(hits.map((n) => line(row(n))).join('\n'), { structuredContent: { results: hits.map(row) } });
}

async function listCollections(origin) {
  const [index, stds] = await Promise.all([getJson(origin, '/index.json'), getJson(origin, '/standards.json')]);
  const kinds = {}; for (const c of index) kinds[c.kind] = (kinds[c.kind] || 0) + 1;
  const out = { icons: kinds, standards: stds, sizes: SIZES, styles: ['outline', 'solid'] };
  return text(`Icons: ${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(', ')}\nStandards: ${stds.map((s) => `${s.id} (${s.name} ${s.version})`).join(', ')}\nSizes: ${SIZES.join(', ')} px, each drawn separately. Styles: outline, solid.`, { structuredContent: out });
}

const HANDLERS = { search_icons: searchIcons, get_icon: getIcon, lookup_code: lookupCode, list_collections: listCollections };

async function handle(msg, origin) {
  const { id, method, params } = msg;
  const ok = (result) => ({ jsonrpc: '2.0', id, result });
  const err = (code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
  if (id === undefined) return null; // notification
  switch (method) {
    case 'initialize': {
      const want = params?.protocolVersion;
      return ok({ protocolVersion: PROTOCOLS.includes(want) ? want : PROTOCOLS[0], capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'lithos-icons', title: 'Lithos Icons', version: '0.1.0' },
        instructions: 'Finance icons (sectors, industries, credit, topics, countries, regions) mapped to GICS, NAICS, NACE, ISIC, SIC and Fitch codes. Use search_icons or lookup_code to find an id, then get_icon for the SVG.' });
    }
    case 'ping': return ok({});
    case 'tools/list': return ok({ tools: TOOLS });
    case 'tools/call': {
      const fn = HANDLERS[params?.name];
      if (!fn) return err(-32602, `Unknown tool: ${params?.name}`);
      try { return ok(await fn(origin, params.arguments || {})); } catch (e) { return ok(fail(`Something went wrong: ${e.message}`)); }
    }
    default: return err(-32601, `Method not found: ${method}`);
  }
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return new Response('Lithos Icons MCP server. Send JSON-RPC with POST. Docs: ' + new URL(req.url).origin + '/#agents', { status: 405, headers: { ...CORS, allow: 'POST, OPTIONS', 'content-type': 'text/plain' } });
  let body; try { body = await req.json(); } catch { return Response.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400, headers: CORS }); }
  const origin = new URL(req.url).origin;
  const batch = Array.isArray(body);
  const replies = (await Promise.all((batch ? body : [body]).map((m) => handle(m, origin)))).filter(Boolean);
  if (!replies.length) return new Response(null, { status: 202, headers: CORS });
  return Response.json(batch ? replies : replies[0], { headers: CORS });
};

export const config = { path: '/mcp' };
