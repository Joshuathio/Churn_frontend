import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Wordmark } from '@/components/Wordmark'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function LoginPage() {
   const { login, loading } = useAuth()
   const navigate = useNavigate()
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [error, setError] = useState('')

   async function handleSubmit(e: FormEvent) {
      e.preventDefault()
      setError('')
      if (!email || !password) {
         setError('Both fields are required')
         return
      }
      try {
         await login(email, password)
         navigate('/')
      } catch {
         setError('Invalid credentials')
      }
   }

   return (
      <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
         {/* Left — editorial column */}
         <div className="relative bg-ink-900 text-bone-50 px-10 lg:px-16 py-12 flex flex-col overflow-hidden">
            {/* Decorative grid */}
            <div
               aria-hidden
               className="absolute inset-0 opacity-[0.07]"
               style={{
                  backgroundImage:
                     'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
               }}
            />
            {/* Ember glow */}
            <div
               aria-hidden
               className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-ember-500 blur-[120px] opacity-30"
            />

            <div className="relative z-10 flex flex-col h-full">
               <Wordmark size="md" variant="light" />

               <div className="flex-1 flex flex-col justify-center max-w-lg animate-rise">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ember-400 mb-6">
                     Churn Intelligence
                  </span>
                  <h1 className="font-display text-5xl lg:text-6xl leading-[0.95] tracking-tight text-balance">
                     Read the signal{' '}
                     <span className="italic font-light text-ember-400">before</span>
                     <br />
                     the silence.
                  </h1>
                  <p className="mt-7 text-bone-300 text-base leading-relaxed max-w-md">
                     A predictive workspace for ChurnAi teams. Surface the customers
                     most likely to leave, understand why, and act in time to keep them.
                  </p>

                  <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
                     <Stat value="21" label="Features per customer" />
                     <Stat value="80%" label="Target recall" />
                     <Stat value="<2s" label="Inference latency" />
                  </div>
               </div>

               <div className="relative z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-300/50">
                  <div className="rule mb-4 opacity-30" />
                  Kelompok 1 · Universitas Bina Nusantara · 2026
               </div>
            </div>
         </div>

         {/* Right — form column */}
         <div className="flex items-center justify-center px-8 lg:px-16 py-12 bg-bone-50">
            <div className="w-full max-w-sm animate-rise">
               <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-900/60">
                  01 · Authenticate
               </span>
               <h2 className="mt-3 font-display text-4xl tracking-tight text-ink-900">
                  Sign in
               </h2>
               <p className="mt-2 text-sm text-ink-900/60">
                  Access your ChurnAi workspace.
               </p>

               <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                  <Field
                     label="Email"
                     type="email"
                     value={email}
                     onChange={setEmail}
                     placeholder="agent@ChurnAi.io"
                     autoComplete="email"
                  />
                  <Field
                     label="Password"
                     type="password"
                     value={password}
                     onChange={setPassword}
                     placeholder="••••••••"
                     autoComplete="current-password"
                  />

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
                     <span>{loading ? 'Signing in…' : 'Continue'}</span>
                     <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
               </form>

               <div className="mt-8 pt-6 border-t border-ink-900/10 text-sm text-ink-900/65">
                  New here?{' '}
                  <Link
                     to="/signup"
                     className="text-ink-900 underline underline-offset-4 decoration-ember-500 decoration-2 hover:text-ember-600 transition-colors"
                  >
                     Create an account
                  </Link>
               </div>
            </div>
         </div>
      </div>
   )
}

function Stat({ value, label }: { value: string; label: string }) {
   return (
      <div className="flex flex-col">
         <span className="font-display text-3xl text-bone-50 tabular leading-none">
            {value}
         </span>
         <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-bone-300/70 leading-tight">
            {label}
         </span>
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
