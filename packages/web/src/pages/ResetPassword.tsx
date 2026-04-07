import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

type PageState = 'waiting' | 'ready' | 'expired' | 'success'

export function ResetPassword() {
  const [pageState, setPageState] = useState<PageState>('waiting')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)

  useEffect(() => {
    // Supabase JS v2 parses the URL hash on load and emits PASSWORD_RECOVERY
    // when the user arrives via a valid reset link. Give it 3 s to fire.
    const timeout = setTimeout(() => {
      setPageState(prev => prev === 'waiting' ? 'expired' : prev)
    }, 3000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        clearTimeout(timeout)
        setPageState('ready')
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
    } else {
      setPageState('success')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link to="/">
            <span className="font-serif text-3xl font-bold text-primary">JLPT</span>
          </Link>
          <p className="text-text-muted font-sans text-sm mt-1">Reset your password</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-7 shadow-sm space-y-5">

          {pageState === 'waiting' && (
            <div className="flex items-center justify-center py-6 gap-3">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
              <p className="text-sm text-text-muted font-sans">Verifying link…</p>
            </div>
          )}

          {pageState === 'expired' && (
            <div className="text-center space-y-3 py-2">
              <div className="text-4xl">⚠️</div>
              <h2 className="font-sans font-semibold text-text text-lg">Invalid or expired link</h2>
              <p className="text-sm text-text-muted font-sans">
                This reset link has expired or is invalid. Request a new one from the login page.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm text-accent hover:underline font-medium font-sans mt-1"
              >
                Back to sign in
              </Link>
            </div>
          )}

          {pageState === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {[
                { id: 'password', label: 'New Password', type: 'password',
                  value: password, onChange: setPassword,
                  placeholder: 'Min. 8 characters', autoComplete: 'new-password' },
                { id: 'confirm', label: 'Confirm Password', type: 'password',
                  value: confirm, onChange: setConfirm,
                  placeholder: 'Repeat new password', autoComplete: 'new-password' },
              ].map(field => (
                <div key={field.id} className="space-y-1.5">
                  <label
                    className="text-sm font-sans font-medium text-text"
                    htmlFor={field.id}
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    required
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-border
                               bg-bg font-sans text-text text-sm
                               focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              ))}

              {error && (
                <p className="text-sm text-error font-sans bg-red-50 dark:bg-error/10 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Set New Password
              </Button>
            </form>
          )}

          {pageState === 'success' && (
            <div className="text-center space-y-3 py-2">
              <div className="text-4xl">✅</div>
              <h2 className="font-sans font-semibold text-text text-lg">Password updated!</h2>
              <p className="text-sm text-text-muted font-sans">
                Your password has been changed. You can now sign in with your new password.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm text-accent hover:underline font-medium font-sans mt-1"
              >
                Sign in
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
