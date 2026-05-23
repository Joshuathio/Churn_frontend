import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="pointer-events-auto relative w-full max-w-md bg-bone-50 border border-ink-900/15 shadow-2xl animate-rise">
        <div className="px-7 py-6">
          <div className="flex items-start gap-4">
            {variant === 'danger' && (
              <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-rust-500/10 text-rust-500">
                <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-display text-xl text-ink-900">{title}</h3>
              <p className="mt-2 text-sm text-ink-900/65 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-ink-900/10">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3.5 text-xs font-mono uppercase tracking-wider text-ink-900/70 hover:bg-ink-900/[0.03] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <div className="w-px bg-ink-900/10" aria-hidden />
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex-1 py-3.5 text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50',
              variant === 'danger'
                ? 'text-rust-500 hover:bg-rust-500 hover:text-bone-50'
                : 'text-ink-900 hover:bg-ink-900 hover:text-bone-50',
            )}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
