import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import type { Customer } from '@/types'
import { cn, formatCurrency, initials, tenureLabel } from '@/lib/utils'
import { RiskBadge } from './RiskBadge'

type CustomerWithName = Customer & { displayName: string }

type SortKey = 'name' | 'probability' | 'tenure' | 'monthly' | 'contract'
type SortDir = 'asc' | 'desc'

interface CustomerTableProps {
  customers: CustomerWithName[]
  onSelect: (c: CustomerWithName) => void
}

export function CustomerTable({ customers, onSelect }: CustomerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('probability')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = [...customers].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    switch (sortKey) {
      case 'name':
        return a.displayName.localeCompare(b.displayName) * dir
      case 'probability':
        return (a.churnProbability - b.churnProbability) * dir
      case 'tenure':
        return (a.tenure - b.tenure) * dir
      case 'monthly':
        return (a.MonthlyCharges - b.MonthlyCharges) * dir
      case 'contract':
        return a.Contract.localeCompare(b.Contract) * dir
    }
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' || key === 'contract' ? 'asc' : 'desc')
    }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return sortDir === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    )
  }

  return (
    <div className="bg-bone-50 border border-ink-900/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-900/10">
              <Th onClick={() => toggleSort('name')}>
                <span>Customer</span>
                <SortIcon k="name" />
              </Th>
              <Th onClick={() => toggleSort('probability')} className="text-right">
                <SortIcon k="probability" />
                <span>Churn risk</span>
              </Th>
              <Th onClick={() => toggleSort('contract')}>
                <span>Contract</span>
                <SortIcon k="contract" />
              </Th>
              <Th onClick={() => toggleSort('tenure')} className="text-right">
                <SortIcon k="tenure" />
                <span>Tenure</span>
              </Th>
              <Th onClick={() => toggleSort('monthly')} className="text-right">
                <SortIcon k="monthly" />
                <span>Monthly</span>
              </Th>
              <Th>Internet</Th>
              <Th>Top driver</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-ink-900/50 text-sm">
                  No customers match these filters
                </td>
              </tr>
            ) : (
              sorted.map((c) => (
                <tr
                  key={c.customerID}
                  onClick={() => onSelect(c)}
                  className={cn(
                    'border-b border-ink-900/5 cursor-pointer',
                    'hover:bg-ink-900/[0.025] transition-colors group',
                  )}
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-8 w-8 flex items-center justify-center text-[10px] font-mono font-medium',
                          'bg-bone-200 text-ink-900',
                          'group-hover:bg-ink-900 group-hover:text-bone-50 transition-colors',
                        )}
                      >
                        {initials(c.displayName)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-ink-900 leading-tight">
                          {c.displayName}
                        </span>
                        <span className="text-[11px] font-mono text-ink-900/45 leading-tight">
                          {c.customerID}
                        </span>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-right">
                    <div className="flex justify-end">
                      <RiskBadge probability={c.churnProbability} showLabel={false} />
                    </div>
                  </Td>
                  <Td>
                    <span className="text-sm text-ink-900/85">{c.Contract}</span>
                  </Td>
                  <Td className="text-right font-mono text-sm tabular text-ink-900/80">
                    {tenureLabel(c.tenure)}
                  </Td>
                  <Td className="text-right font-mono text-sm tabular text-ink-900/80">
                    {formatCurrency(c.MonthlyCharges)}
                  </Td>
                  <Td>
                    <span className="text-sm text-ink-900/85">{c.InternetService}</span>
                  </Td>
                  <Td>
                    <span className="text-xs text-ink-900/65">
                      {c.riskFactors[0]?.feature ?? '—'}
                    </span>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <th
      onClick={onClick}
      className={cn(
        'text-left px-4 py-3',
        'text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55',
        onClick && 'cursor-pointer hover:text-ink-900 select-none',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center gap-1.5',
          className?.includes('text-right') && 'justify-end',
        )}
      >
        {children}
      </div>
    </th>
  )
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3', className)}>{children}</td>
}
