import { cn } from '@/lib/utils'

interface WordmarkProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'light'
}

export function Wordmark({ className, size = 'md', variant = 'dark' }: WordmarkProps) {
  const sizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  }
  return (
    <div className={cn('flex items-center gap-2 font-display', sizes[size], className)}>
      <span aria-hidden className="relative inline-block">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            variant === 'dark' ? 'bg-ember-500' : 'bg-ember-400',
          )}
        />
      </span>
      <span
        className={cn(
          'tracking-tight',
          variant === 'dark' ? 'text-ink-900' : 'text-bone-50',
        )}
      >
        Churn<span className="italic font-light">Ai</span>
      </span>
    </div>
  )
}
