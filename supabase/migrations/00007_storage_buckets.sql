-- ================================
-- Migration: 00007_storage_buckets
-- ================================

-- Create storage buckets
insert into storage.buckets (id, name, public)
values
  ('audio',  'audio',  true),
  ('images', 'images', true)
on conflict (id) do nothing;

-- ────────────────────────────────
-- Audio bucket policies
-- ────────────────────────────────

-- Public can read audio files
create policy "audio_public_read"
  on storage.objects for select
  using (bucket_id = 'audio');

-- Only admins can upload audio
create policy "audio_admin_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'audio' and is_admin()
  );

create policy "audio_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'audio' and is_admin()
  );

-- ────────────────────────────────
-- Images bucket policies
-- ────────────────────────────────

create policy "images_public_read"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "images_admin_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'images' and is_admin()
  );

create policy "images_admin_delete"
  on storage.objects for delete
  using (
    bucket_id = 'images' and is_admin()
  );
