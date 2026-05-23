import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Users } from 'lucide-react'
import type { FilterState } from '@/types'
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
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selected, setSelected] = useState<CustomerWithName | null>(null)

  const customerQuery = useMemo(() => {
    const tenure =
      filters.tenureRange === '0-12'
        ? { minTenure: 0, maxTenure: 12 }
        : filters.tenureRange === '13-24'
          ? { minTenure: 13, maxTenure: 24 }
          : filters.tenureRange === '25-48'
            ? { minTenure: 25, maxTenure: 48 }
            : filters.tenureRange === '49+'
              ? { minTenure: 49 }
              : {}

    return {
      page,
      limit,
      search: filters.search || undefined,
      minProbability:
        filters.minProbability > 0 ? filters.minProbability / 100 : undefined,
      maxProbability:
        filters.maxProbability < 100 ? filters.maxProbability / 100 : undefined,
      contract: filters.contract !== 'all' ? filters.contract : undefined,
      internet: filters.internet !== 'all' ? filters.internet : undefined,
      riskLevel:
        filters.riskTier === 'high'
          ? 'HIGH'
          : filters.riskTier === 'low'
            ? 'LOW'
            : undefined,
      ...tenure,
    } as const
  }, [filters, page, limit])

  const { data, loading, error, refetch } = useApi(
    () => api.listCustomers(customerQuery),
    [customerQuery],
  )
  const customers = data?.data ?? []
  const meta =
    data?.meta ?? {
      page,
      limit,
      totalRecords: 0,
      totalPages: 1,
    }

  function handleFiltersChange(next: FilterState) {
    setFilters(next)
    setPage(1)
  }

  function handleLimitChange(nextLimit: number) {
    setLimit(nextLimit)
    setPage(1)
  }

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
            onChange={handleFiltersChange}
            resultCount={customers.length}
            totalCount={meta.totalRecords}
          />
          <CustomerTable customers={customers} onSelect={setSelected} />
          <PaginationControls
            page={meta.page}
            limit={meta.limit}
            totalRecords={meta.totalRecords}
            totalPages={meta.totalPages}
            onPageChange={setPage}
            onLimitChange={handleLimitChange}
          />
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

function PaginationControls({
  page,
  limit,
  totalRecords,
  totalPages,
  onPageChange,
  onLimitChange,
}: {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}) {
  const start = totalRecords === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, totalRecords)

  return (
    <div className="bg-bone-50 border border-ink-900/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="text-xs font-mono text-ink-900/55 tabular">
        Showing {start}-{end} of {totalRecords}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-mono text-ink-900/55">
          Rows
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="h-8 px-2 bg-bone-50 border border-ink-900/15 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ink-900"
          >
            {[10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="h-8 w-8 inline-flex items-center justify-center border border-ink-900/15 text-ink-900/65 hover:bg-ink-900 hover:text-bone-50 transition-colors disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-900/65"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono text-ink-900/65 tabular min-w-24 text-center">
            Page {page} / {Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="h-8 w-8 inline-flex items-center justify-center border border-ink-900/15 text-ink-900/65 hover:bg-ink-900 hover:text-bone-50 transition-colors disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-900/65"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
