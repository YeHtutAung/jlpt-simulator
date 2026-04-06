-- ================================
-- Migration: 00009_fix_trigger_search_path
-- Recreate handle_new_user with explicit search_path so it can
-- resolve public.profiles when fired from the auth schema context
-- ================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Student')
  );
  return new;
end;
$$;
