import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { api, type CustomerWithName, type ContractAggregate } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { EmptyState, LoadingState, ErrorState } from '@/components/EmptyState'
import { formatPercent } from '@/lib/utils'

// Aggregate feature importance across all customer predictions
function aggregateFeatureImportance(customers: CustomerWithName[]) {
  const map: Record<string, { total: number; count: number; direction: string }> = {}
  for (const c of customers) {
    for (const f of c.riskFactors) {
      if (!map[f.feature]) map[f.feature] = { total: 0, count: 0, direction: f.direction }
      map[f.feature].total += f.impact
      map[f.feature].count += 1
    }
  }
  return Object.entries(map)
    .map(([feature, { total, count, direction }]) => ({
      feature,
      importance: total / count,
      mentions: count,
      direction,
    }))
    .sort((a, b) => b.importance - a.importance)
}

export function InsightsPage() {
  const customersQ = useApi(() => api.listCustomers({ limit: 100 }), [])
  const contractsQ = useApi(() => api.getContractAggregates(), [])

  const customers = customersQ.data?.data ?? []
  const contracts: ContractAggregate[] = contractsQ.data ?? []

  const features = aggregateFeatureImportance(customers)

  return (
    <div className="space-y-8 animate-rise">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/55">
          Model interpretability
        </span>
        <h1 className="mt-2 font-display text-5xl tracking-tight text-ink-900">
          Why customers <span className="italic font-light">leave</span>
        </h1>
        <p className="mt-2 text-sm text-ink-900/60 max-w-xl">
          Feature importance scores from the XGBoost model — these are the
          signals driving every prediction.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature importance */}
        <div className="bg-bone-50 border border-ink-900/10 p-6">
          <h3 className="font-display text-xl text-ink-900">
            Top churn drivers
          </h3>
          <p className="text-xs text-ink-900/55 mt-1 mb-6">
            Mean Gini-importance across the model
          </p>

          {customersQ.loading ? (
            <LoadingState message="Loading features…" />
          ) : customersQ.error ? (
            <ErrorState error={customersQ.error} onRetry={customersQ.refetch} />
          ) : features.length === 0 ? (
            <EmptyState
              icon={<BarChart3 className="h-5 w-5" strokeWidth={1.5} />}
              title="No feature data"
              message="Feature importance will appear once predictions are available."
            />
          ) : (
            <div className="space-y-4">
              {features.map((f) => (
                <div key={f.feature}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-sm text-ink-900">{f.feature}</span>
                    <span className="font-mono text-xs tabular text-ink-900/70">
                      {(f.importance * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-ink-900/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-ember-500 to-ember-400"
                      style={{
                        width: `${Math.min(100, (f.importance / features[0].importance) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By contract */}
        <div className="bg-bone-50 border border-ink-900/10 p-6">
          <h3 className="font-display text-xl text-ink-900">
            Churn rate by contract
          </h3>
          <p className="text-xs text-ink-900/55 mt-1 mb-6">
            Month-to-month customers typically leave at higher rates
          </p>

          {contractsQ.loading ? (
            <LoadingState message="Loading aggregates…" />
          ) : contractsQ.error ? (
            <ErrorState error={contractsQ.error} onRetry={contractsQ.refetch} />
          ) : contracts.length === 0 ? (
            <EmptyState
              title="No contract data"
              message="Aggregates will appear once customers are loaded."
            />
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contracts.map((c) => ({
                      ...c,
                      rate: c.total > 0 ? (c.churned / c.total) * 100 : 0,
                    }))}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#0a0a0a" strokeOpacity={0.06} vertical={false} />
                    <XAxis
                      dataKey="contract"
                      tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#6b6960' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      unit="%"
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
                      formatter={(v: number) => [`${v.toFixed(1)}%`, 'Churn rate']}
                      cursor={{ fill: '#0a0a0a', fillOpacity: 0.04 }}
                    />
                    <Bar dataKey="rate" radius={0}>
                      {contracts.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === 0 ? '#ff6b35' : i === 1 ? '#d4a017' : '#5d8043'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-ink-900/5">
                {contracts.map((c) => (
                  <div key={c.contract}>
                    <div className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">
                      {c.contract}
                    </div>
                    <div className="mt-1 font-display text-2xl tabular text-ink-900">
                      {c.total > 0 ? formatPercent(c.churned / c.total, 1) : '—'}
                    </div>
                    <div className="text-[11px] font-mono text-ink-900/55">
                      {c.churned} of {c.total}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Model metrics — these come from a final eval report, not live data */}
      <section className="bg-ink-900 text-bone-50 p-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-300/70">
              Model performance · last evaluation
            </span>
            <h3 className="mt-2 font-display text-3xl">XGBoost Classifier</h3>
          </div>
          <span className="font-mono text-xs text-bone-300/60">
            Awaiting evaluation report
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'F1-Score', value: '—' },
            { label: 'Recall', value: '—', delta: 'target ≥ 80%' },
            { label: 'Precision', value: '—' },
            { label: 'Accuracy', value: '—' },
          ].map((m) => (
            <div key={m.label} className="border-t border-bone-50/15 pt-4">
              <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-bone-300/70">
                {m.label}
              </div>
              <div className="mt-2 font-display text-4xl tabular">{m.value}</div>
              {m.delta && (
                <div className="mt-1 font-mono text-[11px] text-bone-300/60">
                  {m.delta}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
