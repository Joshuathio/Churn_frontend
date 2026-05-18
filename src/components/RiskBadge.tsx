import { cn, formatPercent, tierColor, tierFromProbability, tierLabel } from '@/lib/utils'

interface RiskBadgeProps {
  probability: number
  size?: 'sm' | 'md'
  showLabel?: boolean
  className?: string
}

export function RiskBadge({ probability, size = 'sm', showLabel = true, className }: RiskBadgeProps) {
  const tier = tierFromProbability(probability)
  const colors = tierColor[tier]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono',
        'ring-1',
        colors.fg,
        colors.bg,
        colors.ring,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        className,
      )}
    >
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', colors.dot)} aria-hidden />
      <span className="tabular">{formatPercent(probability, 0)}</span>
      {showLabel && (
        <span className="font-sans text-[10px] uppercase tracking-wider opacity-80">
          {tierLabel[tier]}
        </span>
      )}
    </span>
  )
}
