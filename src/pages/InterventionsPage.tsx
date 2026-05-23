import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseBusiness, ChevronLeft, ChevronRight } from 'lucide-react'
import { api, type CaseListParams } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/context/AuthContext'
import type { CasePriority, CaseStatus, InterventionCase } from '@/types'
import { EmptyState, ErrorState, LoadingState } from '@/components/EmptyState'
import { cn } from '@/lib/utils'

const statuses: Array<CaseStatus | 'all'> = [
  'all',
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
]
const priorities: Array<CasePriority | 'all'> = ['all', 'LOW', 'MEDIUM', 'HIGH']

export function InterventionsPage() {
  const { user } = useAuth()
  const isManager = user?.role === 'ChurnAi Manager'
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<CaseStatus | 'all'>('all')
  const [priority, setPriority] = useState<CasePriority | 'all'>('all')

  const query = useMemo<CaseListParams>(
    () => ({
      page,
      limit: 10,
      status: status === 'all' ? undefined : status,
      priority: priority === 'all' ? undefined : priority,
      scope: isManager ? 'all' : 'mine',
    }),
    [isManager, page, priority, status],
  )

  const casesQ = useApi(() => api.listInterventionCases(query), [query])
  const analyticsQ = useApi(
    () =>
      isManager
        ? api.getInterventionAnalytics()
        : Promise.resolve(null),
    [isManager],
  )

  const cases = casesQ.data?.data ?? []
  const meta = casesQ.data?.meta ?? {
    page,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    scope: isManager ? 'all' : 'mine',
  }

  return (
    <div className="space-y-6 animate-rise">
      <header className="flex items-end justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/55">
            Retention workflow
          </span>
          <h1 className="mt-2 font-display text-5xl tracking-tight text-ink-900">
            Intervention Cases
          </h1>
          <p className="mt-2 text-sm text-ink-900/60 max-w-xl">
            Track churn cases, outreach, and retention offers from prediction to resolution.
          </p>
        </div>
      </header>

      {isManager && analyticsQ.data && (
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Metric label="Open" value={analyticsQ.data.openCases} />
          <Metric label="In progress" value={analyticsQ.data.inProgressCases} />
          <Metric label="Resolved" value={analyticsQ.data.resolvedCases} />
          <Metric label="Unassigned" value={analyticsQ.data.unassignedCases} />
          <Metric
            label="Offer accept"
            value={`${Math.round(analyticsQ.data.offerAcceptanceRate * 100)}%`}
          />
        </section>
      )}

      <section className="bg-bone-50 border border-ink-900/10">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-ink-900/10">
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Status"
              value={status}
              options={statuses}
              onChange={(value) => {
                setStatus(value as CaseStatus | 'all')
                setPage(1)
              }}
            />
            <FilterSelect
              label="Priority"
              value={priority}
              options={priorities}
              onChange={(value) => {
                setPriority(value as CasePriority | 'all')
                setPage(1)
              }}
            />
          </div>
          <span className="text-xs font-mono text-ink-900/55">
            Scope · {meta.scope}
          </span>
        </div>

        {casesQ.loading && !casesQ.data ? (
          <LoadingState message="Loading intervention cases..." />
        ) : casesQ.error ? (
          <ErrorState error={casesQ.error} onRetry={casesQ.refetch} />
        ) : cases.length === 0 ? (
          <EmptyState
            icon={<BriefcaseBusiness className="h-5 w-5" strokeWidth={1.5} />}
            title="No cases found"
            message="Open a churn case from a high-risk customer to start the retention workflow."
          />
        ) : (
          <CaseTable cases={cases} />
        )}
      </section>

      {cases.length > 0 && (
        <div className="bg-bone-50 border border-ink-900/10 px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-mono text-ink-900/55">
            Page {meta.page} / {Math.max(meta.totalPages, 1)}
          </span>
          <div className="flex items-center gap-2">
            <PageButton disabled={meta.page <= 1} onClick={() => setPage((next) => next - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </PageButton>
            <PageButton
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((next) => next + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </PageButton>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-bone-50 border border-ink-900/10 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] font-mono text-ink-900/50">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl text-ink-900 tabular">{value}</div>
    </div>
  )
}

function CaseTable({ cases }: { cases: InterventionCase[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink-900/10">
            <Th>Customer</Th>
            <Th>Status</Th>
            <Th>Priority</Th>
            <Th>Assigned</Th>
            <Th>Created</Th>
          </tr>
        </thead>
        <tbody>
          {cases.map((item) => (
            <tr key={item.id} className="border-b border-ink-900/5 hover:bg-ink-900/[0.025] transition-colors">
              <Td>
                <Link to={`/interventions/${item.id}`} className="block">
                  <div className="text-sm text-ink-900 hover:text-ember-700">
                    {item.customer?.displayName ?? item.customer?.fullName ?? item.customerID}
                  </div>
                  <div className="font-mono text-[11px] text-ink-900/45">{item.customerID}</div>
                </Link>
              </Td>
              <Td>
                <Badge>{item.status.replace('_', ' ')}</Badge>
              </Td>
              <Td>
                <Badge tone={item.priority === 'HIGH' ? 'danger' : 'default'}>{item.priority}</Badge>
              </Td>
              <Td>{item.assignedTo?.name ?? 'Unassigned'}</Td>
              <Td>{new Date(item.createdAt).toLocaleDateString()}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-mono text-ink-900/55">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 px-2 bg-bone-50 border border-ink-900/15 text-xs font-mono focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace('_', ' ')}
          </option>
        ))}
      </select>
    </label>
  )
}

function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'danger'
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center px-2 text-[10px] font-mono uppercase tracking-[0.12em]',
        tone === 'danger'
          ? 'bg-rust-500/10 text-rust-600'
          : 'bg-ink-900/5 text-ink-900/65',
      )}
    >
      {children}
    </span>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm text-ink-900/80">{children}</td>
}

function PageButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-8 w-8 inline-flex items-center justify-center border border-ink-900/15 text-ink-900/65 hover:bg-ink-900 hover:text-bone-50 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-900/65"
    >
      {children}
    </button>
  )
}
