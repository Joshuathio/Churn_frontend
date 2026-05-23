import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, BarChart3, Settings, LogOut } from 'lucide-react'
import { Wordmark } from './Wordmark'
import { useAuth } from '@/context/AuthContext'
import { cn, initials } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 flex-shrink-0 border-r border-ink-900/10 bg-bone-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-ink-900/10">
        <Wordmark size="md" />
        <div className="mt-3 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-900/45">
            Churn Intelligence
          </span>
          <span className="font-mono text-[10px] text-ember-600 bg-ember-500/10 px-1.5 py-px">
            v0.1
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 text-sm transition-colors relative',
                isActive
                  ? 'text-ink-900 bg-bone-50'
                  : 'text-ink-900/65 hover:text-ink-900 hover:bg-bone-50/60',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-ember-500"
                  />
                )}
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-ink-900/10">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 flex items-center justify-center bg-ink-900 text-bone-50 text-[10px] font-mono">
              {initials(user.name)}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm text-ink-900 truncate">{user.name}</span>
              <span className="text-[10px] font-mono text-ink-900/55 truncate">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="text-ink-900/50 hover:text-rust-500 transition-colors p-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
