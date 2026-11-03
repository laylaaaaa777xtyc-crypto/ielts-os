export type Source = 'real' | 'demo' | 'none'

export interface Sourced<T> {
  source: Source
  data: T | null
}

export type Skill = 'listening' | 'reading' | 'writing' | 'speaking'

export interface SkillEstimate {
  skill: Skill
  /** Estimated band, never an official score. null when there is no data. */
  band: number | null
  trend: number | null
  attempts: number
}

export interface BandPoint {
  date: string
  band: number
}

export interface MockResult {
  id: string
  date: string
  overall: number
  listening: number
  reading: number
  writing: number
  speaking: number
}

export interface PlanTask {
  id: string
  title: string
  skill: Skill | 'vocabulary' | 'review'
  minutes: number
  done: boolean
}

export interface WeakPoint {
  skill: Skill
  label: string
  detail: string
}

export interface DashboardData {
  targetBand: number
  estimates: Sourced<SkillEstimate[]>
  overall: Sourced<number>
  trajectory: Sourced<BandPoint[]>
  mocks: Sourced<MockResult[]>
  tasks: Sourced<PlanTask[]>
  weakPoints: Sourced<WeakPoint[]>
  streakDays: Sourced<number>
  studiedDates: Sourced<string[]>
  vocabDue: Sourced<number>
  mistakesDue: Sourced<number>
  advice: Sourced<string>
}
