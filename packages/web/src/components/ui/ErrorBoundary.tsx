import { Component, type ReactNode, type ErrorInfo } from 'react'

// ================================
// ErrorBoundary
// Class component — required by React for error boundaries.
// Catches render errors and shows a friendly fallback UI.
//
// Usage:
//   <ErrorBoundary>
//     <App />
//   </ErrorBoundary>
//
//   <ErrorBoundary fallback={<p>Custom fallback</p>}>
//     <RiskyComponent />
//   </ErrorBoundary>
// ================================

interface Props {
  children: ReactNode
  /** Optional custom fallback. Receives reset() to clear the error. */
  fallback?: (reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.reset = this.reset.bind(this)
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in development; swap for a real error service in prod
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack)
  }

  reset() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback(this.reset)
    }

    return <DefaultFallback error={this.state.error} onReset={this.reset} />
  }
}

// ── Default fallback UI ───────────────────────────────────

function DefaultFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Japanese decorative character */}
        <p className="font-serif text-7xl font-bold text-border select-none">
          エラー
        </p>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-text">
            Something went wrong
          </h1>
          <p className="text-text-muted font-sans text-sm">
            An unexpected error occurred. Your progress may not have been saved.
          </p>
        </div>

        {/* Error details (dev only) */}
        {import.meta.env.DEV && error && (
          <details className="text-left bg-red-50 border border-red-200 rounded-lg p-4">
            <summary className="text-sm font-sans font-medium text-red-700 cursor-pointer">
              Error details
            </summary>
            <pre className="mt-2 text-xs text-red-600 overflow-auto whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <a
            href="/"
            className="px-4 py-2 rounded-lg border-2 border-border bg-surface
                       text-text font-sans text-sm font-medium
                       hover:border-accent transition-colors"
          >
            Go home
          </a>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg border-2 border-primary bg-primary
                       text-white font-sans text-sm font-medium
                       hover:bg-primary-hover transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
