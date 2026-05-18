import { Search, X } from 'lucide-react'
import type { FilterState } from '@/types'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  resultCount: number
  totalCount: number
}

const baseSelect =
  'h-9 px-3 pr-8 bg-bone-50 border border-ink-900/15 text-sm font-mono ' +
  'focus:outline-none focus:ring-1 focus:ring-ink-900 focus:border-ink-900 ' +
  'appearance-none cursor-pointer'

export function FilterBar({ filters, onChange, resultCount, totalCount }: FilterBarProps) {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value })

  const reset = () =>
    onChange({
      search: '',
      minProbability: 0,
      maxProbability: 100,
      contract: 'all',
      internet: 'all',
      tenureRange: 'all',
      riskTier: 'all',
    })

  const isFiltered =
    filters.search !== '' ||
    filters.minProbability > 0 ||
    filters.maxProbability < 100 ||
    filters.contract !== 'all' ||
    filters.internet !== 'all' ||
    filters.tenureRange !== 'all' ||
    filters.riskTier !== 'all'

  return (
    <div className="bg-bone-50 border border-ink-900/10">
      {/* Top row: search + reset */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-ink-900/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-900/40" />
          <input
            type="text"
            placeholder="Search by name or customer ID…"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className={cn(
              'w-full h-10 pl-10 pr-4 bg-transparent',
              'border-0 text-sm placeholder:text-ink-900/40',
              'focus:outline-none',
            )}
          />
        </div>
        <span className="text-xs font-mono text-ink-900/55 tabular whitespace-nowrap">
          {resultCount}
          <span className="text-ink-900/30"> / </span>
          {totalCount}
        </span>
        {isFiltered && (
          <button
            onClick={reset}
            className="text-xs font-mono uppercase tracking-wider text-ink-900/60 hover:text-ink-900 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Bottom row: filters */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-3">
        {/* Probability range */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">
              Churn probability
            </span>
            <span className="text-[11px] font-mono tabular text-ink-900/75">
              {filters.minProbability}% – {filters.maxProbability}%
            </span>
          </div>
          <div className="relative w-64 h-6 flex items-center">
            <div className="absolute inset-x-0 h-1 bg-ink-900/10" />
            <div
              className="absolute h-1 bg-ember-500"
              style={{
                left: `${filters.minProbability}%`,
                right: `${100 - filters.maxProbability}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={filters.minProbability}
              onChange={(e) =>
                update(
                  'minProbability',
                  Math.min(Number(e.target.value), filters.maxProbability),
                )
              }
              className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink-900 [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={filters.maxProbability}
              onChange={(e) =>
                update(
                  'maxProbability',
                  Math.max(Number(e.target.value), filters.minProbability),
                )
              }
              className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink-900 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>

        <Divider />

        <Select
          label="Contract"
          value={filters.contract}
          onChange={(v) => update('contract', v as FilterState['contract'])}
          options={[
            { value: 'all', label: 'Any' },
            { value: 'Month-to-month', label: 'Monthly' },
            { value: 'One year', label: '1 Year' },
            { value: 'Two year', label: '2 Year' },
          ]}
        />

        <Select
          label="Internet"
          value={filters.internet}
          onChange={(v) => update('internet', v as FilterState['internet'])}
          options={[
            { value: 'all', label: 'Any' },
            { value: 'Fiber optic', label: 'Fiber' },
            { value: 'DSL', label: 'DSL' },
            { value: 'No', label: 'None' },
          ]}
        />

        <Select
          label="Tenure"
          value={filters.tenureRange}
          onChange={(v) => update('tenureRange', v as FilterState['tenureRange'])}
          options={[
            { value: 'all', label: 'Any' },
            { value: '0-12', label: '0–12 mo' },
            { value: '13-24', label: '13–24 mo' },
            { value: '25-48', label: '25–48 mo' },
            { value: '49+', label: '49+ mo' },
          ]}
        />

        <Select
          label="Risk tier"
          value={filters.riskTier}
          onChange={(v) => update('riskTier', v as FilterState['riskTier'])}
          options={[
            { value: 'all', label: 'Any' },
            { value: 'critical', label: 'Critical' },
            { value: 'elevated', label: 'Elevated' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'low', label: 'Stable' },
          ]}
        />
      </div>
    </div>
  )
}

function Divider() {
  return <div className="h-8 w-px bg-ink-900/10" />
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseSelect}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-900/40 text-xs"
          aria-hidden
        >
          ▾
        </span>
      </div>
    </label>
  )
}
