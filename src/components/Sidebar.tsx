import Link from 'next/link'
import { LayoutDashboard, Stethoscope, Headphones, BookOpen, PenLine, Mic, Languages, AlertCircle, FileCheck2, CalendarCheck, Settings } from 'lucide-react'

const items = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/diagnostic', label: '学习诊断', icon: Stethoscope },
  { href: '/listening', label: '听力', icon: Headphones },
  { href: '/reading', label: '阅读', icon: BookOpen },
  { href: '/writing', label: '写作', icon: PenLine },
  { href: '/speaking', label: '口语', icon: Mic },
  { href: '/vocabulary', label: '词汇', icon: Languages },
  { href: '/mistakes', label: '错题本', icon: AlertCircle },
  { href: '/mock', label: '模考与报告', icon: FileCheck2 },
  { href: '/planner', label: '学习计划', icon: CalendarCheck },
  { href: '/settings', label: '设置', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col gap-1 border-r p-4" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
      <div className="px-2 pb-4">
        <div className="text-lg font-semibold" style={{ color: 'var(--brand)' }}>IELTS OS</div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>目标 7.0 · 本地运行</div>
      </div>
      {items.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:opacity-80">
          <Icon size={16} />
          {label}
        </Link>
      ))}
    </aside>
  )
}
