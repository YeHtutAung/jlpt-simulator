import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUiStore, type Theme } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const user         = useAuthStore(s => s.user)
  const signOut      = useAuthStore(s => s.signOut)
  const theme        = useUiStore(s => s.theme)
  const toggleTheme  = useUiStore(s => s.toggleTheme)
  const navigate     = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          onClick={() => setMenuOpen(false)}
        >
          <span className="text-2xl font-serif font-bold text-primary
                           group-hover:opacity-80 transition-opacity">
            JLPT
          </span>
          <span className="text-sm font-sans text-text-muted hidden sm:block">
            Simulator
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-sans text-text-muted hover:text-text
                           px-3 py-1.5 rounded-lg hover:bg-bg transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm text-text-muted">{user.display_name}</span>
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
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </nav>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-2 rounded-lg text-text-muted hover:text-text
                       hover:bg-bg transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden bg-surface border-b border-border px-4 py-3 space-y-1">
          {user ? (
            <>
              <p className="text-xs text-text-muted font-sans px-2 py-1 select-none">
                {user.display_name}
              </p>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-left text-sm font-sans text-text-muted
                           hover:text-text px-2 py-2 rounded-lg hover:bg-bg transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left text-sm font-sans text-text-muted
                           hover:text-text px-2 py-2 rounded-lg hover:bg-bg transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-sm font-sans text-text px-2 py-2
                           rounded-lg hover:bg-bg transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-sm font-sans font-medium text-primary
                           px-2 py-2 rounded-lg hover:bg-bg transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}

// ── Theme toggle button ───────────────────────────────────

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg text-text-muted hover:text-text
                 hover:bg-bg transition-colors"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? (
        /* Sun icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Moon icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
