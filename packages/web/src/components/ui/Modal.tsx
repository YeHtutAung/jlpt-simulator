import { useEffect, type ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  onConfirm?: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
  loading?: boolean
}

export function Modal({
  open,
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
}: ModalProps) {
  // Prevent background scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md
                      animate-slide-up p-6 space-y-4">
        <h2 id="modal-title" className="font-serif text-xl font-semibold text-text">
          {title}
        </h2>

        <div className="text-text-muted font-sans leading-relaxed">
          {children}
        </div>

        {(onConfirm || onCancel) && (
          <div className="flex gap-3 justify-end pt-2">
            {onCancel && (
              <Button variant="secondary" size="md" onClick={onCancel}>
                {cancelLabel}
              </Button>
            )}
            {onConfirm && (
              <Button
                variant={confirmVariant}
                size="md"
                onClick={onConfirm}
                loading={loading}
              >
                {confirmLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
