import { useState, useEffect, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type {
  ContractType,
  InternetService,
  PaymentMethod,
  ServiceOption,
  MultipleLinesOption,
  YesNo,
  Gender,
} from '@/types'
import type { CustomerInput, CustomerWithName } from '@/lib/api'
import { cn } from '@/lib/utils'

interface CustomerFormProps {
  open: boolean
  initial: CustomerWithName | null // null = create mode
  loading?: boolean
  error?: string | null
  onSubmit: (payload: CustomerInput) => void
  onClose: () => void
}

const emptyForm: CustomerInput = {
  displayName: '',
  gender: 'Male',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 1,
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 0,
  TotalCharges: 0,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
}

function customerToInput(c: CustomerWithName): CustomerInput {
  return {
    displayName: c.displayName,
    gender: c.gender,
    SeniorCitizen: c.SeniorCitizen,
    Partner: c.Partner,
    Dependents: c.Dependents,
    tenure: c.tenure,
    Contract: c.Contract,
    PaperlessBilling: c.PaperlessBilling,
    PaymentMethod: c.PaymentMethod,
    MonthlyCharges: c.MonthlyCharges,
    TotalCharges: c.TotalCharges,
    PhoneService: c.PhoneService,
    MultipleLines: c.MultipleLines,
    InternetService: c.InternetService,
    OnlineSecurity: c.OnlineSecurity,
    OnlineBackup: c.OnlineBackup,
    DeviceProtection: c.DeviceProtection,
    TechSupport: c.TechSupport,
    StreamingTV: c.StreamingTV,
    StreamingMovies: c.StreamingMovies,
  }
}

export function CustomerForm({ open, initial, loading, error, onSubmit, onClose }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerInput>(emptyForm)
  const isEdit = initial !== null

  // Sync form whenever drawer opens or initial changes
  useEffect(() => {
    if (!open) return
    setForm(initial ? customerToInput(initial) : emptyForm)
  }, [open, initial])

  if (!open) return null

  function set<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  // Auto-cascade internet service options
  const hasInternet = form.InternetService !== 'No'
  const internetServiceValue: ServiceOption = hasInternet ? 'No' : 'No internet service'

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-rise"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl bg-bone-50 overflow-y-auto animate-rise flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bone-50 border-b border-ink-900/10 px-7 py-5 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-900/55 font-mono">
              {isEdit ? 'Edit customer' : 'New customer'}
            </span>
            <h2 className="mt-1 font-display text-2xl tracking-tight text-ink-900">
              {isEdit ? initial?.displayName : 'Add a record'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-900/50 hover:text-ink-900 transition-colors p-1 -mr-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-7 py-6 space-y-8">
          {/* Identity */}
          <Section title="Identity">
            <Text
              label="Full name"
              value={form.displayName}
              onChange={(v) => set('displayName', v)}
              required
            />
          </Section>

          {/* Demographics */}
          <Section title="Demographics">
            <Grid>
              <Select<Gender>
                label="Gender"
                value={form.gender}
                onChange={(v) => set('gender', v)}
                options={['Male', 'Female']}
              />
              <Select<'0' | '1'>
                label="Senior citizen"
                value={String(form.SeniorCitizen) as '0' | '1'}
                onChange={(v) => set('SeniorCitizen', v === '1' ? 1 : 0)}
                options={['0', '1']}
                display={(v) => (v === '1' ? 'Yes' : 'No')}
              />
              <Select<YesNo>
                label="Partner"
                value={form.Partner}
                onChange={(v) => set('Partner', v)}
                options={['Yes', 'No']}
              />
              <Select<YesNo>
                label="Dependents"
                value={form.Dependents}
                onChange={(v) => set('Dependents', v)}
                options={['Yes', 'No']}
              />
            </Grid>
          </Section>

          {/* Account */}
          <Section title="Account">
            <Grid>
              <Number
                label="Tenure (months)"
                value={form.tenure}
                onChange={(v) => set('tenure', v)}
                min={0}
              />
              <Select<ContractType>
                label="Contract"
                value={form.Contract}
                onChange={(v) => set('Contract', v)}
                options={['Month-to-month', 'One year', 'Two year']}
              />
              <Number
                label="Monthly charges"
                value={form.MonthlyCharges}
                onChange={(v) => set('MonthlyCharges', v)}
                step={0.01}
                min={0}
              />
              <Number
                label="Total charges"
                value={form.TotalCharges}
                onChange={(v) => set('TotalCharges', v)}
                step={0.01}
                min={0}
              />
              <Select<YesNo>
                label="Paperless billing"
                value={form.PaperlessBilling}
                onChange={(v) => set('PaperlessBilling', v)}
                options={['Yes', 'No']}
              />
              <Select<PaymentMethod>
                label="Payment method"
                value={form.PaymentMethod}
                onChange={(v) => set('PaymentMethod', v)}
                options={[
                  'Electronic check',
                  'Mailed check',
                  'Bank transfer (automatic)',
                  'Credit card (automatic)',
                ]}
              />
            </Grid>
          </Section>

          {/* Services */}
          <Section title="Services">
            <Grid>
              <Select<YesNo>
                label="Phone service"
                value={form.PhoneService}
                onChange={(v) => {
                  set('PhoneService', v)
                  if (v === 'No') set('MultipleLines', 'No phone service')
                  else if (form.MultipleLines === 'No phone service') set('MultipleLines', 'No')
                }}
                options={['Yes', 'No']}
              />
              <Select<MultipleLinesOption>
                label="Multiple lines"
                value={form.MultipleLines}
                onChange={(v) => set('MultipleLines', v)}
                disabled={form.PhoneService === 'No'}
                options={
                  form.PhoneService === 'No'
                    ? ['No phone service']
                    : ['Yes', 'No']
                }
              />
              <Select<InternetService>
                label="Internet service"
                value={form.InternetService}
                onChange={(v) => {
                  set('InternetService', v)
                  // Cascade dependent fields
                  const cascade: ServiceOption = v === 'No' ? 'No internet service' : 'No'
                  set('OnlineSecurity', cascade)
                  set('OnlineBackup', cascade)
                  set('DeviceProtection', cascade)
                  set('TechSupport', cascade)
                  set('StreamingTV', cascade)
                  set('StreamingMovies', cascade)
                }}
                options={['DSL', 'Fiber optic', 'No']}
              />
              {(
                [
                  ['OnlineSecurity', 'Online security'],
                  ['OnlineBackup', 'Online backup'],
                  ['DeviceProtection', 'Device protection'],
                  ['TechSupport', 'Tech support'],
                  ['StreamingTV', 'Streaming TV'],
                  ['StreamingMovies', 'Streaming movies'],
                ] as const
              ).map(([key, label]) => (
                <Select<ServiceOption>
                  key={key}
                  label={label}
                  value={form[key]}
                  onChange={(v) => set(key, v)}
                  disabled={!hasInternet}
                  options={hasInternet ? ['Yes', 'No'] : [internetServiceValue]}
                />
              ))}
            </Grid>
          </Section>

          {error && (
            <div className="text-xs text-rust-500 font-mono border-l-2 border-rust-500 pl-3 py-1">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bone-50 border-t border-ink-900/10 px-7 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 text-sm font-mono uppercase tracking-wider border border-ink-900/15 text-ink-900 hover:bg-ink-900/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 text-sm font-mono uppercase tracking-wider bg-ink-900 text-bone-50 hover:bg-ember-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create customer'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── form primitives ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-[0.18em] text-ink-900/55 font-mono mb-4">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-5 gap-y-4">{children}</div>
}

function Text({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">
        {label}
      </span>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'mt-1.5 w-full h-10 px-3 bg-bone-50',
          'border border-ink-900/15 text-sm text-ink-900',
          'focus:outline-none focus:border-ink-900 transition-colors',
        )}
      />
    </label>
  )
}

function Number({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        step={step ?? 1}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={cn(
          'mt-1.5 w-full h-10 px-3 bg-bone-50 tabular font-mono',
          'border border-ink-900/15 text-sm text-ink-900',
          'focus:outline-none focus:border-ink-900 transition-colors',
        )}
      />
    </label>
  )
}

function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  display,
  disabled,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: T[]
  display?: (v: T) => string
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-ink-900/55">
        {label}
      </span>
      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          disabled={disabled}
          className={cn(
            'w-full h-10 px-3 pr-8 bg-bone-50',
            'border border-ink-900/15 text-sm text-ink-900 font-mono',
            'focus:outline-none focus:border-ink-900 transition-colors',
            'appearance-none cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {display ? display(o) : o}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-900/40 text-xs">
          ▾
        </span>
      </div>
    </label>
  )
}
