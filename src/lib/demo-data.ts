import type { DashboardData } from './types'

// DEMO DATA ONLY. Every value here is fabricated to preview the layout.
// It is not the learner's real performance and must always render with a Demo label.
export function getDemoDashboard(): DashboardData {
  const d = (offset: number) => {
    const t = new Date()
    t.setDate(t.getDate() - offset)
    return t.toISOString().slice(0, 10)
  }
  return {
    targetBand: 7.0,
    estimates: {
      source: 'demo',
      data: [
        { skill: 'listening', band: 6.5, trend: 0.5, attempts: 6 },
        { skill: 'reading', band: 6.5, trend: 0.0, attempts: 5 },
        { skill: 'writing', band: 5.5, trend: 0.5, attempts: 3 },
        { skill: 'speaking', band: 6.0, trend: 0.5, attempts: 2 },
      ],
    },
    overall: { source: 'demo', data: 6.0 },
    trajectory: {
      source: 'demo',
      data: [
        { date: d(35), band: 5.0 },
        { date: d(28), band: 5.5 },
        { date: d(21), band: 5.5 },
        { date: d(14), band: 6.0 },
        { date: d(7), band: 6.0 },
        { date: d(0), band: 6.0 },
      ],
    },
    mocks: {
      source: 'demo',
      data: [
        { id: 'demo-m2', date: d(14), overall: 6.0, listening: 6.5, reading: 6.5, writing: 5.5, speaking: 5.5 },
        { id: 'demo-m1', date: d(35), overall: 5.5, listening: 6.0, reading: 6.0, writing: 5.0, speaking: 5.0 },
      ],
    },
    tasks: {
      source: 'demo',
      data: [
        { id: 't1', title: 'Reading: True/False/Not Given drill', skill: 'reading', minutes: 25, done: true },
        { id: 't2', title: 'Writing Task 2 outline practice', skill: 'writing', minutes: 30, done: false },
        { id: 't3', title: 'Vocabulary review', skill: 'vocabulary', minutes: 15, done: false },
        { id: 't4', title: 'Mistake review', skill: 'review', minutes: 15, done: false },
      ],
    },
    weakPoints: {
      source: 'demo',
      data: [
        { skill: 'writing', label: 'Task Response', detail: 'Position is unclear in the introduction' },
        { skill: 'reading', label: 'Not Given', detail: 'Often confused with False' },
        { skill: 'speaking', label: 'Fluency', detail: 'Long pauses in Part 2' },
      ],
    },
    streakDays: { source: 'demo', data: 5 },
    studiedDates: { source: 'demo', data: [d(0), d(1), d(2), d(3), d(4), d(6), d(8), d(9), d(10), d(13)] },
    vocabDue: { source: 'demo', data: 23 },
    mistakesDue: { source: 'demo', data: 7 },
    advice: {
      source: 'demo',
      data: 'Demo suggestion: Writing is the biggest gap to 7.0, so do one Task 2 outline today.',
    },
  }
}
