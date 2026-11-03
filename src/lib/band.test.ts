import { describe, expect, it } from 'vitest'
import { bandGap, bandProgress } from './band'

describe('bandGap', () => {
  it('returns null when there is no estimate', () => {
    expect(bandGap(null, 7)).toBeNull()
  })
  it('rounds to the nearest half band', () => {
    expect(bandGap(6.0, 7)).toBe(1)
    expect(bandGap(6.5, 7)).toBe(0.5)
  })
  it('never goes negative', () => {
    expect(bandGap(7.5, 7)).toBe(0)
  })
})

describe('bandProgress', () => {
  it('is 0 without data', () => {
    expect(bandProgress(null, 7)).toBe(0)
  })
  it('is 100 at or above target', () => {
    expect(bandProgress(7, 7)).toBe(100)
    expect(bandProgress(8, 7)).toBe(100)
  })
  it('scales between floor and target', () => {
    expect(bandProgress(5.5, 7)).toBe(50)
  })
})
