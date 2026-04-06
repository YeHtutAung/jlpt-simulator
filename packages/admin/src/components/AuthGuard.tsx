import { useEffect } from 'react'
import { useAdminStore } from '../store/adminStore'

// ================================
// AuthGuard — wraps the entire admin app
// States: loading → unauthenticated (login form) → unauthorized → admin (render children)
// ================================

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const authState  = useAdminStore(s => s.authState)
  const initialize = useAdminStore(s => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-[var(--color-text-muted)] text-sm">Checking access…</div>
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return <LoginScreen />
  }

  if (authState === 'unauthorized') {
    return <AccessDeniedScreen />
  }

  // authState === 'admin'
  return <>{children}</>
}

// ── Login form ────────────────────────────────────────────

function LoginScreen() {
  const email     = useAdminStore(s => s.email)
  const password  = useAdminStore(s => s.password)
  const error     = useAdminStore(s => s.error)
  const authState = useAdminStore(s => s.authState)
  const setEmail    = useAdminStore(s => s.setEmail)
  const setPassword = useAdminStore(s => s.setPassword)
  const signIn      = useAdminStore(s => s.signIn)

  const isLoading = authState === 'loading'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await signIn()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">JLPT Admin</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[var(--color-border)] p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                disabled:opacity-50"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] text-sm
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--color-error)] bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg
              hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Access denied ─────────────────────────────────────────

function AccessDeniedScreen() {
  const signOut = useAdminStore(s => s.signOut)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center space-y-4 max-w-sm">
        <div className="text-5xl">🚫</div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Access Denied</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Your account does not have admin privileges.
          Contact a super admin to grant access.
        </p>
        <button
          onClick={signOut}
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
