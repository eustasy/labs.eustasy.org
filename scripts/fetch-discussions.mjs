// Build the "discussions & issues" column: fold IssuesEvent,
// PullRequestEvent, and IssueCommentEvent into a 5-item feed.
//
// GitHub Discussions (the actual feature) requires per-repo GraphQL.
// We approximate by treating issues with active commenting as
// "discussions" and freshly-opened issues/PRs as "issues".

import fs from 'node:fs/promises';
import path from 'node:path';
import { TOKEN, stableStringify } from './lib/github.mjs';
import { fetchOrgEvents, repoShortName, eventTime } from './lib/events.mjs';

const OUT = 'src/data/discussions.json';
const LIMIT = 5;

function fromIssue(e) {
  if (e.payload?.action !== 'opened') return null;
  const issue = e.payload.issue;
  if (!issue || issue.pull_request) return null; // PRs handled separately
  return {
    type: 'issue',
    title: issue.title,
    repo: repoShortName(e.repo.name),
    meta: `#${issue.number}`,
    time: eventTime(e.created_at),
    url: issue.html_url,
  };
}

function fromPR(e) {
  if (e.payload?.action !== 'opened') return null;
  const pr = e.payload.pull_request;
  if (!pr) return null;
  return {
    type: 'issue',
    title: pr.title,
    repo: repoShortName(e.repo.name),
    meta: `#${pr.number}`,
    time: eventTime(e.created_at),
    url: pr.html_url,
  };
}

function fromComment(e) {
  if (e.payload?.action !== 'created') return null;
  const issue = e.payload.issue;
  if (!issue) return null;
  return {
    type: 'discussion',
    title: issue.title,
    repo: repoShortName(e.repo.name),
    meta: `${issue.comments} ${issue.comments === 1 ? 'reply' : 'replies'}`,
    time: eventTime(e.created_at),
    url: issue.html_url,
  };
}

async function main() {
  if (!TOKEN) {
    console.warn('GITHUB_TOKEN not set — leaving src/data/discussions.json untouched.');
    return;
  }

  const events = await fetchOrgEvents();
  const out = [];
  const seen = new Set();
  for (const e of events) {
    if (out.length >= LIMIT) break;
    let entry = null;
    if (e.type === 'IssuesEvent') entry = fromIssue(e);
    else if (e.type === 'PullRequestEvent') entry = fromPR(e);
    else if (e.type === 'IssueCommentEvent') entry = fromComment(e);
    if (!entry) continue;
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    out.push(entry);
  }

  if (out.length === 0) {
    console.warn('No issue/PR/comment events found. Refusing to overwrite with empty list.');
    return;
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, stableStringify(out));
  console.log(`Wrote ${out.length} discussion/issue entries to ${OUT}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
