import { create } from 'zustand'
import type { Machine, Route, Assignment, AppUser } from '../types'
import { APP_USERS } from '../types'

interface AppState {
  machines: Machine[]
  routes: Route[]
  assignments: Assignment[]
  selectedMachineId: number | null
  selectedRouteId: number | null
  currentUser: AppUser
  loading: boolean
  activeTab: 'routes' | 'machines'

  setMachines: (machines: Machine[]) => void
  setRoutes: (routes: Route[]) => void
  setAssignments: (assignments: Assignment[]) => void
  updateMachine: (id: number, data: Partial<Machine>) => void
  updateAssignment: (id: number, data: Partial<Assignment>) => void
  removeAssignment: (id: number) => void
  selectMachine: (id: number | null) => void
  selectRoute: (id: number | null) => void
  setCurrentUser: (user: AppUser) => void
  setLoading: (v: boolean) => void
  setActiveTab: (tab: 'routes' | 'machines') => void
}

export const useStore = create<AppState>((set) => ({
  machines: [],
  routes: [],
  assignments: [],
  selectedMachineId: null,
  selectedRouteId: null,
  currentUser: APP_USERS[0],
  loading: false,
  activeTab: 'routes',

  setMachines: (machines) => set({ machines }),
  setRoutes: (routes) => set({ routes }),
  setAssignments: (assignments) => set({ assignments }),

  updateMachine: (id, data) =>
    set((state) => ({
      machines: state.machines.map((m) => (m.id === id ? { ...m, ...data } : m)),
    })),

  updateAssignment: (id, data) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),

  removeAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
    })),

  selectMachine: (id) => set({ selectedMachineId: id }),
  selectRoute: (id) => set({ selectedRouteId: id }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setLoading: (loading) => set({ loading }),
  setActiveTab: (activeTab) => set({ activeTab }),
}))
