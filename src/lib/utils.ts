import { type ClassValue, clsx } from 'clsx'
import type { RiskTier } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`
}

export function tierFromProbability(p: number): RiskTier {
  if (p >= 0.5) return 'high'
  return 'low'
}

export const tierLabel: Record<RiskTier, string> = {
  high: 'High',
  low: 'Low',
}

export const tierColor: Record<RiskTier, { fg: string; bg: string; ring: string; dot: string }> = {
  high: {
    fg: 'text-rust-500',
    bg: 'bg-rust-500/10',
    ring: 'ring-rust-500/30',
    dot: 'bg-rust-500',
  },
  low: {
    fg: 'text-moss-600',
    bg: 'bg-moss-500/10',
    ring: 'ring-moss-500/30',
    dot: 'bg-moss-500',
  },
}

export function tenureLabel(months: number): string {
  if (months < 12) return `${months}mo`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem === 0 ? `${years}y` : `${years}y ${rem}mo`
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
