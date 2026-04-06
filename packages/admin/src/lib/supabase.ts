import { createClient } from '@supabase/supabase-js'

// ================================
// Admin Supabase Client
// Uses SERVICE ROLE KEY — never expose this to end users
// Only used server-side or in this admin-only deployment
// ================================

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      as string
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY env var.\n' +
    'Copy .env.example to .env and fill in the values.'
  )
}

// Service role client — bypasses RLS for admin operations
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})
