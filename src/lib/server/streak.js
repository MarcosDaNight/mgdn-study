import { q } from './db.js';
import { addDays, dayOf } from './time.js';
import { dailyGoal } from './settings.js';

export const FREEZE_EVERY = 7; // 1 "congelar" a cada 7 dias seguidos de meta batida
export const MAX_FREEZES = 2;

/**
 * Streak como simulação pura sobre o histórico: nada é gravado ao ler.
 * - dia com meta batida: streak +1 (a cada 7, ganha um congelar, até MAX_FREEZES);
 * - dia perdido: gasta um congelar, se houver (o streak segue); sem congelar, zera;
 * - hoje ainda aberto não conta como perdido.
 * @param {Set<string>} active dias com a meta batida
 */
export function simulate(active, today) {
  const frozen = new Set();
  let streak = 0;
  let freezes = 0;
  const earn = () => {
    streak++;
    if (streak % FREEZE_EVERY === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);
  };
  if (active.size) {
    const first = [...active].sort()[0];
    for (let d = first; d < today; d = addDays(d, 1)) {
      if (active.has(d)) earn();
      else if (freezes > 0) {
        freezes--;
        frozen.add(d);
      } else streak = 0;
    }
    if (active.has(today)) earn();
  }
  return { streak, freezes, frozen, doneToday: active.has(today) };
}

export function streakInfo(today = dayOf()) {
  const active = new Set(q('SELECT day FROM day_stat WHERE reviews >= goal').all().map((r) => r.day));
  const { streak, freezes, frozen, doneToday } = simulate(active, today);
  const stat = q('SELECT reviews, goal, xp FROM day_stat WHERE day = ?').get(today);
  return {
    streak,
    freezes,
    doneToday,
    // A meta do dia só "trava" quando o dia começa; antes disso vale a configuração atual.
    goal: stat?.goal ?? dailyGoal(),
    todayReviews: stat?.reviews ?? 0,
    todayXp: stat?.xp ?? 0,
    week: Array.from({ length: 7 }, (_, i) => {
      const day = addDays(today, i - 6);
      return { day, today: day === today, state: active.has(day) ? 'done' : frozen.has(day) ? 'frozen' : 'none' };
    })
  };
}
