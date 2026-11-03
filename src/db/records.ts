import { eq } from 'drizzle-orm'
import type { AppDb } from './client'
import { mistakes, studyDays, studyTasks, vocabItems } from './schema'

// Write path for hand-entered learner records. Nothing here fabricates data.

const INTERVALS_DAYS = [1, 3, 7, 14, 30]

export function intervalForReps(reps: number): number {
  if (reps <= 0) return 1
  return INTERVALS_DAYS[Math.min(reps - 1, INTERVALS_DAYS.length - 1)]
}

function plusDays(now: Date, n: number): string {
  const d = new Date(now)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString()
}

/** Add or subtract studied minutes for a day. A day with 0 minutes is removed so it cannot extend a streak. */
export async function adjustStudyMinutes(db: AppDb, date: string, delta: number): Promise<void> {
  const existing = (await db.select().from(studyDays).where(eq(studyDays.date, date)))[0]
  const next = Math.max(0, (existing?.minutes ?? 0) + delta)
  if (next === 0) {
    await db.delete(studyDays).where(eq(studyDays.date, date))
  } else if (existing) {
    await db.update(studyDays).set({ minutes: next }).where(eq(studyDays.date, date))
  } else {
    await db.insert(studyDays).values({ date, minutes: next })
  }
}

export async function addStudyTask(
  db: AppDb,
  input: { date: string; title: string; skill: string; minutes: number },
  now: Date = new Date(),
): Promise<void> {
  await db.insert(studyTasks).values({ ...input, createdAt: now.toISOString() })
}

/** Marking a task done credits its minutes to that day; un-marking takes them back. Repeat calls are no-ops. */
export async function setTaskDone(db: AppDb, id: number, done: boolean): Promise<boolean> {
  const task = (await db.select().from(studyTasks).where(eq(studyTasks.id, id)))[0]
  if (!task || task.done === done) return false
  await db.update(studyTasks).set({ done }).where(eq(studyTasks.id, id))
  await adjustStudyMinutes(db, task.date, done ? task.minutes : -task.minutes)
  return true
}

export async function addVocab(db: AppDb, input: { word: string; meaning?: string }, now: Date = new Date()): Promise<void> {
  await db.insert(vocabItems).values({
    word: input.word,
    meaning: input.meaning ?? null,
    nextReviewAt: now.toISOString(),
    createdAt: now.toISOString(),
  })
}

export async function reviewVocab(db: AppDb, id: number, remembered: boolean, now: Date = new Date()): Promise<boolean> {
  const item = (await db.select().from(vocabItems).where(eq(vocabItems.id, id)))[0]
  if (!item) return false
  const reps = remembered ? item.reps + 1 : 0
  await db.update(vocabItems).set({ reps, nextReviewAt: plusDays(now, intervalForReps(reps)) }).where(eq(vocabItems.id, id))
  return true
}

export async function addMistake(
  db: AppDb,
  input: { skill: string; label: string; detail?: string },
  now: Date = new Date(),
): Promise<void> {
  await db.insert(mistakes).values({
    skill: input.skill,
    label: input.label,
    detail: input.detail ?? null,
    nextReviewAt: plusDays(now, 1),
    createdAt: now.toISOString(),
  })
}

export async function resolveMistake(db: AppDb, id: number): Promise<void> {
  await db.update(mistakes).set({ resolved: true }).where(eq(mistakes.id, id))
}
