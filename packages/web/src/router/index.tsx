import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { ExamSelect } from '@/pages/ExamSelect'
import { ExamSession } from '@/pages/ExamSession'
import { Results } from '@/pages/Results'
import { Review } from '@/pages/Review'
import { Dashboard } from '@/pages/Dashboard'
import { NotFound } from '@/pages/NotFound'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useAuthStore } from '@/store/authStore'

// Guard for protected routes
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  const isLoading = useAuthStore(s => s.isLoading)

  if (isLoading) return <div className="flex h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/exam/:examId',
    element: <RequireAuth><ExamSelect /></RequireAuth>,
  },
  {
    path: '/exam/:examId/session',
    element: (
      <RequireAuth>
        <ErrorBoundary>
          <ExamSession />
        </ErrorBoundary>
      </RequireAuth>
    ),
  },
  {
    path: '/results/:attemptId',
    element: <RequireAuth><Results /></RequireAuth>,
  },
  {
    path: '/review/:attemptId',
    element: <RequireAuth><Review /></RequireAuth>,
  },
  {
    path: '/dashboard',
    element: <RequireAuth><Dashboard /></RequireAuth>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
