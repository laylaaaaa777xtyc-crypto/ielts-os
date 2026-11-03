import { describe, expect, it } from 'vitest'
import { createDb } from './client'
import { computeStreak, loadDashboard } from './dashboard'
import { attempts, mistakes, mockExams, studyDays, vocabItems } from './schema'

const NOW = new Date('2026-11-03T10:00:00.000Z')

describe('loadDashboard on an empty database', () => {
  it('reports none for every section and never invents data', async () => {
    const { db } = createDb(':memory:')
    const d = await loadDashboard(db, NOW)
    for (const key of [
      'estimates', 'overall', 'trajectory', 'mocks', 'tasks', 'weakPoints',
      'streakDays', 'studiedDates', 'vocabDue', 'mistakesDue', 'advice',
    ] as const) {
      expect(d[key].source, key).toBe('none')
      expect(d[key].data, key).toBeNull()
    }
    expect(d.targetBand).toBe(7)
  })
})

describe('loadDashboard with real records', () => {
  it('computes estimates, streak and due counts from rows', async () => {
    const { db } = createDb(':memory:')
    for (const skill of ['listening', 'reading', 'writing', 'speaking']) {
      await db.insert(attempts).values({ skill, kind: 'practice', band: 6, takenAt: '2026-11-01T08:00:00.000Z' })
    }
    await db.insert(mockExams).values({ takenAt: '2026-10-20T08:00:00.000Z', overall: 6, listening: 6.5, reading: 6.5, writing: 5.5, speaking: 5.5 })
    await db.insert(studyDays).values([
      { date: '2026-11-03', minutes: 30 },
      { date: '2026-11-02', minutes: 45 },
    ])
    await db.insert(vocabItems).values([
      { word: 'mitigate', nextReviewAt: '2026-11-02T00:00:00.000Z', createdAt: '2026-10-01T00:00:00.000Z' },
      { word: 'albeit', nextReviewAt: '2026-12-01T00:00:00.000Z', createdAt: '2026-10-01T00:00:00.000Z' },
    ])
    await db.insert(mistakes).values({ skill: 'reading', label: 'Not Given', nextReviewAt: '2026-11-02T00:00:00.000Z', createdAt: '2026-10-01T00:00:00.000Z' })

    const d = await loadDashboard(db, NOW)
    expect(d.estimates.source).toBe('real')
    expect(d.overall).toEqual({ source: 'real', data: 6 })
    expect(d.trajectory.data).toEqual([{ date: '2026-10-20', band: 6 }])
    expect(d.streakDays).toEqual({ source: 'real', data: 2 })
    expect(d.vocabDue).toEqual({ source: 'real', data: 1 })
    expect(d.mistakesDue).toEqual({ source: 'real', data: 1 })
    expect(d.weakPoints.data?.[0]?.label).toBe('Not Given')
  })

  it('does not report an overall band until all four skills have scores', async () => {
    const { db } = createDb(':memory:')
    await db.insert(attempts).values({ skill: 'reading', kind: 'practice', band: 6.5, takenAt: '2026-11-01T08:00:00.000Z' })
    const d = await loadDashboard(db, NOW)
    expect(d.estimates.source).toBe('real')
    expect(d.overall.source).toBe('none')
  })
})

describe('computeStreak', () => {
  it('keeps the streak alive when today is not yet studied', () => {
    expect(computeStreak(['2026-11-02', '2026-11-01'], NOW)).toBe(2)
  })
  it('breaks after a gap day', () => {
    expect(computeStreak(['2026-11-03', '2026-10-31'], NOW)).toBe(1)
  })
  it('is 0 with no recent study', () => {
    expect(computeStreak(['2026-10-20'], NOW)).toBe(0)
  })
})
