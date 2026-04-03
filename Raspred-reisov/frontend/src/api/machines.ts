import api from './client'
import type { Machine } from '../types'

export const getMachines = () =>
  api.get<Machine[]>('/machines').then(r => r.data)

export const getMachine = (id: number) =>
  api.get<Machine>(`/machines/${id}`).then(r => r.data)

export const updateMachine = (id: number, data: Partial<Machine>) =>
  api.put<Machine>(`/machines/${id}`, data).then(r => r.data)

export const setReleasePermission = (
  id: number,
  permission: 'allowed' | 'forbidden',
  reason: string,
  setBy: string
) =>
  api.post<Machine>(`/machines/${id}/release-permission`, {
    permission,
    reason,
    set_by: setBy,
  }).then(r => r.data)
