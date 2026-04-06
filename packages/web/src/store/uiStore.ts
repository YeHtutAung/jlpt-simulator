import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ================================
// UI Store — theme, sidebar, toasts
// ================================

export type Theme = 'light' | 'dark'
export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id:       string
  message:  string
  type:     ToastType
  duration: number   // ms, 0 = sticky
}

interface UiStore {
  // ── Theme (persisted) ─────────────────────
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void

  // ── Sidebar ───────────────────────────────
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // ── Toasts ────────────────────────────────
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number) => string
  dismissToast: (id: string) => void
  clearToasts: () => void
}

let toastCounter = 0

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      // ── Theme ─────────────────────────────
      theme: 'light',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        get().setTheme(next)
      },

      // ── Sidebar ───────────────────────────
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

      // ── Toasts ────────────────────────────
      toasts: [],

      showToast: (message, type = 'info', duration = 3000) => {
        const id = `toast-${++toastCounter}`
        set(s => ({ toasts: [...s.toasts, { id, message, type, duration }] }))

        if (duration > 0) {
          setTimeout(() => get().dismissToast(id), duration)
        }

        return id
      },

      dismissToast: (id) => {
        set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
      },

      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name:    'jlpt-ui',
      partialize: (s) => ({ theme: s.theme }),   // only persist theme
      onRehydrateStorage: () => (state) => {
        // Apply persisted theme on load
        if (state) applyTheme(state.theme)
      },
    }
  )
)

// Apply theme to <html> element (Tailwind dark mode class strategy)
function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
