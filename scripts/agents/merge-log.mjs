// During a rebase conflict on data/agents/log.json: keep every entry from both sides, oldest first.
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const get = (stage) => { try { return JSON.parse(execSync(`git show :${stage}:data/agents/log.json`, { encoding: 'utf8' })); } catch { return []; } };
const seen = new Set(), all = [];
for (const e of [...get(2), ...get(3)]) { const k = JSON.stringify(e); if (!seen.has(k)) { seen.add(k); all.push(e); } }
all.sort((a, b) => String(a.at || a.date || '').localeCompare(String(b.at || b.date || '')));
writeFileSync('data/agents/log.json', JSON.stringify(all, null, 1) + '\n');
