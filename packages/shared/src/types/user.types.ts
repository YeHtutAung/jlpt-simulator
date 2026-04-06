// ================================
// User Types
// ================================

export type UserRole = 'user' | 'admin'

export interface UserProfile {
  id: string
  email: string
  display_name: string
  role: UserRole
  created_at: string
  avatar_url?: string
}

export interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}
