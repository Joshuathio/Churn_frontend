import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// In-memory only — when the Express backend exists, swap fetches in here.
// Browser storage APIs are intentionally avoided.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  async function login(email: string, _password: string) {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setUser({
      id: 'u_1',
      name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: 'CS Agent',
    })
    setLoading(false)
  }

  async function signup(name: string, email: string, _password: string) {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setUser({ id: 'u_new', name, email, role: 'CS Agent' })
    setLoading(false)
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
