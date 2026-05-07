// Build the "commits & releases" column: fold PushEvent and ReleaseEvent
// from /orgs/*/events into a 5-item feed.

import fs from 'node:fs/promises';
import path from 'node:path';
import { TOKEN, stableStringify } from './lib/github.mjs';
import { fetchOrgEvents, repoShortName, eventTime } from './lib/events.mjs';

const OUT = 'src/data/commits.json';
const LIMIT = 5;

function fromPush(e) {
  const commits = e.payload?.commits;
  if (!commits?.length) return null;
  const last = commits[commits.length - 1];
  const branch = (e.payload.ref || '').replace('refs/heads/', '') || 'main';
  return {
    type: 'commit',
    title: (last.message || '').split('\n')[0].trim().slice(0, 120) || 'commit',
    repo: repoShortName(e.repo.name),
    meta: branch,
    time: eventTime(e.created_at),
    url: `https://github.com/${e.repo.name}/commit/${last.sha}`,
  };
}

function fromRelease(e) {
  if (e.payload?.action !== 'published') return null;
  const rel = e.payload.release;
  if (!rel) return null;
  const repo = repoShortName(e.repo.name);
  const titleParts = [`${repo} ${rel.tag_name}`];
  if (rel.name && rel.name !== rel.tag_name) titleParts.push(rel.name);
  return {
    type: 'release',
    title: titleParts.join(' — '),
    repo,
    meta: e.actor.display_login || e.actor.login,
    time: eventTime(e.created_at),
    url: rel.html_url,
  };
}

async function main() {
  if (!TOKEN) {
    console.warn('GITHUB_TOKEN not set — leaving src/data/commits.json untouched.');
    return;
  }

  const events = await fetchOrgEvents();
  const out = [];
  const seen = new Set();
  for (const e of events) {
    if (out.length >= LIMIT) break;
    let entry = null;
    if (e.type === 'PushEvent') entry = fromPush(e);
    else if (e.type === 'ReleaseEvent') entry = fromRelease(e);
    if (!entry) continue;
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    out.push(entry);
  }

  if (out.length === 0) {
    console.warn('No commit/release events found. Refusing to overwrite with empty list.');
    return;
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, stableStringify(out));
  console.log(`Wrote ${out.length} commit/release entries to ${OUT}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
