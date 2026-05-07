// Helpers shared by fetch-commits and fetch-discussions.
import { ORGS, restGet, relTime } from './github.mjs';

export async function fetchOrgEvents() {
  const all = [];
  for (const org of ORGS) {
    try {
      const events = await restGet(`/orgs/${org}/events?per_page=100`);
      if (events) all.push(...events);
    } catch (e) {
      console.warn(`Failed to fetch events for ${org}: ${e.message}`);
    }
  }
  return all
    .filter(e => e.actor?.login !== 'github-actions[bot]')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function repoShortName(fullName) {
  const idx = fullName.indexOf('/');
  return idx >= 0 ? fullName.slice(idx + 1) : fullName;
}

export function eventTime(iso) {
  return relTime(iso);
}
