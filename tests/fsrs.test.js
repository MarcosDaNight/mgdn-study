import test from 'node:test';
import assert from 'node:assert/strict';
import { schedule, intervalDays, retrievability, W } from '../src/lib/server/fsrs.js';

const DAY = 86_400_000;

test('retenção alvo de 90% dá intervalo ≈ estabilidade', () => {
  assert.equal(intervalDays(10), 10);
  assert.ok(Math.abs(retrievability(10, 10) - 0.9) < 1e-9);
});

test('primeira revisão: a nota define a estabilidade inicial', () => {
  const now = 1_000_000;
  const good = schedule(null, 3, now);
  assert.equal(good.stability, W[2]);
  assert.equal(good.due, now + intervalDays(W[2]) * DAY);
  const again = schedule(null, 1, now);
  assert.equal(again.due, now + 10 * 60_000);
  assert.equal(again.lapses, 1);
});

test('acertar na hora certa aumenta a estabilidade; errar diminui', () => {
  const t0 = 0;
  const c = schedule(null, 3, t0);
  const t1 = c.due;
  const good = schedule(c, 3, t1);
  const easy = schedule(c, 4, t1);
  const hard = schedule(c, 2, t1);
  const again = schedule(c, 1, t1);
  assert.ok(good.stability > c.stability);
  assert.ok(easy.stability > good.stability && good.stability > hard.stability);
  assert.ok(again.stability < c.stability);
  assert.equal(again.lapses, 1);
});

test('dificuldade fica entre 1 e 10', () => {
  let c = schedule(null, 1, 0);
  for (let i = 0; i < 30; i++) c = schedule(c, 1, c.due);
  assert.ok(c.difficulty <= 10 && c.difficulty >= 1);
});
