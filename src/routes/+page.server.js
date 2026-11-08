import { streakInfo } from '$lib/server/streak.js';
import { counts, trackProgress } from '$lib/server/session.js';

export function load() {
  return { streak: streakInfo(), counts: counts(), tracks: trackProgress() };
}
