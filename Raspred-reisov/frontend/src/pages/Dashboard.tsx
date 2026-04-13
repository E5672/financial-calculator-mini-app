import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { getMachines } from '../api/machines'
import { getRoutes } from '../api/routes'
import { getAssignments, computeAssignments } from '../api/assignments'
import MapView from '../components/Map/MapView'
import RoutesTable from '../components/Table/RoutesTable'
import MachinesTable from '../components/Table/MachinesTable'
import AssignmentPanel from '../components/Assignment/AssignmentPanel'
import ConflictModal from '../components/Assignment/ConflictModal'
import { APP_USERS } from '../types'
import clsx from 'clsx'

export default function Dashboard() {
  const {
    setMachines, setRoutes, setAssignments,
    updateMachine, updateAssignment,
    machines, assignments,
    currentUser, setCurrentUser,
    loading, setLoading,
    activeTab, setActiveTab,
  } = useStore()

  const [wsConnected, setWsConnected] = useState(false)
  const [conflictMsg, setConflictMsg] = useState<string | null>(null)
  const [computing, setComputing] = useState(false)
  const [rightTab, setRightTab] = useState<'table' | 'proposals'>('table')
  const wsRef = useRef<WebSocket | null>(null)
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initial data load
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [m, r, a] = await Promise.all([getMachines(), getRoutes(), getAssignments()])
        setMachines(m)
        setRoutes(r)
        setAssignments(a)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // WebSocket
  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${protocol}://${window.location.host}/ws`)
      wsRef.current = ws

      ws.onopen = () => {
        setWsConnected(true)
        pingRef.current = setInterval(() => ws.send('ping'), 30000)
      }

      ws.onmessage = async (e) => {
        if (e.data === 'pong') return
        try {
          const msg = JSON.parse(e.data)
          handleWsEvent(msg)
        } catch {}
      }

      ws.onclose = () => {
        setWsConnected(false)
        if (pingRef.current) clearInterval(pingRef.current)
        reconnectRef.current = setTimeout(connect, 3000)
      }
    }

    async function handleWsEvent(msg: any) {
      switch (msg.event) {
        case 'machine_updated': {
          updateMachine(msg.machine_id, msg.data)
          break
        }
        case 'assignments_computed': {
          const fresh = await getAssignments()
          setAssignments(fresh)
          break
        }
        case 'assignment_confirmed':
        case 'assignment_rejected': {
          const fresh = await getAssignments()
          setAssignments(fresh)
          const freshRoutes = await getRoutes()
          setRoutes(freshRoutes)
          const freshMachines = await getMachines()
          setMachines(freshMachines)
          break
        }
        case 'assignment_locked': {
          updateAssignment(msg.assignment_id, {
            locked_by: msg.locked_by,
            expires_at: msg.expires_at,
          })
          break
        }
        case 'assignment_unlocked': {
          updateAssignment(msg.assignment_id, {
            locked_by: undefined,
            expires_at: undefined,
          })
          break
        }
        case 'route_created':
        case 'routes_imported':
        case 'route_deleted': {
          const freshRoutes = await getRoutes()
          setRoutes(freshRoutes)
          break
        }
      }
    }

    connect()
    return () => {
      if (pingRef.current) clearInterval(pingRef.current)
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [])

  async function handleCompute() {
    setComputing(true)
    try {
      const result = await computeAssignments()
      setAssignments(result)
      setRightTab('proposals')
    } catch (e: any) {
      console.error(e)
    } finally {
      setComputing(false)
    }
  }

  const proposedCount = assignments.filter((a) => a.status === 'proposed' && a.alternative_rank === 0).length
  const confirmedCount = assignments.filter((a) => a.status === 'confirmed').length
  const availableMachines = machines.filter((m) => m.status === 'available' && m.release_permission === 'allowed').length

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-4 py-2.5 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-sm font-bold">Л</div>
          <span className="font-semibold text-white">Логистический помощник</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 ml-4">
          <Stat label="Предложено" value={proposedCount} color="violet" />
          <Stat label="Подтверждено" value={confirmedCount} color="emerald" />
          <Stat label="Свободно машин" value={availableMachines} color="blue" />
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* WS status */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className={clsx('w-1.5 h-1.5 rounded-full', wsConnected ? 'bg-emerald-500' : 'bg-red-500')} />
            {wsConnected ? 'Live' : 'Offline'}
          </div>

          {/* User selector */}
          <select
            value={currentUser.name}
            onChange={(e) => {
              const u = APP_USERS.find((u) => u.name === e.target.value)
              if (u) setCurrentUser(u)
            }}
            className="bg-slate-700 border border-slate-600 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {APP_USERS.map((u) => (
              <option key={u.name} value={u.name}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          {/* Compute button */}
          <button
            onClick={handleCompute}
            disabled={computing || loading}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
          >
            {computing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Считаю...
              </>
            ) : (
              '⚡ Пересчитать'
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map — left 60% */}
        <div className="flex-1 min-w-0 relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center z-10">
              <div className="text-slate-300 text-sm">Загрузка данных...</div>
            </div>
          )}
          <MapView />
        </div>

        {/* Right panel — 40% */}
        <div className="w-[42%] flex flex-col bg-slate-800 border-l border-slate-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-700 flex-shrink-0">
            {(['routes', 'machines'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setRightTab('table') }}
                className={clsx(
                  'px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
                  activeTab === tab
                    ? 'text-blue-400 border-blue-500 bg-slate-700/30'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                )}
              >
                {tab === 'routes' ? '📦 Маршруты' : '🚛 Машины'}
              </button>
            ))}
            {activeTab === 'routes' && (
              <button
                onClick={() => setRightTab(rightTab === 'table' ? 'proposals' : 'table')}
                className={clsx(
                  'ml-auto px-4 py-2.5 text-xs font-medium transition-colors border-b-2',
                  rightTab === 'proposals'
                    ? 'text-violet-400 border-violet-500'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                )}
              >
                {rightTab === 'proposals' ? '← Таблица' : '⚡ Предложения'}
                {proposedCount > 0 && rightTab !== 'proposals' && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-violet-600 text-white text-xs rounded-full">
                    {proposedCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'routes' && rightTab === 'table' && <RoutesTable onConflict={setConflictMsg} />}
            {activeTab === 'routes' && rightTab === 'proposals' && <AssignmentPanel />}
            {activeTab === 'machines' && <MachinesTable />}
          </div>
        </div>
      </div>

      {conflictMsg && (
        <ConflictModal message={conflictMsg} onClose={() => setConflictMsg(null)} />
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
  }
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className={`font-bold text-base ${colors[color]}`}>{value}</span>
      <span className="text-slate-400">{label}</span>
    </div>
  )
}
