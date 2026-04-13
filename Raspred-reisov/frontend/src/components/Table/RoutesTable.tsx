import { useState } from 'react'
import clsx from 'clsx'
import { useStore } from '../../store/useStore'
import StatusBadge from '../UI/StatusBadge'
import ScoreBar from '../UI/ScoreBar'
import type { Assignment, Route } from '../../types'
import { confirmAssignment, rejectAssignment, lockAssignment } from '../../api/assignments'
import { deleteRoute } from '../../api/routes'

type SortKey = 'priority' | 'profit' | 'distance_km' | 'name'

export default function RoutesTable({ onConflict }: { onConflict?: (msg: string) => void }) {
  const { routes, assignments, currentUser, setRoutes, updateAssignment, removeAssignment, selectMachine, selectedMachineId } = useStore()
  const [sortKey, setSortKey] = useState<SortKey>('priority')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [confirming, setConfirming] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const mainProposals = assignments.filter((a) => a.alternative_rank === 0)

  const filteredRoutes = routes
    .filter((r) => filterStatus === 'all' || r.status === filterStatus)
    .sort((a, b) => {
      let va: number | string = a[sortKey as keyof Route] as number | string
      let vb: number | string = b[sortKey as keyof Route] as number | string
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      return sortDir === 'desc' ? (va < vb ? 1 : -1) : (va > vb ? 1 : -1)
    })

  async function handleConfirm(assignment: Assignment) {
    if (!assignment) return
    setConfirming(assignment.id)
    setError(null)
    try {
      // Lock first
      await lockAssignment(assignment.id, currentUser.name)
      // Then confirm
      const updated = await confirmAssignment(
        assignment.id, currentUser.name, assignment.version
      )
      updateAssignment(updated.id, updated)
    } catch (e: any) {
      const msg = e.response?.data?.detail ?? 'Ошибка подтверждения'
      if (e.response?.status === 409) {
        onConflict?.(msg)
      } else {
        setError(msg)
      }
    } finally {
      setConfirming(null)
    }
  }

  async function handleReject(assignment: Assignment) {
    setError(null)
    try {
      const updated = await rejectAssignment(assignment.id, currentUser.name)
      updateAssignment(updated.id, updated)
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Ошибка отклонения')
    }
  }

  async function handleDeleteRoute(routeId: number) {
    try {
      await deleteRoute(routeId)
      setRoutes(routes.filter((r) => r.id !== routeId))
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Ошибка удаления')
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 text-slate-500">
      {sortKey === col ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
    </span>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex items-center gap-2 p-3 border-b border-slate-700">
        <span className="text-xs text-slate-400">Статус:</span>
        {['all', 'pending', 'assigned', 'in_progress'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={clsx(
              'px-2.5 py-1 rounded text-xs transition-colors',
              filterStatus === s
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
          >
            {s === 'all' ? 'Все' : s === 'pending' ? 'Ожидают' : s === 'assigned' ? 'Назначены' : 'В пути'}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500">{filteredRoutes.length} маршрутов</span>
      </div>

      {error && (
        <div className="mx-3 mt-2 p-2 bg-red-900/40 border border-red-700 rounded text-xs text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800 z-10">
            <tr className="text-left text-slate-400 text-xs">
              <th
                className="px-3 py-2 cursor-pointer hover:text-white"
                onClick={() => toggleSort('name')}
              >
                Маршрут <SortIcon col="name" />
              </th>
              <th
                className="px-3 py-2 cursor-pointer hover:text-white"
                onClick={() => toggleSort('distance_km')}
              >
                Км <SortIcon col="distance_km" />
              </th>
              <th
                className="px-3 py-2 cursor-pointer hover:text-white"
                onClick={() => toggleSort('profit')}
              >
                Прибыль <SortIcon col="profit" />
              </th>
              <th
                className="px-3 py-2 cursor-pointer hover:text-white"
                onClick={() => toggleSort('priority')}
              >
                П-т <SortIcon col="priority" />
              </th>
              <th className="px-3 py-2">Машина / Score</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredRoutes.map((route) => {
              const proposal = mainProposals.find((a) => a.route_id === route.id)
              const isConfirming = proposal && confirming === proposal.id
              const isLocked = proposal?.locked_by && proposal.locked_by !== currentUser.name

              return (
                <tr
                  key={route.id}
                  onClick={() => proposal?.machine_id && selectMachine(proposal.machine_id)}
                  className={clsx(
                    "transition-colors group cursor-pointer",
                    proposal?.machine_id === selectedMachineId
                      ? "bg-blue-900/40"
                      : "hover:bg-slate-700/30"
                  )}
                >
                
                  {/* Route name */}
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-white">{route.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {route.origin_name.split(' ').slice(-1)[0]} → {route.destination_name.split(' ').slice(-1)[0]}
                    </div>
                    <div className="text-xs text-slate-500">{route.weight_tons} т</div>
                  </td>

                  {/* Distance */}
                  <td className="px-3 py-2.5 text-slate-300 font-mono text-xs">
                    {route.distance_km}
                  </td>

                  {/* Profit */}
                  <td className="px-3 py-2.5">
                    <span className="text-emerald-400 font-medium text-xs">
                      {route.profit.toLocaleString('ru-RU')} ₽
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-3 py-2.5">
                    <PriorityDots value={route.priority} />
                  </td>

                  {/* Machine + Score */}
                  <td className="px-3 py-2.5 min-w-[160px]">
                    {proposal?.machine ? (
                      <div>
                        <div className="text-white text-xs font-medium">{proposal.machine.name}</div>
                        <div className="text-slate-400 text-xs">{proposal.machine.plate_number}</div>
                        <div className="mt-1">
                          <ScoreBar assignment={proposal} compact />
                        </div>
                        {isLocked && (
                          <div className="text-xs text-yellow-400 mt-0.5">
                            🔒 {proposal.locked_by}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">
                        {route.status === 'assigned' ? 'Назначено' : '—'}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <StatusBadge status={route.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    {proposal && proposal.status === 'proposed' && !isLocked && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleConfirm(proposal) }}
                          disabled={!!isConfirming}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs rounded transition-colors"
                        >
                          {isConfirming ? '...' : '✓'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReject(proposal) }}
                          className="px-2 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {proposal && proposal.status === 'proposed' && isLocked && (
                      <span className="text-xs text-yellow-400">Занято</span>
                    )}
                    {route.status === 'pending' && !proposal && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRoute(route.id) }}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}

            {filteredRoutes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500 text-sm">
                  Маршруты не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PriorityDots({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            i <= value
              ? value >= 4
                ? 'bg-red-500'
                : value >= 3
                  ? 'bg-orange-500'
                  : 'bg-blue-500'
              : 'bg-slate-700'
          )}
        />
      ))}
    </div>
  )
}
