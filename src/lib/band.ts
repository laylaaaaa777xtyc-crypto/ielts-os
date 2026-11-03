/** Gap between the current estimate and the target, rounded to the nearest 0.5. */
export function bandGap(current: number | null, target: number): number | null {
  if (current === null) return null
  return Math.max(0, Math.round((target - current) * 2) / 2)
}

/** Progress toward the target as a 0-100 percentage, with a floor of band 4.0. */
export function bandProgress(current: number | null, target: number, floor = 4): number {
  if (current === null) return 0
  const pct = ((current - floor) / (target - floor)) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
}
