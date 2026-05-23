import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  FileText,
  Gift,
  PhoneCall,
  UserRound,
} from 'lucide-react'
import { api, type UpdateCaseInput } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import type {
  CasePriority,
  CaseResolutionOutcome,
  CaseStatus,
  InterventionCase,
  OfferStatus,
  RetentionOffer,
} from '@/types'
import { EmptyState, ErrorState, LoadingState } from '@/components/EmptyState'
import { cn, formatCurrency, formatPercent, tenureLabel } from '@/lib/utils'

const activeStatusOptions: CaseStatus[] = ['OPEN', 'IN_PROGRESS']
const priorityOptions: CasePriority[] = ['LOW', 'MEDIUM', 'HIGH']
const resolutionOutcomes: CaseResolutionOutcome[] = [
  'RETAINED',
  'OFFER_ACCEPTED',
  'OFFER_REJECTED',
  'CUSTOMER_UNREACHABLE',
  'CHURN_CONFIRMED',
  'OTHER',
]
const offerStatusOptions: OfferStatus[] = [
  'OFFERED',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
]

export function InterventionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(false)
  const [resolveMode, setResolveMode] = useState<'RESOLVED' | 'CLOSED' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const caseQ = useApi(
    () => (id ? api.getInterventionCase(id) : Promise.reject(new Error('Missing case id'))),
    [id],
  )

  const interventionCase = caseQ.data
  const customer = interventionCase?.customer
  const customerName =
    customer?.displayName ?? customer?.fullName ?? interventionCase?.customerID ?? 'Customer'

  const timeline = useMemo(() => {
    if (!interventionCase) return []
    return [
      {
        id: `case-${interventionCase.id}`,
        at: interventionCase.createdAt,
        title: 'Case opened',
        detail: interventionCase.createdBy?.name ?? 'System',
      },
      ...(interventionCase.outreachLogs ?? []).map((log) => ({
        id: log.id,
        at: log.createdAt,
        title: `${prettyEnum(log.channel)} outreach`,
        detail: `${prettyEnum(log.outcome)}${log.notes ? ` · ${log.notes}` : ''}`,
      })),
      ...(interventionCase.retentionOffers ?? []).map((offer) => ({
        id: offer.id,
        at: offer.createdAt,
        title: `Offer created · ${offer.title}`,
        detail: `${prettyEnum(offer.offerType)} · ${prettyEnum(offer.status)}`,
      })),
      ...(interventionCase.resolvedAt
        ? [
            {
              id: `resolved-${interventionCase.id}`,
              at: interventionCase.resolvedAt,
              title: 'Case resolved',
              detail: interventionCase.resolutionNote ?? 'No resolution note',
            },
          ]
        : []),
      ...(interventionCase.closedAt
        ? [
            {
              id: `closed-${interventionCase.id}`,
              at: interventionCase.closedAt,
              title: 'Case closed',
              detail: interventionCase.resolutionNote ?? 'No closing note',
            },
          ]
        : []),
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  }, [interventionCase])

  async function updateCase(payload: UpdateCaseInput) {
    if (!id) return
    setUpdating(true)
    setError(null)
    try {
      await api.updateInterventionCase(id, payload)
      caseQ.refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update case')
    } finally {
      setUpdating(false)
    }
  }

  async function updateOfferStatus(offer: RetentionOffer, status: OfferStatus) {
    setUpdating(true)
    setError(null)
    try {
      await api.updateRetentionOfferStatus(offer.id, status)
      caseQ.refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offer')
    } finally {
      setUpdating(false)
    }
  }

  if (caseQ.loading && !caseQ.data) {
    return (
      <div className="bg-bone-50 border border-ink-900/10">
        <LoadingState message="Loading case detail..." />
      </div>
    )
  }

  if (caseQ.error) {
    return (
      <div className="bg-bone-50 border border-ink-900/10">
        <ErrorState error={caseQ.error} onRetry={caseQ.refetch} />
      </div>
    )
  }

  if (!interventionCase) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" strokeWidth={1.5} />}
        title="Case not found"
        message="The selected intervention case is unavailable."
      />
    )
  }

  return (
    <div className="space-y-6 animate-rise">
      <header className="flex items-start justify-between gap-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/interventions')}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-900/55 hover:text-ink-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Cases
          </button>
          <h1 className="mt-3 font-display text-5xl tracking-tight text-ink-900">
            {customerName}
          </h1>
          <p className="mt-2 text-sm text-ink-900/60 max-w-xl">
            Case {interventionCase.id} · Customer {interventionCase.customerID}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge tone={statusTone(interventionCase.status)}>
            {prettyEnum(interventionCase.status)}
          </Badge>
          <Badge tone={interventionCase.priority === 'HIGH' ? 'danger' : 'default'}>
            {interventionCase.priority} priority
          </Badge>
        </div>
      </header>

      {error && (
        <div className="text-xs text-rust-500 font-mono border-l-2 border-rust-500 pl-3">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Metric
          label="Churn snapshot"
          value={formatPercent(interventionCase.churnProbabilitySnapshot, 1)}
        />
        <Metric label="Risk level" value={interventionCase.riskLevelSnapshot ?? 'Unknown'} />
        <Metric label="Assigned" value={interventionCase.assignedTo?.name ?? 'Unassigned'} />
        <Metric label="Created" value={new Date(interventionCase.createdAt).toLocaleDateString()} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="space-y-6">
          <Panel title="Case Controls" icon={<BadgeCheck className="h-4 w-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Status"
                value={interventionCase.status}
                options={
                  activeStatusOptions.includes(interventionCase.status)
                    ? activeStatusOptions
                    : [interventionCase.status]
                }
                disabled={updating || !activeStatusOptions.includes(interventionCase.status)}
                onChange={(value) => updateCase({ status: value as CaseStatus })}
              />
              <SelectField
                label="Priority"
                value={interventionCase.priority}
                options={priorityOptions}
                disabled={updating}
                onChange={(value) => updateCase({ priority: value as CasePriority })}
              />
            </div>
            <div className="mt-4">
              {interventionCase.resolutionOutcome && (
                <div className="mb-4 border border-ink-900/10 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/45">
                    Resolution
                  </div>
                  <div className="mt-1 text-sm text-ink-900">
                    {prettyEnum(interventionCase.resolutionOutcome)}
                  </div>
                  {interventionCase.resolutionNote && (
                    <p className="mt-2 text-sm text-ink-900/65">
                      {interventionCase.resolutionNote}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setResolveMode('RESOLVED')}
                  className="h-10 px-4 bg-ink-900 text-bone-50 text-xs font-mono uppercase tracking-wider hover:bg-ember-600 disabled:opacity-50"
                >
                  Resolve case
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setResolveMode('CLOSED')}
                  className="h-10 px-4 border border-ink-900/15 text-xs font-mono uppercase tracking-wider text-ink-900 hover:bg-ink-900 hover:text-bone-50 disabled:opacity-50"
                >
                  Close case
                </button>
              </div>
            </div>
          </Panel>

          <Panel title="Recommended Actions" icon={<Gift className="h-4 w-4" />}>
            <div className="space-y-3">
              {(interventionCase.recommendedActions ?? []).map((action) => (
                <div key={`${action.type}-${action.label}`} className="border border-ink-900/10 px-4 py-3">
                  <div className="text-sm font-medium text-ink-900">{action.label}</div>
                  <div className="text-xs text-ink-900/55 mt-1">{action.reason}</div>
                </div>
              ))}
              {(interventionCase.recommendedActions ?? []).length === 0 && (
                <p className="text-sm text-ink-900/55">No recommended actions stored.</p>
              )}
            </div>
          </Panel>

          <Panel title="Outreach Logs" icon={<PhoneCall className="h-4 w-4" />}>
            <div className="space-y-3">
              {(interventionCase.outreachLogs ?? []).map((log) => (
                <div key={log.id} className="border border-ink-900/10 px-4 py-3">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="text-sm text-ink-900">
                      {prettyEnum(log.channel)} · {prettyEnum(log.outcome)}
                    </div>
                    <div className="text-xs font-mono text-ink-900/45">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-ink-900/55">
                    {log.agent?.name ?? 'Unknown agent'}
                    {log.nextFollowUpAt
                      ? ` · Follow-up ${new Date(log.nextFollowUpAt).toLocaleDateString()}`
                      : ''}
                  </div>
                  {log.notes && <p className="mt-2 text-sm text-ink-900/70">{log.notes}</p>}
                </div>
              ))}
              {(interventionCase.outreachLogs ?? []).length === 0 && (
                <p className="text-sm text-ink-900/55">No outreach logged yet.</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Customer Snapshot" icon={<UserRound className="h-4 w-4" />}>
            {customer ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contract" value={customer.Contract} />
                <Field label="Tenure" value={tenureLabel(customer.tenure)} />
                <Field label="Monthly" value={formatCurrency(customer.MonthlyCharges)} />
                <Field label="Internet" value={customer.InternetService} />
                <Field label="Payment" value={customer.PaymentMethod} />
                <Field label="Tech Support" value={customer.TechSupport} />
              </div>
            ) : (
              <p className="text-sm text-ink-900/55">Customer snapshot unavailable.</p>
            )}
          </Panel>

          <Panel title="Retention Offers" icon={<Gift className="h-4 w-4" />}>
            <div className="space-y-3">
              {(interventionCase.retentionOffers ?? []).map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  disabled={updating}
                  onStatusChange={(status) => updateOfferStatus(offer, status)}
                />
              ))}
              {(interventionCase.retentionOffers ?? []).length === 0 && (
                <p className="text-sm text-ink-900/55">No retention offers created yet.</p>
              )}
            </div>
          </Panel>

          <Panel title="Timeline" icon={<Clock3 className="h-4 w-4" />}>
            <div className="space-y-3">
              {timeline.map((item) => (
                <div key={item.id} className="border-l-2 border-ink-900/10 pl-3">
                  <div className="text-sm text-ink-900">{item.title}</div>
                  <div className="text-xs text-ink-900/55 mt-0.5">{item.detail}</div>
                  <div className="text-[10px] font-mono text-ink-900/40 mt-1">
                    {new Date(item.at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <div>
        <Link
          to="/interventions"
          className="text-xs font-mono uppercase tracking-wider text-ink-900/55 hover:text-ink-900"
        >
          Back to intervention cases
        </Link>
      </div>
      <ResolveCaseModal
        open={resolveMode !== null}
        mode={resolveMode ?? 'RESOLVED'}
        interventionCase={interventionCase}
        saving={updating}
        onClose={() => setResolveMode(null)}
        onSubmit={async (payload) => {
          await updateCase(payload)
          setResolveMode(null)
        }}
      />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-bone-50 border border-ink-900/10 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] font-mono text-ink-900/50">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl text-ink-900 tabular">{value}</div>
    </div>
  )
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="bg-bone-50 border border-ink-900/10">
      <div className="px-5 py-4 border-b border-ink-900/10 flex items-center gap-2">
        <span className="text-ink-900/45">{icon}</span>
        <h2 className="font-display text-xl text-ink-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function OfferCard({
  offer,
  disabled,
  onStatusChange,
}: {
  offer: RetentionOffer
  disabled?: boolean
  onStatusChange: (status: OfferStatus) => void
}) {
  return (
    <div className="border border-ink-900/10 px-4 py-3">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink-900">{offer.title}</div>
          <div className="text-xs text-ink-900/55 mt-1">
            {prettyEnum(offer.offerType)}
            {offer.discountPercent ? ` · ${offer.discountPercent}% discount` : ''}
            {offer.discountAmount ? ` · ${formatCurrency(offer.discountAmount)}` : ''}
            {offer.durationMonths ? ` · ${offer.durationMonths} months` : ''}
          </div>
        </div>
        <select
          value={offer.status}
          disabled={disabled}
          onChange={(event) => onStatusChange(event.target.value as OfferStatus)}
          className="h-8 px-2 bg-bone-50 border border-ink-900/15 text-xs font-mono focus:outline-none"
        >
          {offerStatusOptions.map((status) => (
            <option key={status} value={status}>
              {prettyEnum(status)}
            </option>
          ))}
        </select>
      </div>
      {offer.description && <p className="mt-2 text-sm text-ink-900/70">{offer.description}</p>}
    </div>
  )
}

function ResolveCaseModal({
  open,
  mode,
  interventionCase,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: 'RESOLVED' | 'CLOSED'
  interventionCase: {
    outreachLogs?: NonNullable<InterventionCase['outreachLogs']>
    retentionOffers?: NonNullable<InterventionCase['retentionOffers']>
    resolutionOutcome: CaseResolutionOutcome | null
    resolutionNote: string | null
    finalOutreachLogId: string | null
    finalOfferId: string | null
  }
  saving?: boolean
  onClose: () => void
  onSubmit: (payload: UpdateCaseInput) => Promise<void>
}) {
  const [outcome, setOutcome] = useState<CaseResolutionOutcome>(
    interventionCase.resolutionOutcome ?? 'RETAINED',
  )
  const [note, setNote] = useState(interventionCase.resolutionNote ?? '')
  const [finalOutreachLogId, setFinalOutreachLogId] = useState(
    interventionCase.finalOutreachLogId ?? '',
  )
  const [finalOfferId, setFinalOfferId] = useState(interventionCase.finalOfferId ?? '')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setOutcome(interventionCase.resolutionOutcome ?? 'RETAINED')
    setNote(interventionCase.resolutionNote ?? '')
    setFinalOutreachLogId(interventionCase.finalOutreachLogId ?? '')
    setFinalOfferId(interventionCase.finalOfferId ?? '')
    setLocalError(null)
  }, [
    interventionCase.finalOfferId,
    interventionCase.finalOutreachLogId,
    interventionCase.resolutionNote,
    interventionCase.resolutionOutcome,
    open,
  ])

  if (!open) return null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedNote = note.trim()
    if (!trimmedNote) {
      setLocalError('Resolution note is required.')
      return
    }

    setLocalError(null)
    await onSubmit({
      status: mode,
      resolutionOutcome: outcome,
      resolutionNote: trimmedNote,
      finalOutreachLogId: finalOutreachLogId || null,
      finalOfferId: finalOfferId || null,
    })
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="pointer-events-auto w-full max-w-2xl bg-bone-50 border border-ink-900/15 shadow-2xl"
      >
        <div className="px-6 py-5 border-b border-ink-900/10 flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-900/55 font-mono">
              {mode === 'RESOLVED' ? 'Resolve case' : 'Close case'}
            </span>
            <h3 className="mt-1 font-display text-2xl text-ink-900">
              Confirm final outcome
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-900/45 hover:text-ink-900"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <SelectField
            label="Final outcome"
            value={outcome}
            options={resolutionOutcomes}
            disabled={saving}
            onChange={(value) => setOutcome(value as CaseResolutionOutcome)}
          />

          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">
              Resolution note
            </span>
            <textarea
              required
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className="mt-1.5 w-full border border-ink-900/15 bg-bone-50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ink-900"
              placeholder="Summarize what happened and why this case can be resolved."
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Final outreach"
              value={finalOutreachLogId}
              options={[
                '',
                ...(interventionCase.outreachLogs ?? []).map((log) => log.id),
              ]}
              disabled={saving}
              onChange={setFinalOutreachLogId}
              display={(value) => {
                if (!value) return 'None selected'
                const log = interventionCase.outreachLogs?.find((item) => item.id === value)
                return log
                  ? `${prettyEnum(log.channel)} · ${prettyEnum(log.outcome)}`
                  : value
              }}
            />
            <SelectField
              label="Final offer"
              value={finalOfferId}
              options={[
                '',
                ...(interventionCase.retentionOffers ?? []).map((offer) => offer.id),
              ]}
              disabled={saving}
              onChange={setFinalOfferId}
              display={(value) => {
                if (!value) return 'None selected'
                const offer = interventionCase.retentionOffers?.find((item) => item.id === value)
                return offer ? `${offer.title} · ${prettyEnum(offer.status)}` : value
              }}
            />
          </div>

          {(finalOutreachLogId || finalOfferId) && (
            <div className="border border-ink-900/10 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/45">
                Resolution summary
              </div>
              {finalOutreachLogId && (
                <p className="mt-2 text-sm text-ink-900/70">
                  Outreach: {describeOutreach(interventionCase, finalOutreachLogId)}
                </p>
              )}
              {finalOfferId && (
                <p className="mt-1 text-sm text-ink-900/70">
                  Offer: {describeOffer(interventionCase, finalOfferId)}
                </p>
              )}
            </div>
          )}

          {localError && <div className="text-xs text-rust-500 font-mono">{localError}</div>}
        </div>

        <div className="flex border-t border-ink-900/10">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 text-xs font-mono uppercase tracking-wider text-ink-900/65 hover:bg-ink-900/[0.03] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 text-xs font-mono uppercase tracking-wider bg-ink-900 text-bone-50 disabled:opacity-50"
          >
            {saving ? 'Saving...' : mode === 'RESOLVED' ? 'Resolve case' : 'Close case'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/45">
        {label}
      </div>
      <div className="mt-1 text-sm text-ink-900/80">{value}</div>
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  disabled,
  onChange,
  display,
}: {
  label: string
  value: string
  options: string[]
  disabled?: boolean
  onChange: (value: string) => void
  display?: (value: string) => string
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full border border-ink-900/15 bg-bone-50 px-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ink-900 disabled:opacity-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {display ? display(option) : prettyEnum(option)}
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
  tone?: 'default' | 'danger' | 'success'
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center px-2 text-[10px] font-mono uppercase tracking-[0.12em]',
        tone === 'danger' && 'bg-rust-500/10 text-rust-600',
        tone === 'success' && 'bg-moss-500/10 text-moss-700',
        tone === 'default' && 'bg-ink-900/5 text-ink-900/65',
      )}
    >
      {children}
    </span>
  )
}

function statusTone(status: CaseStatus): 'default' | 'danger' | 'success' {
  if (status === 'RESOLVED') return 'success'
  if (status === 'CLOSED') return 'default'
  if (status === 'OPEN') return 'danger'
  return 'default'
}

function prettyEnum(value: string) {
  return value.replace(/_/g, ' ')
}

function describeOutreach(
  interventionCase: {
    outreachLogs?: NonNullable<InterventionCase['outreachLogs']>
  },
  id: string,
) {
  const log = interventionCase.outreachLogs?.find((item) => item.id === id)
  if (!log) return id
  return `${prettyEnum(log.channel)} · ${prettyEnum(log.outcome)} · ${new Date(
    log.createdAt,
  ).toLocaleDateString()}`
}

function describeOffer(
  interventionCase: {
    retentionOffers?: NonNullable<InterventionCase['retentionOffers']>
  },
  id: string,
) {
  const offer = interventionCase.retentionOffers?.find((item) => item.id === id)
  if (!offer) return id
  return `${offer.title} · ${prettyEnum(offer.status)}`
}
