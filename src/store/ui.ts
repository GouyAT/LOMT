import { create } from 'zustand'

export type Stage = 'opening' | 'login' | 'game'
export type NarrativeMode = 'narrow' | 'read' | 'explore'
export type ViewMode = 'pc' | 'mobile'

export interface ToastItem {
  id: number
  kind: 'success' | 'warning' | 'danger' | 'info'
  title: string
  description?: string
}

interface UIState {
  stage: Stage
  viewMode: ViewMode
  narrativeMode: NarrativeMode
  activeOverlay: string | null
  toasts: ToastItem[]
  curtainOpen: boolean
  enterGame: () => void
  beginCurtain: () => void
  setStage: (s: Stage) => void
  setViewMode: (v: ViewMode) => void
  setNarrativeMode: (m: NarrativeMode) => void
  openOverlay: (name: string) => void
  closeOverlay: () => void
  pushToast: (t: Omit<ToastItem, 'id'>) => void
  dismissToast: (id: number) => void
}

let toastSeq = 0

export const useUI = create<UIState>((set) => ({
  stage: 'opening',
  viewMode: 'pc',
  narrativeMode: 'narrow',
  activeOverlay: null,
  toasts: [],
  curtainOpen: false,
  beginCurtain: () => set({ curtainOpen: true }),
  enterGame: () => set({ stage: 'game', activeOverlay: null }),
  setStage: (s) => set({ stage: s }),
  setViewMode: (v) => set({ viewMode: v, activeOverlay: null }),
  setNarrativeMode: (m) => set({ narrativeMode: m }),
  openOverlay: (name) => set({ activeOverlay: name }),
  closeOverlay: () => set({ activeOverlay: null }),
  pushToast: (t) => {
    const id = ++toastSeq
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }))
    }, 4200)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))
