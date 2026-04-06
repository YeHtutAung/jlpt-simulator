import { Link } from 'react-router-dom'

// ================================
// 404 Not Found page
// ================================

export function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        {/* 404 in kanji — decorative */}
        <p className="font-serif text-8xl font-bold text-border select-none leading-none">
          四百四
        </p>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-text">
            Page not found
          </h1>
          <p className="text-text-muted font-sans">
            ページが見つかりませんでした
          </p>
          <p className="text-text-muted font-sans text-sm">
            The page you were looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-lg border-2 border-primary
                     bg-primary text-white font-sans font-medium text-sm
                     hover:bg-primary-hover transition-colors"
        >
          Back to home
        </Link>

      </div>
    </div>
  )
}
