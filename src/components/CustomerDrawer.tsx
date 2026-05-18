import { X, TrendingUp, TrendingDown } from 'lucide-react'
import type { Customer } from '@/types'
import { cn, formatCurrency, formatPercent, tenureLabel, tierColor, tierFromProbability, tierLabel } from '@/lib/utils'
import { RiskBadge } from './RiskBadge'

interface CustomerDrawerProps {
  customer: (Customer & { displayName: string }) | null
  onClose: () => void
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.15em] text-bone-300/70 font-mono">
        {label}
      </span>
      <span className="text-sm text-bone-100 tabular">{value}</span>
    </div>
  )
}

export function CustomerDrawer({ customer, onClose }: CustomerDrawerProps) {
  if (!customer) return null
  const tier = tierFromProbability(customer.churnProbability)
  const colors = tierColor[tier]

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-rise"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-ink-900 text-bone-100 overflow-y-auto animate-rise">
        {/* Header */}
        <div className="sticky top-0 bg-ink-900 border-b border-bone-50/10 px-7 py-5 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-bone-300/70 font-mono">
              Customer Record
            </span>
            <h2 className="font-display text-2xl tracking-tight">
              {customer.displayName}
            </h2>
            <span className="font-mono text-xs text-bone-300/80">
              ID · {customer.customerID}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-bone-300 hover:text-bone-50 transition-colors p-1 -mr-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Risk hero */}
        <div className={cn('px-7 py-6 border-b border-bone-50/10', 'bg-gradient-to-b from-ink-800 to-ink-900')}>
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-bone-300/70 font-mono mb-1">
                Churn Probability
              </div>
              <div className={cn('font-display text-6xl tabular leading-none', colors.fg)}>
                {formatPercent(customer.churnProbability, 1)}
              </div>
            </div>
            <RiskBadge probability={customer.churnProbability} size="md" />
          </div>
          {/* Probability bar */}
          <div className="relative h-1.5 bg-bone-50/10 overflow-hidden">
            <div
              className={cn('absolute inset-y-0 left-0', colors.dot)}
              style={{ width: `${customer.churnProbability * 100}%` }}
            />
            <div className="absolute inset-y-0 left-1/2 w-px bg-bone-50/20" aria-hidden />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] font-mono text-bone-300/60">
            <span>0%</span>
            <span>50% threshold</span>
            <span>100%</span>
          </div>
          <p className="mt-4 text-sm text-bone-200/80 leading-relaxed">
            Model classifies this customer as{' '}
            <span className={cn('font-semibold', colors.fg)}>{tierLabel[tier]} risk</span>.{' '}
            {tier === 'critical' || tier === 'elevated'
              ? 'Recommend immediate ChurnAi outreach within 48 hours.'
              : 'Monitor in standard quarterly review cycle.'}
          </p>
        </div>

        {/* Risk factors */}
        <section className="px-7 py-6 border-b border-bone-50/10">
          <h3 className="text-[10px] uppercase tracking-[0.18em] text-bone-300/70 font-mono mb-4">
            Top Risk Factors
          </h3>
          <div className="space-y-3">
            {customer.riskFactors.map((f) => (
              <div key={f.feature} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {f.direction === 'increases' ? (
                      <TrendingUp className="h-3.5 w-3.5 text-rust-400" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-moss-400" />
                    )}
                    <span className="text-bone-100">{f.feature}</span>
                  </div>
                  <span className="font-mono text-xs tabular text-bone-300">
                    {(f.impact * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 bg-bone-50/10 overflow-hidden">
                  <div
                    className={cn(
                      'h-full',
                      f.direction === 'increases' ? 'bg-rust-400' : 'bg-moss-400',
                    )}
                    style={{ width: `${Math.min(100, f.impact * 200)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Account */}
        <section className="px-7 py-6 border-b border-bone-50/10">
          <h3 className="text-[10px] uppercase tracking-[0.18em] text-bone-300/70 font-mono mb-4">
            Account
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Tenure" value={tenureLabel(customer.tenure)} />
            <Field label="Contract" value={customer.Contract} />
            <Field label="Monthly Charges" value={formatCurrency(customer.MonthlyCharges)} />
            <Field label="Total Charges" value={formatCurrency(customer.TotalCharges)} />
            <Field label="Payment" value={customer.PaymentMethod} />
            <Field label="Paperless Billing" value={customer.PaperlessBilling} />
          </div>
        </section>

        {/* Demographics */}
        <section className="px-7 py-6 border-b border-bone-50/10">
          <h3 className="text-[10px] uppercase tracking-[0.18em] text-bone-300/70 font-mono mb-4">
            Demographics
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Gender" value={customer.gender} />
            <Field
              label="Senior Citizen"
              value={customer.SeniorCitizen === 1 ? 'Yes' : 'No'}
            />
            <Field label="Partner" value={customer.Partner} />
            <Field label="Dependents" value={customer.Dependents} />
          </div>
        </section>

        {/* Services */}
        <section className="px-7 py-6 border-b border-bone-50/10">
          <h3 className="text-[10px] uppercase tracking-[0.18em] text-bone-300/70 font-mono mb-4">
            Subscribed Services
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Phone Service" value={customer.PhoneService} />
            <Field label="Multiple Lines" value={customer.MultipleLines} />
            <Field label="Internet Service" value={customer.InternetService} />
            <Field label="Online Security" value={customer.OnlineSecurity} />
            <Field label="Online Backup" value={customer.OnlineBackup} />
            <Field label="Device Protection" value={customer.DeviceProtection} />
            <Field label="Tech Support" value={customer.TechSupport} />
            <Field label="Streaming TV" value={customer.StreamingTV} />
            <Field label="Streaming Movies" value={customer.StreamingMovies} />
          </div>
        </section>

        {/* Actions */}
        <div className="px-7 py-6 flex gap-3">
          <button
            className={cn(
              'flex-1 py-3 text-sm font-mono uppercase tracking-wider',
              'bg-ember-500 text-ink-900 hover:bg-ember-400 transition-colors',
            )}
          >
            Open ChurnAi case
          </button>
          <button
            className={cn(
              'flex-1 py-3 text-sm font-mono uppercase tracking-wider',
              'border border-bone-50/20 text-bone-100 hover:bg-bone-50/5 transition-colors',
            )}
          >
            Log outreach
          </button>
        </div>
      </div>
    </div>
  )
}
