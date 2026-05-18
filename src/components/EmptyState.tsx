import { type ReactNode } from 'react'
import { Inbox, RefreshCw, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title = 'No data yet',
  message = 'Connect the backend to populate this view.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      <div className="h-12 w-12 flex items-center justify-center bg-ink-900/5 text-ink-900/40 mb-5">
        {icon ?? <Inbox className="h-5 w-5" strokeWidth={1.5} />}
      </div>
      <h3 className="font-display text-xl text-ink-900">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-900/55 max-w-sm">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <RefreshCw
        className="h-5 w-5 text-ink-900/40 animate-spin mb-4"
        strokeWidth={1.5}
      />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-900/50">
        {message}
      </span>
    </div>
  )
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: Error
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-12 w-12 flex items-center justify-center bg-rust-500/10 text-rust-500 mb-5">
        <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-xl text-ink-900">Could not load data</h3>
      <p className="mt-1.5 text-sm text-ink-900/60 max-w-md font-mono">
        {error.message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-4 h-10 text-xs font-mono uppercase tracking-wider bg-ink-900 text-bone-50 hover:bg-ember-600 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
