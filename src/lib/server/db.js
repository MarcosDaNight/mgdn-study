import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const path = process.env.DB_PATH || './data/study.sqlite';
if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });

export const db = new DatabaseSync(path);
db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 5000;');

// Migrações em ordem; `PRAGMA user_version` guarda quantas já rodaram.
// A 1 é o esquema original (IF NOT EXISTS: bancos já em produção seguem intactos).
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS card (
     id TEXT PRIMARY KEY, due INTEGER NOT NULL, stability REAL NOT NULL, difficulty REAL NOT NULL,
     reps INTEGER NOT NULL, lapses INTEGER NOT NULL, last_review INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS review (
     ts INTEGER NOT NULL, day TEXT NOT NULL, card_id TEXT NOT NULL, grade INTEGER NOT NULL);
   CREATE INDEX IF NOT EXISTS review_day ON review(day);
   CREATE TABLE IF NOT EXISTS day_stat (
     day TEXT PRIMARY KEY, reviews INTEGER NOT NULL DEFAULT 0,
     correct INTEGER NOT NULL DEFAULT 0, xp INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE IF NOT EXISTS freeze (day TEXT PRIMARY KEY);
   CREATE TABLE IF NOT EXISTS setting (key TEXT PRIMARY KEY, value TEXT NOT NULL);`,
  // 2: o dia em que o item foi visto pela 1ª vez (quota de novos) e a meta de cada dia
  // (mudar a meta não reescreve o passado). O streak agora é calculado, sem a tabela freeze.
  `ALTER TABLE card ADD COLUMN first_day TEXT;
   UPDATE card SET first_day = (SELECT MIN(day) FROM review WHERE card_id = card.id);
   CREATE INDEX IF NOT EXISTS card_first_day ON card(first_day);
   ALTER TABLE day_stat ADD COLUMN goal INTEGER NOT NULL DEFAULT 10;
   DROP TABLE IF EXISTS freeze;`
];

function migrate() {
  let v = db.prepare('PRAGMA user_version').get().user_version;
  for (; v < MIGRATIONS.length; v++) {
    db.exec('BEGIN');
    try {
      db.exec(MIGRATIONS[v]);
      db.exec(`PRAGMA user_version = ${v + 1}`);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
}
migrate();

// Statements preparados uma vez só.
const cache = new Map();
export const q = (sql) => {
  let s = cache.get(sql);
  if (!s) cache.set(sql, (s = db.prepare(sql)));
  return s;
};

export function tx(fn) {
  db.exec('BEGIN');
  try {
    const r = fn();
    db.exec('COMMIT');
    return r;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
