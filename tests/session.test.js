import test from 'node:test';
import assert from 'node:assert/strict';
import './helpers.js';
const { buildSession, answer, counts, newLeftToday } = await import('../src/lib/server/session.js');
const { streakInfo } = await import('../src/lib/server/streak.js');
const { q } = await import('../src/lib/server/db.js');

const DAY = 86_400_000;

test('a sessão alterna as trilhas e respeita a quota de novos', () => {
  const s = buildSession();
  assert.equal(s.length, 8);
  assert.deepEqual(
    s.slice(0, 4).map((i) => i.track),
    ['t1', 't2', 't1', 't2']
  );
  assert.ok(s.every((i) => i.isNew));
});

test('errar um item novo gasta a quota do dia (não dá para burlá-la errando)', () => {
  const [first] = buildSession();
  answer(first.id, 1);
  answer(first.id, 3); // acertou na segunda: reps = 2, mas continua contando como 1 novo
  assert.equal(newLeftToday(), 7);
  assert.equal(counts().newLeft, 7);
});

test('com a dica, a nota máxima é Difícil; o erro continua erro', () => {
  const [, b, c] = buildSession();
  assert.equal(answer(b.id, 4, { hinted: true }).grade, 2);
  assert.equal(answer(c.id, 1, { hinted: true }).grade, 1);
});

test('a repetição na mesma sessão não reagenda o item, mas soma XP e conta na meta', () => {
  const [d] = buildSession();
  answer(d.id, 1);
  const before = q('SELECT due, reps FROM card WHERE id = ?').get(d.id);
  const r = answer(d.id, 3, { retry: true });
  const after = q('SELECT due, reps FROM card WHERE id = ?').get(d.id);
  assert.deepEqual(after, before);
  assert.equal(r.xp, 4);
});

test('resposta inválida é rejeitada', () => {
  assert.throws(() => answer('nao-existe', 3));
  assert.throws(() => answer('a0', 9));
  assert.throws(() => answer('b5', 3, { retry: true }), /inválida/); // retry sem 1ª tentativa
});

test('unidade escolhida ignora a quota diária e o treino extra soma mais novos', () => {
  const unit = buildSession({ unit: 'u1' });
  assert.ok(unit.length > 0 && unit.every((i) => i.unit === 'u1'));
  assert.ok(buildSession({ more: true }).length >= buildSession().length);
});

test('revisões vencidas vêm antes dos novos, e a meta do dia fica gravada', () => {
  const ids = q('SELECT id FROM card').all().map((r) => r.id);
  q('UPDATE card SET due = ? WHERE id = ?').run(Date.now() - DAY, ids[0]);
  const s = buildSession();
  assert.equal(s[0].id, ids[0]);
  assert.equal(s[0].isNew, false);
  assert.equal(streakInfo().goal, 10);
});
