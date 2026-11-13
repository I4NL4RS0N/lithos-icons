// Metaphor research: what images do other libraries use for a concept?
// Usage: node scripts/research.mjs <concept-id> [query]
// Needs NOUN_PROJECT_KEY + NOUN_PROJECT_SECRET (OAuth 1.0a) and/or ICONFINDER_KEY.
// Stores only titles, tags, counts and thumbnail URLs for review. Never stores
// or copies third-party SVGs — we draw our own (SPEC §9, research rules).
import { createHmac, randomBytes } from 'node:crypto';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';

const [id, ...q] = process.argv.slice(2);
if (!id) { console.error('usage: research.mjs <concept-id> [query]'); process.exit(1); }
const conceptFile = `data/concepts/${id}.json`;
const concept = existsSync(conceptFile) ? JSON.parse(readFileSync(conceptFile, 'utf8')) : { id, name: id };
const query = q.join(' ') || concept.name;

const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
function oauthHeader(method, url, params, key, secret) {
  const o = { oauth_consumer_key: key, oauth_nonce: randomBytes(16).toString('hex'), oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(), oauth_version: '1.0' };
  const all = { ...params, ...o };
  const base = [method, enc(url), enc(Object.keys(all).sort().map((k) => `${enc(k)}=${enc(all[k])}`).join('&'))].join('&');
  o.oauth_signature = createHmac('sha1', `${enc(secret)}&`).update(base).digest('base64');
  return 'OAuth ' + Object.entries(o).map(([k, v]) => `${k}="${enc(v)}"`).join(', ');
}

async function nounProject() {
  const key = process.env.NOUN_PROJECT_KEY, secret = process.env.NOUN_PROJECT_SECRET;
  if (!key || !secret) return { skipped: 'NOUN_PROJECT_KEY/SECRET not set' };
  const url = 'https://api.thenounproject.com/v2/icon';
  const params = { query, limit: '50', thumbnail_size: '84' };
  const res = await fetch(`${url}?${new URLSearchParams(params)}`, { headers: { Authorization: oauthHeader('GET', url, params, key, secret) } });
  if (!res.ok) return { error: `${res.status} ${await res.text()}` };
  const j = await res.json();
  return { results: (j.icons || []).map((i) => ({ title: i.term, tags: (i.tags || []).map((t) => t.slug || t), thumb: i.thumbnail_url, licence: i.license_description })) };
}

async function iconfinder() {
  const key = process.env.ICONFINDER_KEY;
  if (!key) return { skipped: 'ICONFINDER_KEY not set' };
  const res = await fetch(`https://api.iconfinder.com/v4/icons/search?${new URLSearchParams({ query, count: '50', premium: '0' })}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) return { error: `${res.status} ${await res.text()}` };
  const j = await res.json();
  return { results: (j.icons || []).map((i) => ({ tags: i.tags || [], thumb: i.raster_sizes?.find((r) => r.size >= 64)?.formats?.[0]?.preview_url })) };
}

const sources = { nounProject: await nounProject(), iconfinder: await iconfinder() };
const tally = {};
for (const s of Object.values(sources)) for (const r of s.results || []) for (const t of new Set([r.title, ...(r.tags || [])].filter(Boolean).map((x) => String(x).toLowerCase())))
  tally[t] = (tally[t] || 0) + 1;
const topTerms = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 40);
const out = { concept: id, query, fetched: new Date().toISOString(), topTerms, sources,
  decision: { metaphor: concept.metaphor || null, rationale: null } };
mkdirSync('data/research', { recursive: true });
writeFileSync(`data/research/${id}.json`, JSON.stringify(out, null, 2) + '\n');
console.log(`data/research/${id}.json`, Object.fromEntries(Object.entries(sources).map(([k, v]) => [k, v.results ? v.results.length : v.skipped || v.error])));
