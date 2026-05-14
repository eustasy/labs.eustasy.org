// Fetch repository metadata for the eustasy + eustasy-archive orgs and
// write src/data/repos.json. Slow-changing data — refresh once a day.

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  TOKEN, ORGS, gqlQuery, daysAgo, relTimeAgo,
  classifyLang, classifyStatus, cleanDescription, stableStringify,
} from './lib/github.mjs';

const OUT = 'src/data/repos.json';

const QUERY = `
  query($org: String!) {
    organization(login: $org) {
      repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}, isFork: false, privacy: PUBLIC) {
        nodes {
          name
          description
          url
          stargazerCount
          isArchived
          pushedAt
          updatedAt
          primaryLanguage { name }
          latestRelease { tagName publishedAt url }
        }
      }
    }
  }
`;

async function fetchOrg(org) {
  try {
    const data = await gqlQuery(QUERY, { org });
    if (!data?.organization) {
      console.warn(`Org "${org}" not found — skipping.`);
      return [];
    }
    return data.organization.repositories.nodes;
  } catch (e) {
    console.warn(`Failed to fetch ${org}: ${e.message}`);
    return [];
  }
}

function shape(node, org) {
  const status = classifyStatus(node, org);
  const langs = classifyLang(node);
  const meta = status === 'meta';
  return {
    name: node.name,
    ns: org,
    desc: cleanDescription(node.description),
    url: node.url,
    stars: node.stargazerCount,
    langs,
    primaryLang: langs[0],
    status,
    updated: daysAgo(node.pushedAt),
    updatedRel: relTimeAgo(node.pushedAt),
    version: node.latestRelease?.tagName ?? null,
    releaseUrl: node.latestRelease?.url ?? null,
    releaseAt: node.latestRelease?.publishedAt ?? null,
    meta,
  };
}

async function main() {
  if (!TOKEN) {
    console.warn('GITHUB_TOKEN not set — leaving src/data/repos.json untouched.');
    return;
  }

  const all = [];
  for (const org of ORGS) {
    const nodes = await fetchOrg(org);
    for (const n of nodes) all.push(shape(n, org));
  }

  if (all.length === 0) {
    console.warn('No repos returned. Refusing to overwrite repos.json with an empty list.');
    return;
  }

  // Sort by last-pushed (most recent first), with meta repos pushed to the end
  // so the homepage's pickedFrom-this-list selection is stable.
  all.sort((a, b) => {
    if (a.meta !== b.meta) return a.meta ? 1 : -1;
    return a.updated - b.updated;
  });

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, stableStringify(all));
  console.log(`Wrote ${all.length} repos to ${OUT}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
