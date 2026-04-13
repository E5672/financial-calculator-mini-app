import clsx from 'clsx'
import type { MachineStatus, AssignmentStatus, RouteStatus } from '../../types'

const MACHINE_LABELS: Record<MachineStatus, string> = {
  available: 'Свободна',
  in_route: 'В рейсе',
  maintenance: 'ТО',
}

const ASSIGNMENT_LABELS: Record<AssignmentStatus, string> = {
  proposed: 'Предложено',
  confirmed: 'Подтверждено',
  rejected: 'Отклонено',
  in_progress: 'В процессе',
  completed: 'Завершено',
}

const ROUTE_LABELS: Record<RouteStatus, string> = {
  pending: 'Требует решения',
  assigned: 'Назначен',
  in_progress: 'В пути',
  completed: 'Завершён',
  cancelled: 'Отменён',
}

type Status = MachineStatus | AssignmentStatus | RouteStatus

const COLOR_MAP: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  in_route: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  maintenance: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  proposed: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  confirmed: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  rejected: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  in_progress: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  completed: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  assigned: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
}

const ALL_LABELS: Record<string, string> = {
  ...MACHINE_LABELS,
  ...ASSIGNMENT_LABELS,
  ...ROUTE_LABELS,
}

export default function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        COLOR_MAP[status] ?? 'bg-slate-600/20 text-slate-400',
        className
      )}
    >
      {ALL_LABELS[status] ?? status}
    </span>
  )
}
