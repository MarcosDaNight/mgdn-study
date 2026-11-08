import { buildSession } from '$lib/server/session.js';
import { streakInfo } from '$lib/server/streak.js';

export function load({ url }) {
  const p = url.searchParams;
  const queue = buildSession({ track: p.get('track'), unit: p.get('unit'), more: p.get('more') === '1' });
  return { queue, streak: streakInfo(), scope: { track: p.get('track'), unit: p.get('unit') } };
}
