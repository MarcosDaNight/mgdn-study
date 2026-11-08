import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const dir = process.env.CONTENT_DIR || './content';
const LANGS = ['pt', 'en'];
const TYPES = new Set(['card', 'choice', 'command', 'order']);

const isStr = (v) => typeof v === 'string' && v.trim() !== '';

/** Valida o currículo e devolve a lista de erros (vazia = ok). Usado no CI e no boot. */
export function validate(tracks) {
  const errs = [];
  const seen = new Set();
  const both = (v, where) => {
    for (const l of LANGS) if (!isStr(v?.[l])) errs.push(`${where}: falta "${l}"`);
  };
  for (const t of tracks) {
    both(t.title, `trilha ${t.track}`);
    if (!t.units?.length) errs.push(`trilha ${t.track}: sem unidades`);
    for (const u of t.units ?? []) {
      both(u.title, `unidade ${u.id}`);
      if (!u.items?.length) errs.push(`unidade ${u.id}: sem itens`);
      for (const it of u.items ?? []) {
        const w = `item ${it.id}`;
        if (!isStr(it.id) || seen.has(it.id)) errs.push(`${w}: id ausente ou duplicado`);
        seen.add(it.id);
        if (!TYPES.has(it.type)) errs.push(`${w}: type inválido "${it.type}"`);
        both(it.q, `${w}.q`);
        if (!String(it.src ?? '').startsWith('https://')) errs.push(`${w}: falta "src" (https) com a fonte`);
        if (it.hint) both(it.hint, `${w}.hint`);
        if (it.type === 'card') both(it.a, `${w}.a`);
        else both(it.why, `${w}.why`);
        if (it.type === 'choice') {
          for (const l of LANGS)
            if (!Array.isArray(it.options?.[l]) || it.options[l].length < 2) errs.push(`${w}.options.${l}: precisa de 2+ opções`);
          if (it.options?.pt?.length !== it.options?.en?.length) errs.push(`${w}: pt e en com número diferente de opções`);
          if (!Number.isInteger(it.correct) || it.correct < 0 || it.correct >= (it.options?.pt?.length ?? 0))
            errs.push(`${w}: "correct" inválido`);
        }
        if (it.type === 'command') {
          const ok = (a) => Array.isArray(a) && a.length > 0 && a.every(isStr);
          if (!ok(it.answer)) errs.push(`${w}: "answer" precisa ser uma lista de peças`);
          for (const a of it.alts ?? []) if (!ok(a)) errs.push(`${w}: "alts" inválido`);
          if (it.extra && !it.extra.every(isStr)) errs.push(`${w}: "extra" inválido`);
          // Uma alternativa só é alcançável se todas as peças dela estiverem no banco (answer + extra).
          if (ok(it.answer) && Array.isArray(it.alts)) {
            const bank = [...it.answer, ...(it.extra ?? [])];
            for (const a of it.alts.filter(ok)) {
              const pool = [...bank];
              const missing = a.filter((tk) => {
                const i = pool.indexOf(tk);
                if (i >= 0) pool.splice(i, 1);
                return i < 0;
              });
              if (missing.length) errs.push(`${w}: alt inalcançável, faltam no banco: ${missing.join(' ')}`);
            }
          }
        }
        if (it.type === 'order') {
          for (const l of LANGS)
            if (!Array.isArray(it.steps?.[l]) || it.steps[l].length < 3) errs.push(`${w}.steps.${l}: precisa de 3+ passos`);
          if (it.steps?.pt?.length !== it.steps?.en?.length) errs.push(`${w}: pt e en com número diferente de passos`);
        }
      }
    }
  }
  return errs;
}

const readYaml = (p) => parse(readFileSync(p, 'utf8'));

/** content/<trilha>/_track.yaml + content/<trilha>/NN-unidade.yaml (a ordem do nome é a ordem da trilha). */
export function loadTracks(root = dir) {
  const tracks = readdirSync(root)
    .filter((d) => statSync(join(root, d)).isDirectory())
    .sort()
    .map((d) => {
      const files = readdirSync(join(root, d)).filter((f) => f.endsWith('.yaml'));
      const meta = readYaml(join(root, d, '_track.yaml'));
      const units = files
        .filter((f) => f !== '_track.yaml')
        .sort()
        .map((f) => readYaml(join(root, d, f)));
      return { ...meta, units };
    });
  const errs = validate(tracks);
  if (errs.length) throw new Error(`Conteúdo inválido:\n- ${errs.join('\n- ')}`);
  return tracks;
}

const tracks = loadTracks();
const items = new Map();
for (const t of tracks)
  for (const u of t.units)
    for (const it of u.items) items.set(it.id, { ...it, track: t.track, unit: u.id, unitTitle: u.title, unitIcon: u.icon });

const list = [...items.values()];
export const getTracks = () => tracks;
export const getItem = (id) => items.get(id);
export const allItems = () => list;
