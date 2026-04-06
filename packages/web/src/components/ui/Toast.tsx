import { useEffect } from 'react'
import { useUiStore, type Toast, type ToastType } from '@/store/uiStore'

// ================================
// Toast notification system
// Renders in a portal at bottom-right.
// Auto-dismisses via uiStore.showToast(msg, type, duration).
// ================================

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-green-50', border: 'border-green-200', icon: '✓' },
  error:   { bg: 'bg-red-50',   border: 'border-red-200',   icon: '✕' },
  info:    { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: 'ℹ' },
}

const typeTextColor: Record<ToastType, string> = {
  success: 'text-green-800',
  error:   'text-red-800',
  info:    'text-blue-800',
}

// ── Individual toast ──────────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useUiStore(s => s.dismissToast)
  const styles = typeStyles[toast.type]
  const textColor = typeTextColor[toast.type]

  return (
    <div
      className={[
        'flex items-start gap-3 w-80 px-4 py-3 rounded-xl shadow-lg border',
        'animate-in slide-in-from-right-4 fade-in duration-200',
        styles.bg,
        styles.border,
      ].join(' ')}
      role="alert"
      aria-live="polite"
    >
      <span className={`text-sm font-bold mt-0.5 shrink-0 ${textColor}`}>
        {styles.icon}
      </span>
      <p className={`text-sm font-sans flex-1 ${textColor}`}>{toast.message}</p>
      <button
        onClick={() => dismissToast(toast.id)}
        className={`text-xs ${textColor} opacity-60 hover:opacity-100 shrink-0 mt-0.5`}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

// ── Toast container (fixed bottom-right) ─────────────────

export function ToastContainer() {
  const toasts = useUiStore(s => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  )
}

// ── Hook: easy toast calls ────────────────────────────────

export function useToast() {
  const showToast = useUiStore(s => s.showToast)

  return {
    success: (msg: string, duration?: number) => showToast(msg, 'success', duration),
    error:   (msg: string, duration?: number) => showToast(msg, 'error',   duration),
    info:    (msg: string, duration?: number) => showToast(msg, 'info',    duration),
  }
}
