import { q, tx } from './db.js';
import { allItems, getItem, getTracks } from './content.js';
import { schedule } from './fsrs.js';
import { addDays, dayOf } from './time.js';
import { dailyGoal, newPerDay } from './settings.js';
import { RETRY_XP, XP } from '../shared.js';

const SESSION_MAX = 20;
export const MASTERED_DAYS = 21; // "dominado" = estabilidade >= 3 semanas

function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Quantos itens novos ainda cabem hoje (a quota conta o dia da 1ª vez, mesmo que o item tenha sido errado). */
export function newLeftToday(now = Date.now()) {
  const seen = q('SELECT COUNT(*) AS n FROM card WHERE first_day = ?').get(dayOf(now)).n;
  return Math.max(0, newPerDay() - seen);
}

/** Itens ainda não vistos, na ordem do currículo, alternando entre as trilhas (CKA e Linux avançam juntas). */
function unseenByTrack(filter) {
  const known = new Set(q('SELECT id FROM card').all().map((r) => r.id));
  const lanes = getTracks().map((t) =>
    t.units.flatMap((u) => u.items.map((i) => getItem(i.id))).filter((it) => !known.has(it.id) && filter(it))
  );
  const out = [];
  for (let i = 0; lanes.some((l) => i < l.length); i++) for (const l of lanes) if (i < l.length) out.push(l[i]);
  return out;
}

/**
 * Sessão = revisões vencidas (as mais atrasadas primeiro) + novos, intercalados (1 novo a cada 3).
 * `more`: treino extra, com +1 quota de novos e, se faltar, revisão adiantada dos itens que vencem primeiro.
 */
export function buildSession({ track = null, unit = null, more = false } = {}, now = Date.now()) {
  const inScope = (it) => (!track || it.track === track) && (!unit || it.unit === unit);

  const due = q('SELECT id FROM card WHERE due <= ? ORDER BY due ASC')
    .all(now)
    .map((r) => getItem(r.id))
    .filter((it) => it && inScope(it))
    .slice(0, SESSION_MAX);

  // Escolher uma unidade é pedir para estudá-la: a quota diária vale só para o modo geral.
  const quota = unit ? SESSION_MAX : newLeftToday(now) + (more ? newPerDay() : 0);
  const fresh = unseenByTrack(inScope).slice(0, Math.min(quota, Math.max(3, SESSION_MAX - due.length)));

  let early = [];
  if (more && due.length + fresh.length < 10) {
    early = q('SELECT id FROM card WHERE due > ? ORDER BY due ASC')
      .all(now)
      .map((r) => getItem(r.id))
      .filter((it) => it && inScope(it))
      .slice(0, 10 - due.length - fresh.length);
  }

  const reviews = [...due, ...early];
  const queue = [];
  for (let n = 0; reviews.length || fresh.length; n++) {
    if (fresh.length && (n % 3 === 2 || !reviews.length)) queue.push({ ...fresh.shift(), isNew: true });
    else queue.push({ ...reviews.shift(), isNew: false });
  }
  return queue.map((it) => prepare(it, now));
}

// Embaralha opções, peças e passos aqui, uma vez, para a ordem não mudar a cada render.
function prepare(it, now) {
  const row = q('SELECT * FROM card WHERE id = ?').get(it.id);
  // Prévia de quando o item volta para cada nota (os botões mostram "Bom · 4 d").
  const intervals = [1, 2, 3, 4].map((g) => schedule(cardState(row), g, now).due - now);
  const base = { ...it, intervals, uid: `${it.id}#0` };
  if (it.type === 'choice') {
    const order = shuffle(it.options.pt.map((_, i) => i));
    return { ...base, order, correct: order.indexOf(it.correct) };
  }
  if (it.type === 'command') return { ...base, bank: shuffle([...it.answer, ...(it.extra ?? [])]) };
  if (it.type === 'order') return { ...base, order: shuffle(it.steps.pt.map((_, i) => i)) };
  return base;
}

const cardState = (row) =>
  row && { stability: row.stability, difficulty: row.difficulty, reps: row.reps, lapses: row.lapses, lastReview: row.last_review };

export function counts(now = Date.now()) {
  const due = q('SELECT COUNT(*) AS n FROM card WHERE due <= ?').get(now).n;
  const learned = q('SELECT COUNT(*) AS n FROM card').get().n;
  const total = allItems().length;
  return { due, learned, total, newLeft: Math.min(newLeftToday(now), total - learned) };
}

/** Progresso por trilha e unidade, com a unidade "atual" (a primeira com algo por aprender). */
export function trackProgress(now = Date.now()) {
  const rows = new Map(q('SELECT id, stability, due FROM card').all().map((r) => [r.id, r]));
  return getTracks().map((t) => {
    let currentMarked = false;
    const units = t.units.map((u) => {
      const learned = u.items.filter((i) => rows.has(i.id)).length;
      const mastered = u.items.filter((i) => (rows.get(i.id)?.stability ?? 0) >= MASTERED_DAYS).length;
      const due = u.items.filter((i) => rows.get(i.id)?.due <= now).length;
      const current = !currentMarked && learned < u.items.length;
      if (current) currentMarked = true;
      return { id: u.id, title: u.title, icon: u.icon ?? '📘', total: u.items.length, learned, mastered, due, current };
    });
    return { track: t.track, title: t.title, units };
  });
}

/** Números gerais para o painel. */
export function overview(today = dayOf()) {
  const week = q('SELECT COALESCE(SUM(reviews),0) AS r, COALESCE(SUM(correct),0) AS c FROM day_stat WHERE day >= ?').get(addDays(today, -6));
  const total = q('SELECT COALESCE(SUM(reviews),0) AS r, COALESCE(SUM(xp),0) AS xp FROM day_stat').get();
  return { accuracy: week.r ? Math.round((week.c / week.r) * 100) : null, reviews: total.r, xp: total.xp };
}

/** Registra uma resposta: agenda pelo FSRS, grava o log e soma XP. Com dica, a nota máxima é "Difícil". */
export function answer(id, grade, { hinted = false, retry = false } = {}, now = Date.now()) {
  if (!getItem(id) || ![1, 2, 3, 4].includes(grade)) throw new Error('resposta inválida');
  if (hinted) grade = Math.min(grade, 2);
  const row = q('SELECT * FROM card WHERE id = ?').get(id);
  // Só a 1ª tentativa agenda: rever um erro minutos depois na mesma sessão é prática, não evidência de retenção.
  if (retry && !row) throw new Error('resposta inválida');
  const next = retry ? null : schedule(cardState(row), grade, now);
  const day = dayOf(now);
  const xp = retry ? RETRY_XP : XP[grade];
  tx(() => {
    if (next)
      q(
        `INSERT INTO card(id, due, stability, difficulty, reps, lapses, last_review, first_day)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET due=excluded.due, stability=excluded.stability,
           difficulty=excluded.difficulty, reps=excluded.reps, lapses=excluded.lapses,
           last_review=excluded.last_review`
      ).run(id, next.due, next.stability, next.difficulty, next.reps, next.lapses, next.lastReview, day);
    q('INSERT INTO review(ts, day, card_id, grade) VALUES(?, ?, ?, ?)').run(now, day, id, grade);
    q(
      `INSERT INTO day_stat(day, reviews, correct, xp, goal) VALUES(?, 1, ?, ?, ?)
       ON CONFLICT(day) DO UPDATE SET reviews = reviews + 1, correct = correct + ?, xp = xp + ?`
    ).run(day, grade > 1 ? 1 : 0, xp, dailyGoal(), grade > 1 ? 1 : 0, xp);
  });
  return { grade, xp };
}
