import { create } from 'zustand'
import { supabaseAdmin } from '../lib/supabase'

// ================================
// Admin Auth Store
// Checks Supabase auth + profiles.role = 'admin'
// ================================

type AuthState = 'loading' | 'unauthenticated' | 'unauthorized' | 'admin'

interface AdminStore {
  authState: AuthState
  email:     string
  password:  string
  error:     string | null

  setEmail:    (email: string) => void
  setPassword: (password: string) => void
  initialize:  () => Promise<void>
  signIn:      () => Promise<void>
  signOut:     () => Promise<void>
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  authState: 'loading',
  email:     '',
  password:  '',
  error:     null,

  setEmail:    (email)    => set({ email }),
  setPassword: (password) => set({ password }),

  initialize: async () => {
    set({ authState: 'loading' })

    const { data: { session } } = await supabaseAdmin.auth.getSession()

    if (!session?.user) {
      set({ authState: 'unauthenticated' })
      return
    }

    await checkAdminRole(session.user.id, set)
  },

  signIn: async () => {
    const { email, password } = get()
    set({ error: null, authState: 'loading' })

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      set({ authState: 'unauthenticated', error: error?.message ?? 'Sign in failed' })
      return
    }

    await checkAdminRole(data.user.id, set)
  },

  signOut: async () => {
    await supabaseAdmin.auth.signOut()
    set({ authState: 'unauthenticated', email: '', password: '', error: null })
  },
}))

async function checkAdminRole(
  userId: string,
  set: (partial: Partial<AdminStore>) => void
) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    set({ authState: 'unauthenticated', error: 'Could not load profile' })
    return
  }

  if (profile.role !== 'admin') {
    set({ authState: 'unauthorized' })
    return
  }

  set({ authState: 'admin', error: null })
}
