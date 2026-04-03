import api from './client'
import type { Assignment } from '../types'

export const getAssignments = (status?: string) =>
  api.get<Assignment[]>('/assignments', { params: status ? { status } : {} }).then(r => r.data)

export const computeAssignments = () =>
  api.post<Assignment[]>('/assignments/compute').then(r => r.data)

export const lockAssignment = (id: number, userName: string) =>
  api.post<Assignment>(`/assignments/${id}/lock`, { user_name: userName }).then(r => r.data)

export const unlockAssignment = (id: number, userName: string) =>
  api.post<Assignment>(`/assignments/${id}/unlock`, { user_name: userName }).then(r => r.data)

export const confirmAssignment = (id: number, userName: string, expectedVersion: number, notes?: string) =>
  api.post<Assignment>(`/assignments/${id}/confirm`, {
    user_name: userName,
    expected_version: expectedVersion,
    notes,
  }).then(r => r.data)

export const rejectAssignment = (id: number, userName: string, reason?: string) =>
  api.post<Assignment>(`/assignments/${id}/reject`, {
    user_name: userName,
    reason,
  }).then(r => r.data)
