import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Only real learner records live here. Demo data never enters the database.
// `origin` separates hand-entered rows ('manual') from rows imported later via the BandReady adapter ('bandready').

export const profile = sqliteTable('profile', {
  id: integer('id').primaryKey(),
  targetBand: real('target_band').notNull().default(7),
  examDate: text('exam_date'),
  dailyMinutes: integer('daily_minutes').notNull().default(60),
  createdAt: text('created_at').notNull(),
})

export const attempts = sqliteTable(
  'attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    skill: text('skill').notNull(),
    kind: text('kind').notNull(),
    band: real('band'),
    rawScore: integer('raw_score'),
    maxScore: integer('max_score'),
    origin: text('origin').notNull().default('manual'),
    externalId: text('external_id'),
    takenAt: text('taken_at').notNull(),
    notes: text('notes'),
  },
  (t) => [index('attempts_skill_taken').on(t.skill, t.takenAt)],
)

export const mockExams = sqliteTable('mock_exams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  takenAt: text('taken_at').notNull(),
  overall: real('overall'),
  listening: real('listening'),
  reading: real('reading'),
  writing: real('writing'),
  speaking: real('speaking'),
  origin: text('origin').notNull().default('manual'),
  externalId: text('external_id'),
})

export const studyTasks = sqliteTable(
  'study_tasks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    title: text('title').notNull(),
    skill: text('skill').notNull(),
    minutes: integer('minutes').notNull(),
    done: integer('done', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('study_tasks_date').on(t.date)],
)

export const studyDays = sqliteTable('study_days', {
  date: text('date').primaryKey(),
  minutes: integer('minutes').notNull(),
})

export const vocabItems = sqliteTable(
  'vocab_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    word: text('word').notNull(),
    meaning: text('meaning'),
    nextReviewAt: text('next_review_at').notNull(),
    reps: integer('reps').notNull().default(0),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('vocab_due').on(t.nextReviewAt)],
)

export const mistakes = sqliteTable(
  'mistakes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    skill: text('skill').notNull(),
    label: text('label').notNull(),
    detail: text('detail'),
    nextReviewAt: text('next_review_at').notNull(),
    resolved: integer('resolved', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('mistakes_due').on(t.resolved, t.nextReviewAt)],
)
