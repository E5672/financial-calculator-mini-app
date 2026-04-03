import api from './client'
import type { Route } from '../types'

export const getRoutes = (status?: string) =>
  api.get<Route[]>('/routes', { params: status ? { status } : {} }).then(r => r.data)

export const deleteRoute = (id: number) =>
  api.delete(`/routes/${id}`)
