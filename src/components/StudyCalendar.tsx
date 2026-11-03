export function StudyCalendar({ studied, weeks = 5 }: { studied: string[]; weeks?: number }) {
  const set = new Set(studied)
  const today = new Date()
  const days: { date: string; on: boolean }[] = []
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const t = new Date(today)
    t.setDate(today.getDate() - i)
    const date = t.toISOString().slice(0, 10)
    days.push({ date, on: set.has(date) })
  }
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => (
        <div
          key={d.date}
          title={d.date}
          className="aspect-square rounded-sm"
          style={{ background: d.on ? 'var(--brand)' : 'var(--line)', opacity: d.on ? 1 : 0.6 }}
        />
      ))}
    </div>
  )
}
