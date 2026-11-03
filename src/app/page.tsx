import { Card, Empty } from '@/components/Card'
import { StudyCalendar } from '@/components/StudyCalendar'
import { TrendChart } from '@/components/TrendChart'
import { bandGap, bandProgress } from '@/lib/band'
import { getDb } from '@/db/client'
import { loadDashboard } from '@/db/dashboard'
import { getDemoDashboard } from '@/lib/demo-data'
import type { DashboardData, Skill } from '@/lib/types'

// Render per request so dates, streaks and due counts are never frozen at build time.
export const dynamic = 'force-dynamic'

type BannerKind = 'demo' | 'empty' | 'real'

function bannerKind(d: DashboardData): BannerKind {
  const sources = [
    d.estimates, d.overall, d.trajectory, d.mocks, d.tasks, d.weakPoints,
    d.streakDays, d.studiedDates, d.vocabDue, d.mistakesDue, d.advice,
  ].map((s) => s.source)
  if (sources.includes('demo')) return 'demo'
  if (sources.every((s) => s === 'none')) return 'empty'
  return 'real'
}

const skillLabel: Record<Skill, string> = { listening: '听力', reading: '阅读', writing: '写作', speaking: '口语' }

// Phase 2: reads the learner's real records. Demo data appears only when explicitly requested via /?demo=1,
// and an empty database stays empty instead of silently falling back to demo values.
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const { demo } = await searchParams
  const d = demo === '1' ? getDemoDashboard() : await loadDashboard(getDb())
  const kind = bannerKind(d)
  const overall = d.overall.data
  const gap = bandGap(overall, d.targetBand)
  const pct = bandProgress(overall, d.targetBand)

  return (
    <div className="space-y-4">
      {kind === 'demo' && (
        <div className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'var(--demo)', color: 'var(--demo)' }}>
          当前页面显示的是 DEMO 演示数据，不是你的真实成绩。去掉地址栏里的 ?demo=1 即可查看真实记录。
        </div>
      )}
      {kind === 'empty' && (
        <div className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
          还没有任何学习记录，所以这里不显示分数。完成学习诊断或录入第一次练习后，驾驶舱会自动填充。想预览版面可访问 /?demo=1。
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title={`IELTS ${d.targetBand.toFixed(1)} 目标进度`} source={d.overall.source} className="lg:col-span-1">
          {overall === null ? (
            <Empty>还没有评估数据，先完成学习诊断。</Empty>
          ) : (
            <>
              <div className="text-4xl font-semibold">{overall.toFixed(1)}<span className="text-base font-normal" style={{ color: 'var(--muted)' }}> 估计值</span></div>
              <div className="mt-3 h-2 rounded-full" style={{ background: 'var(--line)' }}>
                <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: 'var(--brand)' }} />
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>距离目标还差约 {gap} 分 · 估计值，非官方成绩</p>
            </>
          )}
        </Card>

        <Card title="四科能力" source={d.estimates.source} className="lg:col-span-2">
          {d.estimates.data === null ? (
            <Empty>暂无四科数据。</Empty>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {d.estimates.data.map((e) => (
                <div key={e.skill} className="rounded-lg border p-3" style={{ borderColor: 'var(--line)' }}>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{skillLabel[e.skill]}</div>
                  <div className="text-2xl font-semibold">{e.band === null ? '—' : e.band.toFixed(1)}</div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{e.attempts} 次练习{e.trend ? ` · ${e.trend > 0 ? '+' : ''}${e.trend}` : ''}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="成绩变化曲线" source={d.trajectory.source} className="lg:col-span-2">
          {d.trajectory.data === null ? <Empty>完成模考后显示曲线。</Empty> : <TrendChart points={d.trajectory.data} target={d.targetBand} />}
        </Card>
        <Card title="连续学习" source={d.streakDays.source}>
          <div className="text-4xl font-semibold">{d.streakDays.data ?? 0}<span className="text-base font-normal" style={{ color: 'var(--muted)' }}> 天</span></div>
          <div className="mt-3">{d.studiedDates.data ? <StudyCalendar studied={d.studiedDates.data} /> : <Empty>暂无学习记录。</Empty>}</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="今日学习任务" source={d.tasks.source}>
          {d.tasks.data === null ? <Empty>还没有今日计划。</Empty> : (
            <ul className="space-y-2 text-sm">
              {d.tasks.data.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2">
                  <span className={t.done ? 'line-through opacity-60' : ''}>{t.title}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{t.minutes} 分钟</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="最近模考" source={d.mocks.source}>
          {d.mocks.data === null || d.mocks.data.length === 0 ? <Empty>还没有模考记录。</Empty> : (
            <ul className="space-y-2 text-sm">
              {d.mocks.data.map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <span>{m.date}</span>
                  <span>总分 {m.overall.toFixed(1)}（估）</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="当前薄弱项" source={d.weakPoints.source}>
          {d.weakPoints.data === null ? <Empty>暂无分析。</Empty> : (
            <ul className="space-y-2 text-sm">
              {d.weakPoints.data.map((w) => (
                <li key={w.label}><span className="font-medium">{skillLabel[w.skill]} · {w.label}</span><br /><span className="text-xs" style={{ color: 'var(--muted)' }}>{w.detail}</span></li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="AI 今日学习建议" source={d.advice.source} className="lg:col-span-1">
          {d.advice.data === null ? <Empty>暂无建议。</Empty> : <p className="text-sm">{d.advice.data}</p>}
        </Card>
        <Card title="待复习词汇" source={d.vocabDue.source}>
          <div className="text-3xl font-semibold">{d.vocabDue.data ?? 0}<span className="text-base font-normal" style={{ color: 'var(--muted)' }}> 个</span></div>
        </Card>
        <Card title="错题提醒" source={d.mistakesDue.source}>
          <div className="text-3xl font-semibold">{d.mistakesDue.data ?? 0}<span className="text-base font-normal" style={{ color: 'var(--muted)' }}> 道待复盘</span></div>
        </Card>
      </div>
    </div>
  )
}
