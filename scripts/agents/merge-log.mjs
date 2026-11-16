// During a rebase conflict on an agents ledger (log.json, spend.json): keep every entry from both sides, oldest first.
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const unmerged = execSync('git diff --name-only --diff-filter=U', { encoding: 'utf8' }).split('\n').filter(Boolean);
const ledgers = unmerged.filter((f) => /^data\/agents\/(log|spend)\.json$/.test(f));
if (!ledgers.length || ledgers.length !== unmerged.length) process.exit(1); // some other file conflicts: do not guess
const get = (stage, f) => { try { return JSON.parse(execSync(`git show :${stage}:${f}`, { encoding: 'utf8' })); } catch { return []; } };
for (const f of ledgers) {
  const seen = new Set(), all = [];
  for (const e of [...get(2, f), ...get(3, f)]) { const k = JSON.stringify(e); if (!seen.has(k)) { seen.add(k); all.push(e); } }
  all.sort((a, b) => String(a.at || a.date || '').localeCompare(String(b.at || b.date || '')));
  writeFileSync(f, JSON.stringify(all, null, 1) + '\n');
}
