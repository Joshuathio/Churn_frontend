import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: ReactNode
  unit?: string
  delta?: { value: number; positive?: boolean }
  accent?: 'ember' | 'moss' | 'rust' | 'ink'
  spark?: ReactNode
  hint?: string
  className?: string
}

const accentMap = {
  ember: 'text-ember-600',
  moss: 'text-moss-600',
  rust: 'text-rust-500',
  ink: 'text-ink-900',
} as const

export function StatCard({
  label,
  value,
  unit,
  delta,
  accent = 'ink',
  spark,
  hint,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative bg-bone-50 border border-ink-900/10 p-5',
        'transition-shadow hover:shadow-[0_2px_0_0_rgba(0,0,0,0.9)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-900/60 font-mono">
          {label}
        </span>
        {delta && (
          <span
            className={cn(
              'text-[10px] font-mono tabular',
              delta.positive ? 'text-moss-600' : 'text-rust-500',
            )}
          >
            {delta.positive ? '↑' : '↓'} {Math.abs(delta.value).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn('font-display text-4xl leading-none tabular', accentMap[accent])}>
          {value}
        </span>
        {unit && <span className="text-sm text-ink-900/60 font-mono">{unit}</span>}
      </div>
      {(spark || hint) && (
        <div className="mt-4 flex items-end justify-between gap-3">
          {hint && <span className="text-xs text-ink-900/55 leading-snug">{hint}</span>}
          {spark}
        </div>
      )}
    </div>
  )
}
