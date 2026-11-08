import { q } from './db.js';

export const GOALS = [5, 10, 20, 30]; // revisões por dia que mantêm o streak
export const NEW_LIMITS = [4, 8, 12, 16]; // itens novos por dia

const get = (key, fallback) => q('SELECT value FROM setting WHERE key = ?').get(key)?.value ?? fallback;
const set = (key, value) =>
  q('INSERT INTO setting(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(
    key,
    String(value)
  );

export const dailyGoal = () => Number(get('daily_goal', 10));
export const newPerDay = () => Number(get('new_per_day', 8));

export function saveSettings({ goal, newPerDay: n }) {
  if (GOALS.includes(goal)) set('daily_goal', goal);
  if (NEW_LIMITS.includes(n)) set('new_per_day', n);
}
