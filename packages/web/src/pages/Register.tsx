import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'

export function Register() {
  const signUp   = useAuthStore(s => s.signUp)
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [error,       setError]       = useState<string | null>(null)
  const [loading,     setLoading]     = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await signUp(email, password, displayName)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <Link to="/">
            <span className="font-serif text-3xl font-bold text-primary">JLPT</span>
          </Link>
          <p className="text-text-muted font-sans text-sm mt-1">
            Create your free account
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-7 shadow-sm
                         space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {[
              { id: 'name',     label: 'Display Name', type: 'text',
                value: displayName, onChange: setDisplayName,
                placeholder: 'Your name', autoComplete: 'name' },
              { id: 'email',    label: 'Email',        type: 'email',
                value: email,       onChange: setEmail,
                placeholder: 'you@example.com', autoComplete: 'email' },
              { id: 'password', label: 'Password',     type: 'password',
                value: password,    onChange: setPassword,
                placeholder: 'Min. 8 characters', autoComplete: 'new-password' },
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
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted font-sans">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
