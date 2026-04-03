export type MachineStatus = 'available' | 'in_route' | 'maintenance'
export type MaintenanceStatus = 'available' | 'in_service' | 'blocked'
export type ReleasePermission = 'allowed' | 'forbidden'
export type RouteStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
export type AssignmentStatus = 'proposed' | 'confirmed' | 'rejected' | 'in_progress' | 'completed'
export type UserRole = 'logist' | 'mechanic' | 'dispatcher'

export interface Machine {
  id: number
  name: string
  plate_number: string
  status: MachineStatus
  capacity_tons: number
  gps_lat: number
  gps_lon: number
  accreditations: string[]
  restrictions: string[]
  maintenance_status: MaintenanceStatus
  release_permission: ReleasePermission
  forbidden_reason?: string
  forbidden_by?: string
  forbidden_at?: string
  version: number
  created_at: string
  updated_at: string
}

export interface Route {
  id: number
  name: string
  origin_name: string
  origin_lat: number
  origin_lon: number
  destination_name: string
  destination_lat: number
  destination_lon: number
  distance_km: number
  profit: number
  weight_tons: number
  required_accreditations: string[]
  priority: number
  status: RouteStatus
  source: string
  version: number
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: number
  machine_id: number
  route_id: number
  machine?: Machine
  route?: Route
  status: AssignmentStatus
  total_score: number
  distance_score: number
  profit_score: number
  restriction_score: number
  priority_score: number
  stability_score: number
  alternative_rank: number
  locked_by?: string
  locked_at?: string
  expires_at?: string
  version: number
  notes?: string
  created_at: string
  updated_at: string
}

export type AppUser = {
  name: string
  role: UserRole
}

export const APP_USERS: AppUser[] = [
  { name: 'Логист 1',  role: 'logist' },
  { name: 'Логист 2',  role: 'logist' },
  { name: 'Механик',   role: 'mechanic' },
  { name: 'Диспетчер', role: 'dispatcher' },
]
