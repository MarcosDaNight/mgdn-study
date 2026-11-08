import { buildSession } from '$lib/server/session.js';
import { streakInfo } from '$lib/server/streak.js';

export function load({ url }) {
  const track = url.searchParams.get('track');
  return { queue: buildSession(track || null), streak: streakInfo(), track };
}
