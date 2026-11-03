import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import { drizzle } from 'drizzle-orm/sqlite-proxy'
import * as schema from './schema'

// Keep this DDL in sync with schema.ts. Phase 2 uses idempotent bootstrap SQL;
// switch to generated migrations once the schema stabilises.
const DDL = `
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY,
  target_band REAL NOT NULL DEFAULT 7,
  exam_date TEXT,
  daily_minutes INTEGER NOT NULL DEFAULT 60,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill TEXT NOT NULL,
  kind TEXT NOT NULL,
  band REAL,
  raw_score INTEGER,
  max_score INTEGER,
  origin TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT,
  taken_at TEXT NOT NULL,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS attempts_skill_taken ON attempts (skill, taken_at);
CREATE TABLE IF NOT EXISTS mock_exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  taken_at TEXT NOT NULL,
  overall REAL,
  listening REAL,
  reading REAL,
  writing REAL,
  speaking REAL,
  origin TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT
);
CREATE TABLE IF NOT EXISTS study_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  skill TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS study_tasks_date ON study_tasks (date);
CREATE TABLE IF NOT EXISTS study_days (
  date TEXT PRIMARY KEY,
  minutes INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS vocab_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  meaning TEXT,
  next_review_at TEXT NOT NULL,
  reps INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS vocab_due ON vocab_items (next_review_at);
CREATE TABLE IF NOT EXISTS mistakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill TEXT NOT NULL,
  label TEXT NOT NULL,
  detail TEXT,
  next_review_at TEXT NOT NULL,
  resolved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS mistakes_due ON mistakes (resolved, next_review_at);
`

export function createDb(file: string) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true })
  const raw = new DatabaseSync(file)
  if (file !== ':memory:') raw.exec('PRAGMA journal_mode = WAL;')
  raw.exec('PRAGMA foreign_keys = ON;')
  raw.exec(DDL)

  const db = drizzle(
    async (sql, params, method) => {
      const stmt = raw.prepare(sql)
      const p = params as SQLInputValue[]
      if (method === 'run') {
        stmt.run(...p)
        return { rows: [] }
      }
      stmt.setReturnArrays(true)
      if (method === 'get') {
        const row = stmt.get(...p) as unknown as unknown[] | undefined
        return { rows: row ?? [] }
      }
      return { rows: stmt.all(...p) as unknown as unknown[][] }
    },
    { schema },
  )
  return { db, raw }
}

export type AppDb = ReturnType<typeof createDb>['db']

// Default location is ./data/ielts-os.db (gitignored). Override with IELTS_OS_DATA_DIR.
const globalForDb = globalThis as unknown as { __ieltsOsDb?: AppDb }

export function getDb(): AppDb {
  if (!globalForDb.__ieltsOsDb) {
    const dir = process.env.IELTS_OS_DATA_DIR ?? resolve(process.cwd(), 'data')
    globalForDb.__ieltsOsDb = createDb(resolve(dir, 'ielts-os.db')).db
  }
  return globalForDb.__ieltsOsDb
}
