import { db, getSetting } from './db.js';
import { allItems, getTracks, getItem } from './content.js';
import { schedule } from './fsrs.js';
import { dayOf } from './time.js';
import { dailyGoal } from './streak.js';

export const NEW_PER_DAY = 8; // carga nova limitada: aprender pouco, revisar sempre
const SESSION_MAX = 20;

const cardRow = (id) => db.prepare('SELECT * FROM card WHERE id = ?').get(id);

function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/**
 * Sessão = revisões vencidas (as mais atrasadas primeiro) + itens novos, intercalados.
 * Itens novos seguem a ordem do currículo (do básico ao avançado dentro de cada unidade).
 */
export function buildSession(track = null, now = Date.now()) {
  const inTrack = (it) => !track || it.track === track;
  const seenToday = db
    .prepare('SELECT COUNT(DISTINCT card_id) AS n FROM review WHERE day = ? AND card_id IN (SELECT id FROM card WHERE reps = 1)')
    .get(dayOf(now)).n;
  const newQuota = Math.max(0, NEW_PER_DAY - seenToday);

  const due = db
    .prepare('SELECT id FROM card WHERE due <= ? ORDER BY due ASC')
    .all(now)
    .map((r) => getItem(r.id))
    .filter((it) => it && inTrack(it));

  const known = new Set(db.prepare('SELECT id FROM card').all().map((r) => r.id));
  const fresh = allItems()
    .filter((it) => inTrack(it) && !known.has(it.id))
    .slice(0, newQuota);

  const queue = [];
  const dueQ = due.slice(0, SESSION_MAX);
  const freshQ = fresh.slice(0, Math.max(0, SESSION_MAX - dueQ.length) || 3);
  // Intercala: uma nova a cada ~3 revisões (revisão espaçada + prática intercalada).
  let n = 0;
  while (dueQ.length || freshQ.length) {
    if (freshQ.length && (n % 3 === 2 || !dueQ.length)) queue.push({ ...freshQ.shift(), isNew: true });
    else queue.push({ ...dueQ.shift(), isNew: false });
    n++;
  }
  return queue.map(prepare);
}

// Embaralha opções e fichas aqui, uma vez, para a ordem não mudar a cada render.
function prepare(it) {
  if (it.type === 'choice') {
    const order = shuffle(it.options.pt.map((_, i) => i));
    return { ...it, order, correct: order.indexOf(it.correct) };
  }
  if (it.type === 'command') {
    return { ...it, bank: shuffle([...it.answer, ...(it.extra ?? [])]) };
  }
  return it;
}

export function counts(now = Date.now()) {
  const due = db.prepare('SELECT COUNT(*) AS n FROM card WHERE due <= ?').get(now).n;
  const learned = db.prepare('SELECT COUNT(*) AS n FROM card').get().n;
  const total = allItems().length;
  return { due, learned, total, newLeft: Math.min(NEW_PER_DAY, total - learned) };
}

export function trackProgress() {
  const known = new Map(db.prepare('SELECT id, stability FROM card').all().map((r) => [r.id, r.stability]));
  return getTracks().map((t) => ({
    track: t.track,
    title: t.title,
    units: t.units.map((u) => {
      const learned = u.items.filter((i) => known.has(i.id)).length;
      // "Dominado" = estabilidade >= 21 dias: lembrar por 3 semanas é um bom marco.
      const mastered = u.items.filter((i) => (known.get(i.id) ?? 0) >= 21).length;
      return { id: u.id, title: u.title, total: u.items.length, learned, mastered };
    })
  }));
}

/** Registra uma resposta: agenda pelo FSRS, grava o log e soma XP. */
export function answer(id, grade, now = Date.now()) {
  if (!getItem(id) || ![1, 2, 3, 4].includes(grade)) throw new Error('resposta inválida');
  const row = cardRow(id);
  const next = schedule(
    row && {
      stability: row.stability,
      difficulty: row.difficulty,
      reps: row.reps,
      lapses: row.lapses,
      lastReview: row.last_review
    },
    grade,
    now
  );
  const day = dayOf(now);
  const xp = { 1: 2, 2: 6, 3: 10, 4: 12 }[grade];
  db.exec('BEGIN');
  try {
    db.prepare(
      `INSERT INTO card(id, due, stability, difficulty, reps, lapses, last_review)
       VALUES(?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET due=excluded.due, stability=excluded.stability,
         difficulty=excluded.difficulty, reps=excluded.reps, lapses=excluded.lapses,
         last_review=excluded.last_review`
    ).run(id, next.due, next.stability, next.difficulty, next.reps, next.lapses, next.lastReview);
    db.prepare('INSERT INTO review(ts, day, card_id, grade) VALUES(?, ?, ?, ?)').run(now, day, id, grade);
    db.prepare(
      `INSERT INTO day_stat(day, reviews, correct, xp) VALUES(?, 1, ?, ?)
       ON CONFLICT(day) DO UPDATE SET reviews = reviews + 1, correct = correct + ?, xp = xp + ?`
    ).run(day, grade > 1 ? 1 : 0, xp, grade > 1 ? 1 : 0, xp);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return { xp, dueIn: next.due - now, goal: dailyGoal() };
}

export const lang = () => getSetting('lang', 'pt');
