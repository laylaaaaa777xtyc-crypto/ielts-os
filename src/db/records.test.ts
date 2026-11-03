import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { createDb } from './client'
import { loadDashboard } from './dashboard'
import { addMistake, addStudyTask, addVocab, intervalForReps, resolveMistake, reviewVocab, setTaskDone } from './records'
import { studyDays, vocabItems } from './schema'

const NOW = new Date('2026-11-03T10:00:00.000Z')

describe('study tasks', () => {
  it('credits minutes once when done and takes them back when undone', async () => {
    const { db } = createDb(':memory:')
    await addStudyTask(db, { date: '2026-11-03', title: 'Reading drill', skill: 'reading', minutes: 25 }, NOW)
    expect(await setTaskDone(db, 1, true)).toBe(true)
    expect(await setTaskDone(db, 1, true)).toBe(false)
    let rows = await db.select().from(studyDays)
    expect(rows).toEqual([{ date: '2026-11-03', minutes: 25 }])
    expect(await setTaskDone(db, 1, false)).toBe(true)
    rows = await db.select().from(studyDays)
    expect(rows).toEqual([])
  })
  it('returns false for an unknown task', async () => {
    const { db } = createDb(':memory:')
    expect(await setTaskDone(db, 99, true)).toBe(false)
  })
})

describe('vocabulary review', () => {
  it('spaces reviews out when remembered and resets when forgotten', async () => {
    const { db } = createDb(':memory:')
    await addVocab(db, { word: 'mitigate' }, NOW)
    await reviewVocab(db, 1, true, NOW)
    let row = (await db.select().from(vocabItems).where(eq(vocabItems.id, 1)))[0]
    expect(row.reps).toBe(1)
    expect(row.nextReviewAt).toBe('2026-11-04T10:00:00.000Z')
    await reviewVocab(db, 1, true, NOW)
    row = (await db.select().from(vocabItems).where(eq(vocabItems.id, 1)))[0]
    expect(row.reps).toBe(2)
    expect(row.nextReviewAt).toBe('2026-11-06T10:00:00.000Z')
    await reviewVocab(db, 1, false, NOW)
    row = (await db.select().from(vocabItems).where(eq(vocabItems.id, 1)))[0]
    expect(row.reps).toBe(0)
    expect(row.nextReviewAt).toBe('2026-11-04T10:00:00.000Z')
  })
  it('caps the interval at 30 days', () => {
    expect(intervalForReps(0)).toBe(1)
    expect(intervalForReps(50)).toBe(30)
  })
})

describe('mistakes feed the dashboard', () => {
  it('shows a weak point while unresolved and none after resolving', async () => {
    const { db } = createDb(':memory:')
    await addMistake(db, { skill: 'reading', label: 'Not Given', detail: 'Confused with False' }, NOW)
    let d = await loadDashboard(db, NOW)
    expect(d.weakPoints.source).toBe('real')
    expect(d.weakPoints.data?.[0]?.label).toBe('Not Given')
    await resolveMistake(db, 1)
    d = await loadDashboard(db, NOW)
    expect(d.weakPoints.source).toBe('none')
  })
})
