// FSRS-4.5 (Free Spaced Repetition Scheduler), pesos padrão.
// https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm
// Notas: 1 = Errei, 2 = Difícil, 3 = Bom, 4 = Fácil. Tempos em dias.

export const W = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072,
  0.0793, 0.3246, 1.587, 0.2272, 2.8755
];
const F = 19 / 81;
const C = -0.5;
export const RETENTION = 0.9;

const clampD = (d) => Math.min(10, Math.max(1, d));

export function retrievability(elapsedDays, stability) {
  return Math.pow(1 + (F * elapsedDays) / stability, C);
}

export function intervalDays(stability, retention = RETENTION) {
  const days = (stability / F) * (Math.pow(retention, 1 / C) - 1);
  return Math.max(1, Math.round(days));
}

/**
 * @param {{stability:number, difficulty:number, reps:number, lapses:number, lastReview:number|null}|null} card
 * @param {1|2|3|4} grade
 * @param {number} now epoch ms
 */
export function schedule(card, grade, now) {
  if (!card || !card.reps) {
    const stability = W[grade - 1];
    const difficulty = clampD(W[4] - W[5] * (grade - 3));
    return finish({ stability, difficulty, reps: 1, lapses: grade === 1 ? 1 : 0 }, grade, now);
  }
  const elapsed = Math.max(0, (now - card.lastReview) / 86_400_000);
  const r = retrievability(elapsed, card.stability);
  const d0 = W[4];
  const difficulty = clampD(
    W[7] * d0 + (1 - W[7]) * (card.difficulty - W[6] * (grade - 3))
  );
  let stability;
  if (grade === 1) {
    stability = Math.min(
      card.stability,
      W[11] *
        Math.pow(card.difficulty, -W[12]) *
        (Math.pow(card.stability + 1, W[13]) - 1) *
        Math.exp((1 - r) * W[14])
    );
  } else {
    const hard = grade === 2 ? W[15] : 1;
    const easy = grade === 4 ? W[16] : 1;
    stability =
      card.stability *
      (1 +
        Math.exp(W[8]) *
          (11 - card.difficulty) *
          Math.pow(card.stability, -W[9]) *
          (Math.exp((1 - r) * W[10]) - 1) *
          hard *
          easy);
  }
  return finish(
    {
      stability: Math.max(0.01, stability),
      difficulty,
      reps: card.reps + 1,
      lapses: card.lapses + (grade === 1 ? 1 : 0)
    },
    grade,
    now
  );
}

function finish(s, grade, now) {
  // Errou: volta em 10 minutos (ainda na mesma sessão). Acertou: intervalo em dias.
  const due = grade === 1 ? now + 10 * 60_000 : now + intervalDays(s.stability) * 86_400_000;
  return { ...s, due, lastReview: now };
}
