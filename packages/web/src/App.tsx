import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAuthStore } from './store/authStore'
import { ToastContainer } from './components/ui/Toast'

export function App() {
  const initialize = useAuthStore(s => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  )
}
