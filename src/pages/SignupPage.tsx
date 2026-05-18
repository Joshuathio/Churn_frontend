import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Wordmark } from '@/components/Wordmark'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function SignupPage() {
  const { signup, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) {
      setError('All fields are required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      await signup(name, email, password)
      navigate('/')
    } catch {
      setError('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr]">
      {/* Left — form column */}
      <div className="flex items-center justify-center px-8 lg:px-16 py-12 bg-bone-50 order-2 lg:order-1">
        <div className="w-full max-w-sm animate-rise">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/60">
            01 · Create account
          </span>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-ink-900">
            Join ChurnAi
          </h2>
          <p className="mt-2 text-sm text-ink-900/60">
            Start protecting your subscriber base.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <Field
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Joshua Christian"
              autoComplete="name"
            />
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              autoComplete="email"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <Field
                label="Confirm"
                type="password"
                value={confirm}
                onChange={setConfirm}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="text-xs text-rust-500 font-mono">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'group w-full h-12 flex items-center justify-between px-4',
                'bg-ink-900 text-bone-50 text-sm font-mono uppercase tracking-wider',
                'hover:bg-ember-600 transition-colors',
                'disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            >
              <span>{loading ? 'Creating…' : 'Create account'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-900/10 text-sm text-ink-900/65">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-ink-900 underline underline-offset-4 decoration-ember-500 decoration-2 hover:text-ember-600 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right — editorial column */}
      <div className="relative bg-ink-900 text-bone-50 px-10 lg:px-16 py-12 flex flex-col overflow-hidden order-1 lg:order-2">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-moss-500 blur-[120px] opacity-30"
        />

        <div className="relative z-10 flex flex-col h-full">
          <Wordmark size="md" variant="light" />

          <div className="flex-1 flex flex-col justify-center max-w-lg animate-rise">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-moss-400 mb-6">
              Built for ChurnAi teams
            </span>
            <h1 className="font-display text-5xl lg:text-6xl leading-[0.95] tracking-tight text-balance">
              Every customer{' '}
              <span className="italic font-light text-moss-400">has</span> a story.
              <br />
              We help you finish it.
            </h1>

            <ol className="mt-10 space-y-5 max-w-md">
              {[
                { n: '01', t: 'Ingest', d: 'Your customer data flows through our Express API.' },
                { n: '02', t: 'Predict', d: 'A Random Forest model scores churn risk in milliseconds.' },
                { n: '03', t: 'Act', d: 'Your team sees the top reasons — and intervenes before churn.' },
              ].map((s) => (
                <li key={s.n} className="flex gap-5 items-start">
                  <span className="font-mono text-xs text-moss-400 mt-1">{s.n}</span>
                  <div>
                    <div className="font-display text-xl text-bone-50">{s.t}</div>
                    <div className="text-sm text-bone-300/80 mt-0.5">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-300/50">
            <div className="rule mb-4 opacity-30" />
            Powered by scikit-learn · FastAPI · React
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-ink-900/55">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          'mt-2 w-full h-11 px-0 bg-transparent',
          'border-0 border-b border-ink-900/20',
          'text-base text-ink-900 placeholder:text-ink-900/30',
          'focus:outline-none focus:border-ink-900 transition-colors',
        )}
      />
    </label>
  )
}
