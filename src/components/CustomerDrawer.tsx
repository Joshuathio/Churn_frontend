import { useEffect, useState, type FormEvent } from 'react'
import { X, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react'
import type {
  Customer,
  InterventionCase,
  OfferType,
  OutreachChannel,
  OutreachOutcome,
} from '@/types'
import { api, type OutreachInput, type RetentionOfferInput } from '@/lib/api'
import { cn, formatCurrency, formatPercent, tenureLabel, tierColor, tierFromProbability, tierLabel } from '@/lib/utils'
import { RiskBadge } from './RiskBadge'

interface CustomerDrawerProps {
  customer: (Customer & { displayName: string }) | null
  onClose: () => void
  onEdit?: (customer: Customer & { displayName: string }) => void
  onDelete?: (customer: Customer & { displayName: string }) => void
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

export function CustomerDrawer({ customer, onClose, onEdit, onDelete }: CustomerDrawerProps) {
  const [activeCase, setActiveCase] = useState<InterventionCase | null>(null)
  const [caseLoading, setCaseLoading] = useState(false)
  const [caseError, setCaseError] = useState<string | null>(null)
  const [outreachOpen, setOutreachOpen] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)

  useEffect(() => {
    setActiveCase(null)
    setCaseError(null)
    setOutreachOpen(false)
    setOfferOpen(false)
  }, [customer?.customerID])

  if (!customer) return null
  const selectedCustomer = customer
  const tier = tierFromProbability(selectedCustomer.churnProbability)
  const colors = tierColor[tier]

  async function openCase() {
    setCaseLoading(true)
    setCaseError(null)
    try {
      const result = await api.openInterventionCase({
        customerID: selectedCustomer.customerID,
        priority: selectedCustomer.riskLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      })
      setActiveCase(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open case'
      setCaseError(message)
      throw err
    } finally {
      setCaseLoading(false)
    }
  }

  async function ensureCase() {
    if (activeCase) return activeCase
    return await openCase()
  }

  async function handleOutreach(payload: OutreachInput) {
    const interventionCase = await ensureCase()
    await api.createOutreachLog(interventionCase.id, payload)
    const refreshed = await api.getInterventionCase(interventionCase.id)
    setActiveCase(refreshed)
    setOutreachOpen(false)
  }

  async function handleOffer(payload: RetentionOfferInput) {
    const interventionCase = await ensureCase()
    await api.createRetentionOffer(interventionCase.id, payload)
    const refreshed = await api.getInterventionCase(interventionCase.id)
    setActiveCase(refreshed)
    setOfferOpen(false)
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Panel */}
      <div className="pointer-events-auto relative flex h-[calc(100dvh-2rem)] max-h-[860px] w-full max-w-3xl flex-col bg-ink-900 text-bone-100 border border-bone-50/10 shadow-2xl overflow-hidden animate-rise">
        {/* Header */}
        <div className="shrink-0 bg-ink-900 border-b border-bone-50/10 px-7 py-5 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-bone-300/70 font-mono">
              Customer Record
            </span>
            <h2 className="font-display text-2xl tracking-tight">
              {selectedCustomer.displayName}
            </h2>
            <span className="font-mono text-xs text-bone-300/80">
              ID · {selectedCustomer.customerID}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(selectedCustomer)}
                className="text-bone-300 hover:text-bone-50 transition-colors p-1"
                aria-label="Edit customer"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(selectedCustomer)}
                className="text-bone-300 hover:text-rust-400 transition-colors p-1"
                aria-label="Delete customer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-bone-300 hover:text-bone-50 transition-colors p-1 -mr-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
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
              {tier === 'high'
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

          {activeCase && (
            <section className="px-7 py-6 border-b border-bone-50/10">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-bone-300/70 font-mono">
                    Active Case
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <CasePill label={activeCase.status.replace('_', ' ')} />
                    <CasePill label={`${activeCase.priority} priority`} />
                    <span className="text-xs text-bone-300/70">
                      Assigned to {activeCase.assignedTo?.name ?? 'Unassigned'}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-bone-300/55">
                  {new Date(activeCase.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.15em] font-mono text-bone-300/70 mb-2">
                    Recommended Actions
                  </h4>
                  <div className="space-y-2">
                    {(activeCase.recommendedActions ?? []).map((action) => (
                      <div key={`${action.type}-${action.label}`} className="border border-bone-50/10 px-3 py-2">
                        <div className="text-sm text-bone-100">{action.label}</div>
                        <div className="text-xs text-bone-300/70 mt-0.5">{action.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MiniList
                    title="Recent outreach"
                    empty="No outreach logged yet"
                    items={(activeCase.outreachLogs ?? []).slice(0, 3).map((log) => ({
                      id: log.id,
                      title: `${log.channel} · ${prettyEnum(log.outcome)}`,
                      detail: log.notes ?? new Date(log.createdAt).toLocaleString(),
                    }))}
                  />
                  <MiniList
                    title="Retention offers"
                    empty="No offers created yet"
                    items={(activeCase.retentionOffers ?? []).slice(0, 3).map((offer) => ({
                      id: offer.id,
                      title: `${offer.title} · ${offer.status}`,
                      detail: offer.description ?? prettyEnum(offer.offerType),
                    }))}
                  />
                </div>
              </div>
            </section>
          )}

          {caseError && (
            <div className="mx-7 mt-4 text-xs text-rust-400 font-mono border-l-2 border-rust-400 pl-3">
              {caseError}
            </div>
          )}

          {/* Actions */}
          <div className="px-7 py-6 flex flex-wrap gap-3">
            <button
              onClick={() => void openCase()}
              disabled={caseLoading}
              className={cn(
                'flex-1 min-w-44 py-3 text-sm font-mono uppercase tracking-wider',
                'bg-ember-500 text-ink-900 hover:bg-ember-400 transition-colors',
                caseLoading && 'opacity-60 cursor-wait',
              )}
            >
              {activeCase ? 'Refresh case' : caseLoading ? 'Opening...' : 'Open Churn Case'}
            </button>
            <button
              onClick={() => setOutreachOpen(true)}
              className={cn(
                'flex-1 min-w-44 py-3 text-sm font-mono uppercase tracking-wider',
                'border border-bone-50/20 text-bone-100 hover:bg-bone-50/5 transition-colors',
              )}
            >
              Log outreach
            </button>
            <button
              onClick={() => setOfferOpen(true)}
              className={cn(
                'flex-1 min-w-44 py-3 text-sm font-mono uppercase tracking-wider',
                'border border-bone-50/20 text-bone-100 hover:bg-bone-50/5 transition-colors',
              )}
            >
              Create offer
            </button>
          </div>
        </div>
      </div>
      <OutreachModal
        open={outreachOpen}
        onClose={() => setOutreachOpen(false)}
        onSubmit={handleOutreach}
      />
      <OfferModal
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
        onSubmit={handleOffer}
      />
    </div>
  )
}

function CasePill({ label }: { label: string }) {
  return (
    <span className="inline-flex h-6 items-center px-2 border border-bone-50/15 text-[10px] font-mono uppercase tracking-[0.12em] text-bone-200">
      {label}
    </span>
  )
}

function MiniList({
  title,
  empty,
  items,
}: {
  title: string
  empty: string
  items: { id: string; title: string; detail: string }[]
}) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-[0.15em] font-mono text-bone-300/70 mb-2">
        {title}
      </h4>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-xs text-bone-300/60 border border-bone-50/10 px-3 py-2">{empty}</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border border-bone-50/10 px-3 py-2">
              <div className="text-sm text-bone-100">{item.title}</div>
              <div className="text-xs text-bone-300/70 mt-0.5">{item.detail}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function OutreachModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (payload: OutreachInput) => Promise<void>
}) {
  const [form, setForm] = useState<OutreachInput>({
    channel: 'PHONE',
    outcome: 'CONTACTED',
    notes: '',
    nextFollowUpAt: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        channel: form.channel,
        outcome: form.outcome,
        notes: form.notes || undefined,
        nextFollowUpAt: form.nextFollowUpAt || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log outreach')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pointer-events-auto fixed left-1/2 top-1/2 z-[70] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-bone-50 text-ink-900 border border-ink-900/15 shadow-2xl">
      <ModalHeader title="Log outreach" onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        <SelectField
          label="Channel"
          value={form.channel}
          options={['PHONE', 'EMAIL', 'WHATSAPP', 'SMS', 'IN_APP', 'OTHER']}
          onChange={(value) => setForm((next) => ({ ...next, channel: value as OutreachChannel }))}
        />
        <SelectField
          label="Outcome"
          value={form.outcome}
          options={[
            'CONTACTED',
            'NO_RESPONSE',
            'INTERESTED',
            'NOT_INTERESTED',
            'COMPLAINED',
            'ESCALATED',
            'FOLLOW_UP_NEEDED',
          ]}
          onChange={(value) => setForm((next) => ({ ...next, outcome: value as OutreachOutcome }))}
        />
        <TextArea
          label="Notes"
          value={form.notes ?? ''}
          onChange={(value) => setForm((next) => ({ ...next, notes: value }))}
        />
        <TextInput
          type="date"
          label="Next follow-up date"
          value={form.nextFollowUpAt ?? ''}
          onChange={(value) => setForm((next) => ({ ...next, nextFollowUpAt: value }))}
        />
        {error && <div className="text-xs text-rust-500 font-mono">{error}</div>}
      </div>
      <ModalFooter
        confirmLabel={saving ? 'Saving...' : 'Save outreach'}
        disabled={saving}
        onCancel={onClose}
      />
    </form>
  )
}

function OfferModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (payload: RetentionOfferInput) => Promise<void>
}) {
  const [form, setForm] = useState<RetentionOfferInput>({
    offerType: 'DISCOUNT',
    title: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        offerType: form.offerType,
        title: form.title,
        description: form.description || undefined,
        discountPercent: form.discountPercent,
        discountAmount: form.discountAmount,
        durationMonths: form.durationMonths,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pointer-events-auto fixed left-1/2 top-1/2 z-[70] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-bone-50 text-ink-900 border border-ink-900/15 shadow-2xl">
      <ModalHeader title="Create retention offer" onClose={onClose} />
      <div className="px-6 py-5 space-y-4">
        <SelectField
          label="Offer type"
          value={form.offerType}
          options={[
            'DISCOUNT',
            'CONTRACT_UPGRADE',
            'FREE_SUPPORT',
            'SERVICE_BUNDLE',
            'DEVICE_PROTECTION',
            'CUSTOM',
          ]}
          onChange={(value) => setForm((next) => ({ ...next, offerType: value as OfferType }))}
        />
        <TextInput
          label="Title"
          value={form.title}
          onChange={(value) => setForm((next) => ({ ...next, title: value }))}
          required
        />
        <TextArea
          label="Description"
          value={form.description ?? ''}
          onChange={(value) => setForm((next) => ({ ...next, description: value }))}
        />
        <div className="grid grid-cols-3 gap-3">
          <TextInput
            type="number"
            label="Discount %"
            value={form.discountPercent?.toString() ?? ''}
            onChange={(value) =>
              setForm((next) => ({
                ...next,
                discountPercent: value ? Number(value) : undefined,
                discountAmount: undefined,
              }))
            }
          />
          <TextInput
            type="number"
            label="Amount"
            value={form.discountAmount?.toString() ?? ''}
            onChange={(value) =>
              setForm((next) => ({
                ...next,
                discountAmount: value ? Number(value) : undefined,
                discountPercent: undefined,
              }))
            }
          />
          <TextInput
            type="number"
            label="Months"
            value={form.durationMonths?.toString() ?? ''}
            onChange={(value) => setForm((next) => ({ ...next, durationMonths: value ? Number(value) : undefined }))}
          />
        </div>
        {error && <div className="text-xs text-rust-500 font-mono">{error}</div>}
      </div>
      <ModalFooter
        confirmLabel={saving ? 'Saving...' : 'Create offer'}
        disabled={saving}
        onCancel={onClose}
      />
    </form>
  )
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="px-6 py-4 border-b border-ink-900/10 flex items-center justify-between">
      <h3 className="font-display text-xl">{title}</h3>
      <button type="button" onClick={onClose} className="text-ink-900/50 hover:text-ink-900">
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

function ModalFooter({
  confirmLabel,
  disabled,
  onCancel,
}: {
  confirmLabel: string
  disabled?: boolean
  onCancel: () => void
}) {
  return (
    <div className="flex border-t border-ink-900/10">
      <button type="button" onClick={onCancel} className="flex-1 py-3 text-xs font-mono uppercase tracking-wider text-ink-900/65 hover:bg-ink-900/[0.03]">
        Cancel
      </button>
      <button disabled={disabled} className="flex-1 py-3 text-xs font-mono uppercase tracking-wider bg-ink-900 text-bone-50 disabled:opacity-50">
        {confirmLabel}
      </button>
    </div>
  )
}

function SelectField({
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
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-10 w-full border border-ink-900/15 bg-bone-50 px-3 text-sm font-mono">
        {options.map((option) => (
          <option key={option} value={option}>{prettyEnum(option)}</option>
        ))}
      </select>
    </label>
  )
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">{label}</span>
      <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 h-10 w-full border border-ink-900/15 bg-bone-50 px-3 text-sm" />
    </label>
  )
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="mt-1.5 w-full border border-ink-900/15 bg-bone-50 px-3 py-2 text-sm resize-none" />
    </label>
  )
}

function prettyEnum(value: string) {
  return value.replace(/_/g, ' ')
}
