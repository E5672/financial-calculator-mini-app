import type { Assignment } from '../../types'

interface Props {
  assignment: Assignment
  compact?: boolean
}

const SEGMENTS = [
  { key: 'distance_score',    label: 'Расстояние', weight: 0.40, color: 'bg-blue-500' },
  { key: 'profit_score',      label: 'Прибыль',    weight: 0.25, color: 'bg-emerald-500' },
  { key: 'restriction_score', label: 'Ограничения', weight: 0.20, color: 'bg-violet-500' },
  { key: 'priority_score',    label: 'Приоритет',  weight: 0.10, color: 'bg-orange-500' },
  { key: 'stability_score',   label: 'Стабильность', weight: 0.05, color: 'bg-pink-500' },
] as const

export default function ScoreBar({ assignment, compact = false }: Props) {
  const total = Math.round(assignment.total_score * 100)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            style={{ width: `${total}%` }}
          />
        </div>
        <span className="text-xs text-slate-300 w-8 text-right font-mono">{total}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300 font-medium">Итоговый score</span>
        <span className="text-lg font-bold text-white">{total}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
        {SEGMENTS.map((seg) => {
          const val = assignment[seg.key as keyof Assignment] as number
          const width = val * seg.weight * 100
          return (
            <div
              key={seg.key}
              className={`${seg.color} h-full`}
              style={{ width: `${width}%` }}
              title={`${seg.label}: ${Math.round(val * 100)}%`}
            />
          )
        })}
      </div>
      <div className="space-y-1">
        {SEGMENTS.map((seg) => {
          const val = assignment[seg.key as keyof Assignment] as number
          const pct = Math.round(val * 100)
          return (
            <div key={seg.key} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${seg.color} flex-shrink-0`} />
              <span className="text-slate-400 w-24">{seg.label}</span>
              <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className={`${seg.color} h-full`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-slate-300 w-8 text-right font-mono">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
