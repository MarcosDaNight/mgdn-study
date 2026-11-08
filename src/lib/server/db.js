import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const path = process.env.DB_PATH || './data/study.sqlite';
mkdirSync(dirname(path), { recursive: true });

export const db = new DatabaseSync(path);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS card (
    id TEXT PRIMARY KEY,
    due INTEGER NOT NULL,
    stability REAL NOT NULL,
    difficulty REAL NOT NULL,
    reps INTEGER NOT NULL,
    lapses INTEGER NOT NULL,
    last_review INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS review (
    ts INTEGER NOT NULL,
    day TEXT NOT NULL,
    card_id TEXT NOT NULL,
    grade INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS review_day ON review(day);
  CREATE TABLE IF NOT EXISTS day_stat (
    day TEXT PRIMARY KEY,
    reviews INTEGER NOT NULL DEFAULT 0,
    correct INTEGER NOT NULL DEFAULT 0,
    xp INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS freeze (day TEXT PRIMARY KEY);
  CREATE TABLE IF NOT EXISTS setting (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

export function getSetting(key, fallback) {
  const row = db.prepare('SELECT value FROM setting WHERE key = ?').get(key);
  return row ? row.value : fallback;
}
export function setSetting(key, value) {
  db.prepare(
    'INSERT INTO setting(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, String(value));
}
