import { useNavigate } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { StatCard } from '@/components/StatCard'
import { RiskBadge } from '@/components/RiskBadge'
import { EmptyState, LoadingState, ErrorState } from '@/components/EmptyState'
import { useApi } from '@/hooks/useApi'
import { api, emptyOverview } from '@/lib/api'
import { formatCurrency, formatPercent, initials } from '@/lib/utils'

export function OverviewPage() {
  const navigate = useNavigate()

  const overviewQ = useApi(() => api.getOverview(), [])
  const historyQ = useApi(() => api.getPredictionHistory(), [])
  const distQ = useApi(() => api.getRiskDistribution(), [])
  const customersQ = useApi(() => api.listCustomers({ limit: 100 }), [])

  const overview = overviewQ.data ?? emptyOverview
  const predictionHistory = historyQ.data ?? []
  const dist = distQ.data ?? []
  const customers = customersQ.data?.data ?? []

  const topAtRisk = [...customers]
    .sort((a, b) => b.churnProbability - a.churnProbability)
    .slice(0, 6)

  const churnRate = overview.total > 0 ? overview.atRisk / overview.total : 0
  const hasData = overview.total > 0

  return (
    <div className="space-y-8 animate-rise">
      {/* Page header */}
      <header className="flex items-end justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/55">
            Dashboard · Today
          </span>
          <h1 className="mt-2 font-display text-5xl tracking-tight text-ink-900">
            Churn<span className="italic font-light">Ai</span>
          </h1>
          <p className="mt-2 text-sm text-ink-900/60 max-w-xl">
            A real-time view of churn risk across your customer base, scored by
            the XGBoost model.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/55">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss-500 animate-pulse" />
          Model online · v0.1
        </div>
      </header>

      {/* KPI strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-900/10">
        <StatCard
          label="Total customers"
          value={overview.total.toLocaleString()}
          hint="Active subscriber records"
        />
        <StatCard
          label="Predicted to churn"
          value={overview.atRisk.toLocaleString()}
          accent="ember"
          hint={hasData ? `${formatPercent(churnRate)} of customer base` : '—'}
        />
        <StatCard
          label="Critical risk"
          value={overview.critical.toLocaleString()}
          accent="rust"
          hint="Probability ≥ 75% — outreach in 48h"
        />
        <StatCard
          label="Revenue at risk"
          value={
            hasData
              ? formatCurrency(overview.revenueAtRisk).replace('.00', '')
              : '$0'
          }
          unit="/yr"
          accent="ink"
          hint="Annualized MRR from flagged customers"
        />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction volume */}
        <div className="lg:col-span-2 bg-bone-50 border border-ink-900/10 p-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="font-display text-xl text-ink-900">
                Prediction volume
              </h3>
              <p className="text-xs text-ink-900/55 mt-1">
                Daily inference requests over the last 14 days
              </p>
            </div>
            <div className="flex gap-5 text-[11px] font-mono">
              <Legend dotClass="bg-ink-900" label="Total" />
              <Legend dotClass="bg-ember-500" label="Flagged at-risk" />
            </div>
          </div>
          <div className="h-64">
            {historyQ.loading ? (
              <LoadingState message="Loading history…" />
            ) : historyQ.error ? (
              <ErrorState error={historyQ.error} onRetry={historyQ.refetch} />
            ) : predictionHistory.length === 0 ? (
              <EmptyState
                title="No prediction history"
                message="Predictions will appear here once the ML service starts logging requests."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={predictionHistory}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradInk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a0a0a" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#0a0a0a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradEmber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#0a0a0a" strokeOpacity={0.06} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b6960' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b6960' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0a0a0a',
                      border: 'none',
                      borderRadius: 0,
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono',
                      color: '#fafaf7',
                    }}
                    cursor={{ stroke: '#0a0a0a', strokeOpacity: 0.2, strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="predictions"
                    stroke="#0a0a0a"
                    strokeWidth={1.5}
                    fill="url(#gradInk)"
                  />
                  <Area
                    type="monotone"
                    dataKey="flagged"
                    stroke="#ff6b35"
                    strokeWidth={1.5}
                    fill="url(#gradEmber)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-bone-50 border border-ink-900/10 p-6">
          <h3 className="font-display text-xl text-ink-900">Risk distribution</h3>
          <p className="text-xs text-ink-900/55 mt-1 mb-6">
            Customers grouped by churn probability
          </p>
          <div className="h-64">
            {distQ.loading ? (
              <LoadingState message="Loading distribution…" />
            ) : distQ.error ? (
              <ErrorState error={distQ.error} onRetry={distQ.refetch} />
            ) : dist.length === 0 ? (
              <EmptyState
                title="No predictions"
                message="Distribution will appear once customers are scored."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dist} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#0a0a0a" strokeOpacity={0.06} vertical={false} />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#6b6960' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b6960' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0a0a0a',
                      border: 'none',
                      borderRadius: 0,
                      fontSize: 11,
                      fontFamily: 'JetBrains Mono',
                      color: '#fafaf7',
                    }}
                    cursor={{ fill: '#0a0a0a', fillOpacity: 0.04 }}
                  />
                  <Bar dataKey="count" radius={0}>
                    {dist.map((d, i) => {
                      let fill = '#5d8043'
                      if (d.lower >= 75) fill = '#a8442a'
                      else if (d.lower >= 50) fill = '#ff6b35'
                      else if (d.lower >= 25) fill = '#d4a017'
                      return <Cell key={i} fill={fill} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Top at risk */}
      <section className="bg-bone-50 border border-ink-900/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-900/10">
          <div>
            <h3 className="font-display text-xl text-ink-900">
              Highest-risk customers
            </h3>
            <p className="text-xs text-ink-900/55 mt-1">
              Sorted by churn probability — needs attention first
            </p>
          </div>
          <button
            onClick={() => navigate('/customers')}
            className="text-xs font-mono uppercase tracking-wider text-ink-900 hover:text-ember-600 flex items-center gap-1.5 transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {customersQ.loading ? (
          <LoadingState message="Loading customers…" />
        ) : customersQ.error ? (
          <ErrorState error={customersQ.error} onRetry={customersQ.refetch} />
        ) : topAtRisk.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5" strokeWidth={1.5} />}
            title="No customers loaded"
            message="Once the backend returns customer records, the highest-risk accounts will surface here."
          />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {topAtRisk.map((c) => (
              <button
                key={c.customerID}
                onClick={() => navigate('/customers')}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-ink-900/[0.02] transition-colors text-left group"
              >
                <div className="h-9 w-9 flex items-center justify-center bg-bone-200 text-ink-900 text-[10px] font-mono group-hover:bg-ink-900 group-hover:text-bone-50 transition-colors">
                  {initials(c.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-ink-900">{c.displayName}</div>
                  <div className="text-xs text-ink-900/55 mt-0.5">
                    {c.riskFactors[0]?.feature ?? '—'} · {c.Contract}
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-ink-900/55 font-mono">monthly</div>
                  <div className="text-sm font-mono tabular text-ink-900">
                    {formatCurrency(c.MonthlyCharges)}
                  </div>
                </div>
                <RiskBadge probability={c.churnProbability} />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-900/65">
      <span className={`inline-block h-2 w-2 ${dotClass}`} />
      {label}
    </span>
  )
}
