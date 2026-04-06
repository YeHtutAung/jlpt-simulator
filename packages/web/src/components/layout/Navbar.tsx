import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const user     = useAuthStore(s => s.user)
  const signOut  = useAuthStore(s => s.signOut)
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-sm
                        border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-serif font-bold text-primary
                           group-hover:opacity-80 transition-opacity">
            JLPT
          </span>
          <span className="text-sm font-sans text-text-muted
                           hidden sm:block">
            Simulator
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-sans text-text-muted hover:text-text
                           px-3 py-1.5 rounded-lg hover:bg-bg transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm text-text-muted hidden sm:block">
                {user.display_name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
