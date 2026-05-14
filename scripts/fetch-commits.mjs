// Build the "commits & releases" column.
// Releases come from repos.json (latestRelease per repo) so we always have
// a full cross-org release history, not just whatever landed in the events
// stream this hour. A small number of recent commits are added from the org
// events API to show live activity.

import fs from 'node:fs/promises';
import path from 'node:path';
import { TOKEN, stableStringify, relTime } from './lib/github.mjs';
import { fetchOrgEvents, repoShortName, eventTime } from './lib/events.mjs';

const OUT = 'src/data/commits.json';
const REPOS_IN = 'src/data/repos.json';
const RELEASE_LIMIT = 5;
const COMMIT_LIMIT = 3;

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

async function main() {
  if (!TOKEN) {
    console.warn('GITHUB_TOKEN not set — leaving src/data/commits.json untouched.');
    return;
  }

  // Releases from repos.json (already fetched by fetch-repos.mjs)
  let reposRaw = [];
  try {
    reposRaw = JSON.parse(await fs.readFile(REPOS_IN, 'utf8'));
  } catch {
    console.warn(`Could not read ${REPOS_IN} — run fetch-repos.mjs first.`);
  }

  const releases = reposRaw
    .filter((r) => r.releaseUrl && r.releaseAt && !r.meta)
    .sort((a, b) => new Date(b.releaseAt) - new Date(a.releaseAt))
    .slice(0, RELEASE_LIMIT)
    .map((r) => ({
      type: 'release',
      title: `${r.name} ${r.version}`,
      repo: r.name,
      meta: r.ns,
      time: relTime(r.releaseAt),
      url: r.releaseUrl,
    }));

  // Recent commits from org events
  const events = await fetchOrgEvents();
  const commits = [];
  const seenUrls = new Set(releases.map((r) => r.url));
  for (const e of events) {
    if (commits.length >= COMMIT_LIMIT) break;
    if (e.type !== 'PushEvent') continue;
    const entry = fromPush(e);
    if (!entry || seenUrls.has(entry.url)) continue;
    seenUrls.add(entry.url);
    commits.push(entry);
  }

  // Releases first, then commits
  const out = [...releases, ...commits];

  if (out.length === 0) {
    console.warn('No commit/release entries found. Refusing to overwrite with empty list.');
    return;
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, stableStringify(out));
  console.log(`Wrote ${out.length} entries to ${OUT} (${releases.length} releases, ${commits.length} commits)`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
