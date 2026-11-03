import { and, asc, desc, eq, lte } from 'drizzle-orm'
import type { AppDb } from './client'
import { attempts, mistakes, mockExams, profile, studyDays, studyTasks, vocabItems } from './schema'
import type { BandPoint, DashboardData, Skill, SkillEstimate, Sourced, WeakPoint } from '@/lib/types'

const SKILLS: Skill[] = ['listening', 'reading', 'writing', 'speaking']

function none<T>(): Sourced<T> {
  return { source: 'none', data: null }
}
function real<T>(data: T): Sourced<T> {
  return { source: 'real', data }
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Consecutive studied days ending today (or yesterday, so an unfinished today does not break the streak). */
export function computeStreak(dates: string[], today: Date): number {
  const set = new Set(dates)
  const cursor = new Date(today)
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let n = 0
  while (set.has(dayKey(cursor))) {
    n++
    cursor.setDate(cursor.getDate() - 1)
  }
  return n
}

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2
}

export async function loadDashboard(db: AppDb, now: Date = new Date()): Promise<DashboardData> {
  const today = dayKey(now)
  const nowIso = now.toISOString()

  const prof = (await db.select().from(profile).limit(1))[0]
  const targetBand = prof?.targetBand ?? 7

  // Skill estimates: average of the latest 3 scored attempts per skill, labelled as estimates in the UI.
  const estimateRows: SkillEstimate[] = []
  for (const skill of SKILLS) {
    const rows = await db
      .select()
      .from(attempts)
      .where(eq(attempts.skill, skill))
      .orderBy(desc(attempts.takenAt))
    const scored = rows.filter((r) => r.band !== null)
    if (scored.length === 0) continue
    const recent = scored.slice(0, 3).map((r) => r.band as number)
    const band = roundHalf(recent.reduce((a, b) => a + b, 0) / recent.length)
    const prev = scored.slice(3, 6).map((r) => r.band as number)
    const trend = prev.length ? roundHalf(band - prev.reduce((a, b) => a + b, 0) / prev.length) : null
    estimateRows.push({ skill, band, trend, attempts: rows.length })
  }
  const estimates: Sourced<SkillEstimate[]> = estimateRows.length ? real(estimateRows) : none()
  const overall: Sourced<number> = estimateRows.length === SKILLS.length
    ? real(roundHalf(estimateRows.reduce((a, e) => a + (e.band as number), 0) / SKILLS.length))
    : none()

  // Trajectory and recent mocks come from full mock exams only.
  const mockRows = await db.select().from(mockExams).orderBy(asc(mockExams.takenAt))
  const scoredMocks = mockRows.filter((m) => m.overall !== null)
  const trajectory: Sourced<BandPoint[]> = scoredMocks.length
    ? real(scoredMocks.map((m) => ({ date: m.takenAt.slice(0, 10), band: m.overall as number })))
    : none()
  const mocks = mockRows.length
    ? real(
        [...mockRows].reverse().slice(0, 5).map((m) => ({
          id: String(m.id),
          date: m.takenAt.slice(0, 10),
          overall: m.overall ?? 0,
          listening: m.listening ?? 0,
          reading: m.reading ?? 0,
          writing: m.writing ?? 0,
          speaking: m.speaking ?? 0,
        })),
      )
    : none<DashboardData['mocks']['data'] & object>()

  const taskRows = await db.select().from(studyTasks).where(eq(studyTasks.date, today))
  const tasks = taskRows.length
    ? real(
        taskRows.map((t) => ({
          id: String(t.id),
          title: t.title,
          skill: t.skill as Skill | 'vocabulary' | 'review',
          minutes: t.minutes,
          done: t.done,
        })),
      )
    : none<DashboardData['tasks']['data'] & object>()

  const mistakeRows = await db.select().from(mistakes).where(eq(mistakes.resolved, false))
  const weak: WeakPoint[] = []
  const seen = new Set<string>()
  for (const m of mistakeRows) {
    const key = `${m.skill}:${m.label}`
    if (seen.has(key)) continue
    seen.add(key)
    weak.push({ skill: m.skill as Skill, label: m.label, detail: m.detail ?? '' })
    if (weak.length === 3) break
  }
  const weakPoints: Sourced<WeakPoint[]> = weak.length ? real(weak) : none()

  const dayRows = await db.select().from(studyDays).orderBy(asc(studyDays.date))
  const dates = dayRows.map((r) => r.date)
  const streakDays: Sourced<number> = dates.length ? real(computeStreak(dates, now)) : none()
  const studiedDates: Sourced<string[]> = dates.length ? real(dates) : none()

  const vocabDueRows = await db.select().from(vocabItems).where(lte(vocabItems.nextReviewAt, nowIso))
  const totalVocab = (await db.select().from(vocabItems).limit(1)).length
  const vocabDue: Sourced<number> = totalVocab ? real(vocabDueRows.length) : none()

  const mistakesDueRows = await db
    .select()
    .from(mistakes)
    .where(and(eq(mistakes.resolved, false), lte(mistakes.nextReviewAt, nowIso)))
  const mistakesDue: Sourced<number> = mistakeRows.length ? real(mistakesDueRows.length) : none()

  // No AI advice is generated yet; it stays empty until a model is configured.
  const advice: Sourced<string> = none()

  return {
    targetBand,
    estimates,
    overall,
    trajectory,
    mocks,
    tasks,
    weakPoints,
    streakDays,
    studiedDates,
    vocabDue,
    mistakesDue,
    advice,
  }
}
