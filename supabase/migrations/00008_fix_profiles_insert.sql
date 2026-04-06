-- ================================
-- Migration: 00008_fix_profiles_insert
-- Allow the auth trigger to insert new profiles
-- ================================

-- The handle_new_user() trigger runs as security definer (owner) but still
-- needs an RLS policy permitting the insert. Add one that allows inserting
-- a profile whose id matches the authenticated user being created.
create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);
