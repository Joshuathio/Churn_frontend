import { useAuth } from '@/context/AuthContext'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8 max-w-2xl animate-rise">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/55">
          Workspace
        </span>
        <h1 className="mt-2 font-display text-5xl tracking-tight text-ink-900">
          Settings
        </h1>
      </header>

      <section className="bg-bone-50 border border-ink-900/10 p-6">
        <h3 className="font-display text-xl text-ink-900 mb-1">Profile</h3>
        <p className="text-xs text-ink-900/55 mb-6">Your account information</p>
        <dl className="space-y-4">
          {[
            { k: 'Name', v: user?.name ?? '—' },
            { k: 'Email', v: user?.email ?? '—' },
            { k: 'Role', v: user?.role ?? '—' },
            { k: 'User ID', v: user?.id ?? '—' },
          ].map((r) => (
            <div key={r.k} className="flex justify-between items-baseline gap-6 py-2 border-b border-ink-900/5 last:border-0">
              <dt className="text-[10px] uppercase tracking-[0.18em] font-mono text-ink-900/55">
                {r.k}
              </dt>
              <dd className="text-sm text-ink-900 font-mono tabular text-right">{r.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-bone-50 border border-ink-900/10 p-6">
        <h3 className="font-display text-xl text-ink-900 mb-1">Model</h3>
        <p className="text-xs text-ink-900/55 mb-6">Current ML pipeline configuration</p>
        <dl className="space-y-4">
          {[
            { k: 'Algorithm', v: 'Random Forest Classifier' },
            { k: 'Backend API', v: 'Flask · localhost:5000' },
            { k: 'Dataset', v: 'Telco Customer Churn · 7,043 rows' },
            { k: 'Target recall', v: '≥ 80%' },
            { k: 'Latency target', v: '< 2s per request' },
          ].map((r) => (
            <div key={r.k} className="flex justify-between items-baseline gap-6 py-2 border-b border-ink-900/5 last:border-0">
              <dt className="text-[10px] uppercase tracking-[0.18em] font-mono text-ink-900/55">
                {r.k}
              </dt>
              <dd className="text-sm text-ink-900 font-mono text-right">{r.v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
