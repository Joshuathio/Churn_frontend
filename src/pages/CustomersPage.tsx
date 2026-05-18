import { useMemo, useState } from 'react'
import { Download, Users } from 'lucide-react'
import type { FilterState } from '@/types'
import { tierFromProbability } from '@/lib/utils'
import { api, type CustomerWithName } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { FilterBar } from '@/components/FilterBar'
import { CustomerTable } from '@/components/CustomerTable'
import { CustomerDrawer } from '@/components/CustomerDrawer'
import { EmptyState, LoadingState, ErrorState } from '@/components/EmptyState'

const initialFilters: FilterState = {
  search: '',
  minProbability: 0,
  maxProbability: 100,
  contract: 'all',
  internet: 'all',
  tenureRange: 'all',
  riskTier: 'all',
}

export function CustomersPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [selected, setSelected] = useState<CustomerWithName | null>(null)

  const { data, loading, error, refetch } = useApi(() => api.listCustomers(), [])
  const customers = data ?? []

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      // Search by name or ID
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !c.displayName.toLowerCase().includes(q) &&
          !c.customerID.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      // Probability range
      const pct = c.churnProbability * 100
      if (pct < filters.minProbability || pct > filters.maxProbability) return false

      // Contract
      if (filters.contract !== 'all' && c.Contract !== filters.contract) return false

      // Internet
      if (filters.internet !== 'all' && c.InternetService !== filters.internet) return false

      // Tenure range
      if (filters.tenureRange !== 'all') {
        const t = c.tenure
        if (filters.tenureRange === '0-12' && !(t >= 0 && t <= 12)) return false
        if (filters.tenureRange === '13-24' && !(t >= 13 && t <= 24)) return false
        if (filters.tenureRange === '25-48' && !(t >= 25 && t <= 48)) return false
        if (filters.tenureRange === '49+' && t < 49) return false
      }

      // Risk tier
      if (filters.riskTier !== 'all') {
        if (tierFromProbability(c.churnProbability) !== filters.riskTier) return false
      }

      return true
    })
  }, [filters, customers])

  return (
    <div className="space-y-6 animate-rise">
      {/* Header */}
      <header className="flex items-end justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/55">
            Directory
          </span>
          <h1 className="mt-2 font-display text-5xl tracking-tight text-ink-900">
            Customers
          </h1>
          <p className="mt-2 text-sm text-ink-900/60 max-w-xl">
            Filter, sort, and inspect every customer record. Click any row to
            open the full risk breakdown.
          </p>
        </div>
        <button
          disabled={customers.length === 0}
          className="flex items-center gap-2 h-10 px-4 border border-ink-900/15 hover:bg-ink-900 hover:text-bone-50 transition-colors text-xs font-mono uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-900/40"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </header>

      {/* Loading / error / empty / table */}
      {loading ? (
        <div className="bg-bone-50 border border-ink-900/10">
          <LoadingState message="Loading customers…" />
        </div>
      ) : error ? (
        <div className="bg-bone-50 border border-ink-900/10">
          <ErrorState error={error} onRetry={refetch} />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-bone-50 border border-ink-900/10">
          <EmptyState
            icon={<Users className="h-5 w-5" strokeWidth={1.5} />}
            title="No customers yet"
            message="Connect the Express backend at VITE_API_URL to load your customer records. The table will appear here automatically."
          />
        </div>
      ) : (
        <>
          <FilterBar
            filters={filters}
            onChange={setFilters}
            resultCount={filtered.length}
            totalCount={customers.length}
          />
          <CustomerTable customers={filtered} onSelect={setSelected} />
          <div className="text-[11px] font-mono text-ink-900/40 text-center pt-2">
            Predictions served by the Random Forest Classifier · Refreshed in real-time
          </div>
        </>
      )}

      {/* Drawer */}
      <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
