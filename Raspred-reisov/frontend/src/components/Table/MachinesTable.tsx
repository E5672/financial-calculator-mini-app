import { useStore } from '../../store/useStore'
import StatusBadge from '../UI/StatusBadge'
import type { Machine } from '../../types'
import { setReleasePermission } from '../../api/machines'
import { useState } from 'react'

export default function MachinesTable() {
  const { machines, assignments, currentUser, updateMachine } = useStore()
  const [error, setError] = useState<string | null>(null)

  const confirmedAssignments = assignments.filter((a) => a.status === 'confirmed')

  async function toggleBlock(machine: Machine) {
    if (currentUser.role !== 'mechanic') {
      setError('Изменить разрешение выпуска может только Механик')
      return
    }
    setError(null)
    try {
      const newPerm = machine.release_permission === 'allowed' ? 'forbidden' : 'allowed'
      const updated = await setReleasePermission(
        machine.id,
        newPerm,
        newPerm === 'forbidden' ? 'Техническая неисправность' : '',
        currentUser.name
      )
      updateMachine(updated.id, updated)
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Ошибка')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700">
        <span className="text-xs text-slate-400">{machines.length} машин</span>
        {currentUser.role !== 'mechanic' && (
          <span className="text-xs text-slate-500">Только Механик может изменять доступность</span>
        )}
      </div>

      {error && (
        <div className="mx-3 mt-2 p-2 bg-red-900/40 border border-red-700 rounded text-xs text-red-300">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-400">✕</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800">
            <tr className="text-left text-slate-400 text-xs">
              <th className="px-3 py-2">Машина</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Т</th>
              <th className="px-3 py-2">Акк.</th>
              <th className="px-3 py-2">Рейс</th>
              <th className="px-3 py-2">Выпуск</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {machines.map((machine) => {
              const currentRoute = confirmedAssignments.find(
                (a) => a.machine_id === machine.id
              )?.route

              return (
                <tr key={machine.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-white">{machine.name}</div>
                    <div className="text-xs text-slate-400">{machine.plate_number}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={machine.status} />
                  </td>
                  <td className="px-3 py-2.5 text-slate-300 text-xs font-mono">
                    {machine.capacity_tons}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {(machine.accreditations ?? []).map((a) => (
                        <span
                          key={a}
                          className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-xs rounded"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {currentRoute ? (
                      <div>
                        <div className="text-xs text-white">{currentRoute.name}</div>
                        <div className="text-xs text-slate-500">{currentRoute.distance_km} км</div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {machine.release_permission === 'forbidden' ? (
                      <div>
                        <span className="text-red-400 text-xs font-medium">🚫 Запрет</span>
                        {machine.forbidden_reason && (
                          <div className="text-xs text-slate-500 mt-0.5">{machine.forbidden_reason}</div>
                        )}
                        {currentUser.role === 'mechanic' && (
                          <button
                            onClick={() => toggleBlock(machine)}
                            className="mt-1 px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs rounded"
                          >
                            Снять
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-xs">✓ Разрешён</span>
                        {currentUser.role === 'mechanic' && (
                          <button
                            onClick={() => toggleBlock(machine)}
                            className="px-2 py-0.5 bg-red-800 hover:bg-red-700 text-white text-xs rounded"
                          >
                            Запрет
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
