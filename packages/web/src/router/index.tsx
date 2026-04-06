import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useAuthStore } from '@/store/authStore'

const Home       = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })))
const Login      = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const Register   = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })))
const ExamSelect = lazy(() => import('@/pages/ExamSelect').then(m => ({ default: m.ExamSelect })))
const ExamSession = lazy(() => import('@/pages/ExamSession').then(m => ({ default: m.ExamSession })))
const Results    = lazy(() => import('@/pages/Results').then(m => ({ default: m.Results })))
const Review     = lazy(() => import('@/pages/Review').then(m => ({ default: m.Review })))
const Dashboard  = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const NotFound   = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })))

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}

// Guard for protected routes
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  const isLoading = useAuthStore(s => s.isLoading)

  if (isLoading) return <PageLoader />

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<Home />),
  },
  {
    path: '/login',
    element: withSuspense(<Login />),
  },
  {
    path: '/register',
    element: withSuspense(<Register />),
  },
  {
    path: '/exam/:examId',
    element: withSuspense(<RequireAuth><ExamSelect /></RequireAuth>),
  },
  {
    path: '/exam/:examId/session',
    element: withSuspense(
      <RequireAuth>
        <ErrorBoundary>
          <ExamSession />
        </ErrorBoundary>
      </RequireAuth>
    ),
  },
  {
    path: '/results/:attemptId',
    element: withSuspense(<RequireAuth><Results /></RequireAuth>),
  },
  {
    path: '/review/:attemptId',
    element: withSuspense(<RequireAuth><Review /></RequireAuth>),
  },
  {
    path: '/dashboard',
    element: withSuspense(<RequireAuth><Dashboard /></RequireAuth>),
  },
  {
    path: '*',
    element: withSuspense(<NotFound />),
  },
])
