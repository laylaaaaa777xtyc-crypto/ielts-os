'use client'

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { BandPoint } from '@/lib/types'

export function TrendChart({ points, target }: { points: BandPoint[]; target: number }) {
  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis domain={[4, 9]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <ReferenceLine y={target} stroke="var(--brand)" strokeDasharray="4 4" label={{ value: `目标 ${target}`, fontSize: 11, fill: 'var(--brand)' }} />
          <Line type="monotone" dataKey="band" stroke="var(--brand)" strokeWidth={2} dot={{ r: 3 }} name="估计 Band" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
