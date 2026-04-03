import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useStore } from '../../store/useStore'
import type { Machine, Assignment } from '../../types'

// Fix Leaflet default icon path issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;
      transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })

const MACHINE_ICONS: Record<string, ReturnType<typeof makeIcon>> = {
  available: makeIcon('#10b981'),
  in_route:  makeIcon('#3b82f6'),
  maintenance: makeIcon('#f97316'),
  forbidden: makeIcon('#ef4444'),
}

function getMachineIcon(machine: Machine) {
  if (machine.release_permission === 'forbidden') return MACHINE_ICONS.forbidden
  return MACHINE_ICONS[machine.status] ?? MACHINE_ICONS.available
}

const PRIORITY_COLORS: Record<number, string> = {
  5: '#ef4444',
  4: '#f97316',
  3: '#eab308',
  2: '#3b82f6',
  1: '#6b7280',
}

export default function MapView() {
  const { machines, assignments, selectMachine } = useStore()

  // Only show confirmed/proposed assignments on map
  const visibleAssignments = assignments.filter(
    (a) => a.status === 'confirmed' || (a.status === 'proposed' && a.alternative_rank === 0)
  )

  return (
    <MapContainer
      center={[55.75, 37.62]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route lines */}
      {visibleAssignments.map((a) => {
        if (!a.route) return null
        const color = PRIORITY_COLORS[a.route.priority] ?? '#6b7280'
        const opacity = a.status === 'confirmed' ? 0.9 : 0.4
        return (
          <Polyline
            key={`line-${a.id}`}
            positions={[
              [a.route.origin_lat, a.route.origin_lon],
              [a.route.destination_lat, a.route.destination_lon],
            ]}
            color={color}
            weight={a.status === 'confirmed' ? 3 : 2}
            opacity={opacity}
            dashArray={a.status === 'proposed' ? '6 4' : undefined}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{a.route.name}</div>
                <div className="text-gray-600">{a.route.origin_name} → {a.route.destination_name}</div>
                <div>{a.route.distance_km} км · {a.route.profit.toLocaleString('ru-RU')} ₽</div>
              </div>
            </Popup>
          </Polyline>
        )
      })}

      {/* Machine markers */}
      {machines.map((machine) => (
        <Marker
          key={machine.id}
          position={[machine.gps_lat, machine.gps_lon]}
          icon={getMachineIcon(machine)}
          eventHandlers={{ click: () => selectMachine(machine.id) }}
        >
          <Popup>
            <MachinePopup machine={machine} assignments={visibleAssignments} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

function MachinePopup({ machine, assignments }: { machine: Machine; assignments: Assignment[] }) {
  const current = assignments.find((a) => a.machine_id === machine.id && a.status === 'confirmed')
  const proposed = assignments.find(
    (a) => a.machine_id === machine.id && a.status === 'proposed' && a.alternative_rank === 0
  )

  const statusLabel: Record<string, string> = {
    available: '🟢 Свободна',
    in_route: '🔵 В рейсе',
    maintenance: '🟠 ТО',
  }

  return (
    <div style={{ minWidth: 200 }} className="text-sm">
      <div className="font-bold text-base mb-1">{machine.name}</div>
      <div className="text-gray-500 mb-2">{machine.plate_number}</div>
      <div className="mb-1">{statusLabel[machine.status] ?? machine.status}</div>
      <div className="text-gray-600">Грузоподъёмность: {machine.capacity_tons} т</div>
      {machine.release_permission === 'forbidden' && (
        <div className="mt-2 text-red-600 font-medium">
          🚫 Запрет выпуска: {machine.forbidden_reason}
        </div>
      )}
      {current?.route && (
        <div className="mt-2 border-t pt-2">
          <div className="text-xs text-gray-500">Текущий рейс:</div>
          <div className="font-medium">{current.route.name}</div>
        </div>
      )}
      {proposed?.route && !current && (
        <div className="mt-2 border-t pt-2">
          <div className="text-xs text-gray-500">Предложен рейс:</div>
          <div className="font-medium">{proposed.route.name}</div>
          <div className="text-gray-500">{Math.round(proposed.total_score * 100)}% score</div>
        </div>
      )}
    </div>
  )
}
