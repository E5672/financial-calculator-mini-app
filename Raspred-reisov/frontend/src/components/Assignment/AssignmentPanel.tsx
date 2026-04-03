import { useStore } from '../../store/useStore'
import ScoreBar from '../UI/ScoreBar'
import StatusBadge from '../UI/StatusBadge'
import type { Assignment } from '../../types'

export default function AssignmentPanel() {
  const { assignments, machines, routes } = useStore()

  const proposed = assignments.filter((a) => a.status === 'proposed')
  const confirmed = assignments.filter((a) => a.status === 'confirmed')

  const grouped = routes.reduce<Record<number, Assignment[]>>((acc, route) => {
    const routeAssignments = proposed
      .filter((a) => a.route_id === route.id)
      .sort((a, b) => a.alternative_rank - b.alternative_rank)
    if (routeAssignments.length > 0) {
      acc[route.id] = routeAssignments
    }
    return acc
  }, {})

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Предложено" value={proposed.filter((a) => a.alternative_rank === 0).length} color="violet" />
        <StatCard label="Подтверждено" value={confirmed.length} color="emerald" />
        <StatCard label="Машин свободно" value={machines.filter((m) => m.status === 'available' && m.release_permission === 'allowed').length} color="blue" />
      </div>

      {/* Proposals grouped by route */}
      {Object.entries(grouped).map(([routeIdStr, routeAssignments]) => {
        const routeId = parseInt(routeIdStr)
        const route = routes.find((r) => r.id === routeId)
        if (!route) return null

        const [main, ...alternatives] = routeAssignments

        return (
          <div key={routeId} className="bg-slate-700/40 rounded-lg p-3 border border-slate-600/50">
            <div className="text-white font-medium text-sm mb-1">{route.name}</div>
            <div className="text-xs text-slate-400 mb-3">
              {route.distance_km} км · {route.profit.toLocaleString('ru-RU')} ₽ · {route.weight_tons} т
            </div>

            {/* Main proposal */}
            {main?.machine && (
              <div className="mb-2">
                <div className="text-xs text-slate-400 mb-1">Основное предложение:</div>
                <div className="bg-slate-800 rounded p-2.5 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-white text-sm font-medium">{main.machine.name}</div>
                      <div className="text-slate-400 text-xs">{main.machine.plate_number} · {main.machine.capacity_tons} т</div>
                    </div>
                    <StatusBadge status={main.status} />
                  </div>
                  <ScoreBar assignment={main} />
                </div>
              </div>
            )}

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <div>
                <div className="text-xs text-slate-400 mb-1">Альтернативы:</div>
                <div className="space-y-1.5">
                  {alternatives.map((alt) => alt.machine && (
                    <div key={alt.id} className="bg-slate-800/60 rounded p-2 border border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-slate-200 text-xs font-medium">{alt.machine.name}</div>
                          <div className="text-slate-500 text-xs">{alt.machine.plate_number}</div>
                        </div>
                        <span className="text-slate-400 text-xs font-mono">
                          {Math.round(alt.total_score * 100)}%
                        </span>
                      </div>
                      <div className="mt-1">
                        <ScoreBar assignment={alt} compact />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {Object.keys(grouped).length === 0 && (
        <div className="text-center text-slate-500 text-sm py-8">
          Нет активных предложений.<br />
          Нажмите «Пересчитать» для запуска алгоритма.
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
  }
  return (
    <div className="bg-slate-700/40 rounded-lg p-2.5 text-center border border-slate-600/30">
      <div className={`text-2xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}
