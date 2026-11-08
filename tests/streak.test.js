import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers.js';
const { simulate } = await import('../src/lib/server/streak.js');
const { addDays } = await import('../src/lib/server/time.js');

const days = (from, ...offsets) => new Set(offsets.map((o) => addDays(from, o)));
const T0 = '2026-01-01';

test('sem histórico: streak 0', () => {
  assert.deepEqual(
    (({ streak, freezes }) => ({ streak, freezes }))(simulate(new Set(), '2026-01-10')),
    { streak: 0, freezes: 0 }
  );
});

test('dias seguidos até ontem contam, e hoje aberto não zera', () => {
  const r = simulate(days(T0, 0, 1, 2), addDays(T0, 3));
  assert.equal(r.streak, 3);
  assert.equal(r.doneToday, false);
});

test('hoje com a meta batida soma ao streak', () => {
  const r = simulate(days(T0, 0, 1, 2, 3), addDays(T0, 3));
  assert.equal(r.streak, 4);
  assert.equal(r.doneToday, true);
});

test('um dia perdido sem congelar zera o streak', () => {
  const r = simulate(days(T0, 0, 1, 2, 4), addDays(T0, 4));
  assert.equal(r.streak, 1);
});

test('7 dias seguidos ganham um congelar, que salva um dia perdido', () => {
  const week = [0, 1, 2, 3, 4, 5, 6]; // 7 dias: ganha 1 congelar
  const r = simulate(days(T0, ...week, 8), addDays(T0, 8)); // perdeu o dia 7
  assert.equal(r.streak, 8, 'o streak continua');
  assert.equal(r.freezes, 0, 'o congelar foi gasto');
  assert.ok(r.frozen.has(addDays(T0, 7)));
});

test('o dia congelado não quebra a contagem para o próximo congelar', () => {
  // 7 ativos, 1 congelado, mais 6 ativos: o streak chega a 13; o 14º dia ativo ganha outro congelar.
  const offs = [...Array(7).keys(), ...[8, 9, 10, 11, 12, 13, 14]];
  const r = simulate(days(T0, ...offs), addDays(T0, 14));
  assert.equal(r.streak, 14);
  assert.equal(r.freezes, 1);
});

test('o limite é de 2 congelares', () => {
  const r = simulate(days(T0, ...Array(28).keys()), addDays(T0, 27));
  assert.equal(r.freezes, 2);
});
