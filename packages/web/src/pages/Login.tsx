import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export function Login() {
  const signIn    = useAuthStore(s => s.signIn)
  const user      = useAuthStore(s => s.user)
  const isLoading = useAuthStore(s => s.isLoading)
  const navigate  = useNavigate()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [error,      setError]      = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [resetSent,  setResetSent]  = useState(false)

  // Already logged in — go home
  if (!isLoading && user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address above first')
      return
    }
    setError(null)
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (resetError) {
      setError(resetError.message)
    } else {
      setResetSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <span className="font-serif text-3xl font-bold text-primary">JLPT</span>
          </Link>
          <p className="text-text-muted font-sans text-sm mt-1">Sign in to continue</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl border border-border p-7 shadow-sm space-y-5">

          {resetSent ? (
            <div className="text-center space-y-3 py-2">
              <div className="text-4xl">📧</div>
              <h2 className="font-sans font-semibold text-text text-lg">Check your email</h2>
              <p className="text-sm text-text-muted font-sans">
                We sent a password reset link to <strong className="text-text">{email}</strong>.
              </p>
              <button
                onClick={() => { setResetSent(false); setError(null) }}
                className="text-sm text-accent hover:underline font-medium font-sans"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-1.5">
                  <label className="text-sm font-sans font-medium text-text" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-border
                               bg-bg font-sans text-text text-sm
                               focus:outline-none focus:border-accent transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-sans font-medium text-text" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-border
                               bg-bg font-sans text-text text-sm
                               focus:outline-none focus:border-accent transition-colors"
                    placeholder="••••••••"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="text-sm text-primary hover:underline font-sans disabled:opacity-50"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-error font-sans bg-red-50 dark:bg-error/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Sign In
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-sm text-text-muted hover:text-primary hover:underline font-sans disabled:opacity-50"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>

              <p className="text-center text-sm text-text-muted font-sans">
                No account?{' '}
                <Link to="/register" className="text-accent hover:underline font-medium">
                  Register free
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
