import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const dir = process.env.CONTENT_DIR || './content';
const LANGS = ['pt', 'en'];
const TYPES = new Set(['card', 'choice', 'command']);

/** Valida o currículo e devolve a lista de erros (vazia = ok). Usado no CI e no boot. */
export function validate(tracks) {
  const errs = [];
  const seen = new Set();
  const both = (v, where) => {
    for (const l of LANGS) if (v?.[l] === undefined || v[l] === '') errs.push(`${where}: falta "${l}"`);
  };
  for (const t of tracks) {
    both(t.title, `trilha ${t.track}`);
    for (const u of t.units ?? []) {
      both(u.title, `unidade ${u.id}`);
      for (const it of u.items ?? []) {
        const w = `item ${it.id}`;
        if (!it.id || seen.has(it.id)) errs.push(`${w}: id ausente ou duplicado`);
        seen.add(it.id);
        if (!TYPES.has(it.type)) errs.push(`${w}: type inválido "${it.type}"`);
        both(it.q, `${w}.q`);
        if (!it.src?.startsWith('https://')) errs.push(`${w}: falta "src" (https) com a fonte`);
        if (it.type === 'card') both(it.a, `${w}.a`);
        if (it.type === 'choice') {
          for (const l of LANGS) {
            if (!Array.isArray(it.options?.[l]) || it.options[l].length < 2)
              errs.push(`${w}.options.${l}: precisa de 2+ opções`);
          }
          if (it.options?.pt?.length !== it.options?.en?.length)
            errs.push(`${w}: pt e en com número diferente de opções`);
          if (!Number.isInteger(it.correct) || it.correct >= (it.options?.pt?.length ?? 0))
            errs.push(`${w}: "correct" inválido`);
          both(it.why, `${w}.why`);
        }
        if (it.type === 'command') {
          if (!Array.isArray(it.answer) || !it.answer.length) errs.push(`${w}: falta "answer"`);
          both(it.why, `${w}.why`);
        }
      }
    }
  }
  return errs;
}

export function loadTracks() {
  const files = readdirSync(dir).filter((f) => f.endsWith('.yaml'));
  const tracks = files.sort().map((f) => parse(readFileSync(join(dir, f), 'utf8')));
  const errs = validate(tracks);
  if (errs.length) throw new Error(`Conteúdo inválido:\n- ${errs.join('\n- ')}`);
  return tracks;
}

const tracks = loadTracks();
const items = new Map();
for (const t of tracks)
  for (const u of t.units)
    for (const it of u.items) items.set(it.id, { ...it, track: t.track, unit: u.id });

export const getTracks = () => tracks;
export const getItem = (id) => items.get(id);
export const allItems = () => [...items.values()];
