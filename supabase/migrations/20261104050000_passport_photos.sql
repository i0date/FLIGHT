-- Passport photos (private: only the traveller can see their own) and an optional home church.

alter table public.profiles
  add column home_church text check (char_length(home_church) <= 60),
  add column photo_updated_at timestamptz;
grant update (home_church, photo_updated_at) on public.profiles to authenticated;

-- Photos are resized in the app to a small JPEG before upload; 1 MB is a generous cap.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('passport-photos', 'passport-photos', false, 1048576, array['image/jpeg']);

-- Each traveller may only touch files in their own folder: passport-photos/<user id>/...
create policy "own passport photo: read" on storage.objects for select to authenticated
  using (bucket_id = 'passport-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own passport photo: upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'passport-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own passport photo: replace" on storage.objects for update to authenticated
  using (bucket_id = 'passport-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'passport-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own passport photo: remove" on storage.objects for delete to authenticated
  using (bucket_id = 'passport-photos' and (storage.foldername(name))[1] = auth.uid()::text);
