import test from 'node:test';
import assert from 'node:assert/strict';
import { validate, loadTracks } from '../src/lib/server/content.js';

test('o currículo real é válido (pt/en completos, fonte presente, ids únicos)', () => {
  const t = loadTracks('./content');
  assert.ok(t.length >= 2);
});

test('a validação acusa o que falta', () => {
  const bad = [
    {
      track: 'x',
      title: { pt: 'x', en: 'x' },
      units: [
        {
          id: 'u',
          title: { pt: 'u', en: 'u' },
          items: [
            { id: 'a', type: 'card', q: { pt: 'q' }, a: { pt: 'a', en: 'a' }, src: 'http://x' },
            { id: 'a', type: 'choice', q: { pt: 'q', en: 'q' }, options: { pt: ['1', '2'], en: ['1'] }, correct: 5, why: { pt: 'w', en: 'w' }, src: 'https://x' },
            { id: 'c', type: 'order', q: { pt: 'q', en: 'q' }, steps: { pt: ['a', 'b'], en: ['a', 'b'] }, why: { pt: 'w', en: 'w' }, src: 'https://x' }
          ]
        }
      ]
    }
  ];
  const errs = validate(bad).join('\n');
  assert.match(errs, /q: falta "en"/);
  assert.match(errs, /falta "src"/);
  assert.match(errs, /duplicado/);
  assert.match(errs, /número diferente de opções/);
  assert.match(errs, /"correct" inválido/);
  assert.match(errs, /3\+ passos/);
});

test('uma alternativa de comando só é válida se suas peças estão no banco', () => {
  const t = (cmd) => [{ track: 'x', title: { pt: 'x', en: 'x' }, units: [{ id: 'u', title: { pt: 'u', en: 'u' }, items: [cmd] }] }];
  const base = { id: 'c', type: 'command', q: { pt: 'q', en: 'q' }, why: { pt: 'w', en: 'w' }, src: 'https://x', answer: ['grep', '-ri', 'x'] };
  assert.equal(validate(t({ ...base, alts: [['grep', '-ri', 'x']] })).length, 0);
  assert.match(validate(t({ ...base, alts: [['grep', '-ir', 'x']] })).join(), /alt inalcançável.*-ir/);
  assert.equal(validate(t({ ...base, extra: ['-ir'], alts: [['grep', '-ir', 'x']] })).length, 0);
});
