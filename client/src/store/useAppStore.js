import { create } from 'zustand'

export const useAppStore = create((set) => ({
  selectedProject: null,
  sidebarCollapsed: false,

  setSelectedProject: (project) => set({ selectedProject: project }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}))
