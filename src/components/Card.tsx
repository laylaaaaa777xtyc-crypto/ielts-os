import type { ReactNode } from 'react'
import type { Source } from '@/lib/types'

export function SourceBadge({ source }: { source: Source }) {
  if (source === 'real') return null
  const text = source === 'demo' ? 'DEMO 演示数据' : '暂无数据'
  const color = source === 'demo' ? 'var(--demo)' : 'var(--muted)'
  return (
    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium border" style={{ color, borderColor: color }}>
      {text}
    </span>
  )
}

export function Card({ title, source, children, className = '' }: { title: string; source?: Source; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border p-4 ${className}`} style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}>
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        {source ? <SourceBadge source={source} /> : null}
      </header>
      {children}
    </section>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm" style={{ color: 'var(--muted)' }}>{children}</p>
}
