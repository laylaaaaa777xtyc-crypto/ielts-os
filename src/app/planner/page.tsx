import { asc, eq } from 'drizzle-orm'
import { Card, Empty } from '@/components/Card'
import { getDb } from '@/db/client'
import { studyTasks } from '@/db/schema'
import { createTask, toggleTask } from './actions'

export const dynamic = 'force-dynamic'

const labels: Record<string, string> = {
  listening: '听力', reading: '阅读', writing: '写作', speaking: '口语', vocabulary: '词汇', review: '复盘',
}

export default async function PlannerPage() {
  const today = new Date().toISOString().slice(0, 10)
  const tasks = await getDb().select().from(studyTasks).where(eq(studyTasks.date, today)).orderBy(asc(studyTasks.id))
  const total = tasks.reduce((a, t) => a + t.minutes, 0)
  const done = tasks.filter((t) => t.done).reduce((a, t) => a + t.minutes, 0)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">学习计划</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={`今日任务 ${today}`} source={tasks.length ? 'real' : 'none'} className="lg:col-span-2">
          {tasks.length === 0 ? (
            <Empty>今天还没有任务，在右侧添加第一条。</Empty>
          ) : (
            <>
              <p className="mb-3 text-xs" style={{ color: 'var(--muted)' }}>已完成 {done} / {total} 分钟</p>
              <ul className="space-y-2 text-sm">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2">
                    <span className={t.done ? 'line-through opacity-60' : ''}>{labels[t.skill] ?? t.skill} · {t.title}</span>
                    <form action={toggleTask} className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{t.minutes} 分钟</span>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="done" value={String(!t.done)} />
                      <button type="submit" className="rounded border px-2 py-0.5 text-xs" style={{ borderColor: 'var(--line)' }}>{t.done ? '撤销' : '完成'}</button>
                    </form>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
        <Card title="添加任务">
          <form action={createTask} className="space-y-2 text-sm">
            <input type="hidden" name="date" value={today} />
            <input name="title" required maxLength={200} placeholder="任务名称" className="w-full rounded border px-2 py-1" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }} />
            <select name="skill" defaultValue="reading" className="w-full rounded border px-2 py-1" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
              {Object.entries(labels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
            </select>
            <input name="minutes" type="number" min={1} max={600} defaultValue={30} required className="w-full rounded border px-2 py-1" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }} />
            <button type="submit" className="w-full rounded px-2 py-1.5 text-white" style={{ background: 'var(--brand)' }}>添加</button>
          </form>
        </Card>
      </div>
    </div>
  )
}
