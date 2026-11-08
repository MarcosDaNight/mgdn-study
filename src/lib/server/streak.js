import { db, getSetting } from './db.js';
import { addDays, dayOf } from './time.js';

export const FREEZE_EVERY = 7; // 1 "congelar" a cada 7 dias seguidos de streak
export const MAX_FREEZES = 2;

export const dailyGoal = () => Number(getSetting('daily_goal', '10'));

function activeDays(goal) {
  return new Set(
    db.prepare('SELECT day FROM day_stat WHERE reviews >= ?').all(goal).map((r) => r.day)
  );
}

/**
 * Streak = dias seguidos com a meta batida. Um dia perdido gasta um "congelar" (se houver);
 * sem congelar, o streak zera. Chamado a cada carregamento: fecha as lacunas até ontem.
 */
export function settleFreezes(today = dayOf()) {
  const goal = dailyGoal();
  const active = activeDays(goal);
  const frozen = new Set(db.prepare('SELECT day FROM freeze').all().map((r) => r.day));
  const yesterday = addDays(today, -1);
  // Só interessa se o streak estava vivo antes de ontem.
  const alive = (d) => active.has(d) || frozen.has(d);
  if (alive(yesterday) || !alive(addDays(yesterday, -1))) return;
  if (freezesAvailable(today) > 0) {
    db.prepare('INSERT OR IGNORE INTO freeze(day) VALUES (?)').run(yesterday);
  }
}

function longestRun(active) {
  const days = [...active].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function freezesAvailable() {
  const active = activeDays(dailyGoal());
  const earned = Math.floor(longestRun(active) / FREEZE_EVERY);
  const used = db.prepare('SELECT COUNT(*) AS n FROM freeze').get().n;
  return Math.max(0, Math.min(MAX_FREEZES, earned - used));
}

export function streakInfo(today = dayOf()) {
  settleFreezes(today);
  const goal = dailyGoal();
  const active = activeDays(goal);
  const frozen = new Set(db.prepare('SELECT day FROM freeze').all().map((r) => r.day));
  const alive = (d) => active.has(d) || frozen.has(d);

  const doneToday = active.has(today);
  let cursor = doneToday ? today : addDays(today, -1);
  let streak = 0;
  while (alive(cursor)) {
    if (active.has(cursor)) streak++;
    cursor = addDays(cursor, -1);
  }
  const stat = db.prepare('SELECT reviews, xp FROM day_stat WHERE day = ?').get(today);
  return {
    streak,
    doneToday,
    goal,
    todayReviews: stat?.reviews ?? 0,
    todayXp: stat?.xp ?? 0,
    freezes: freezesAvailable(),
    // Últimos 7 dias, para o mini calendário.
    week: Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      return { day: d, state: active.has(d) ? 'done' : frozen.has(d) ? 'frozen' : 'none' };
    })
  };
}
