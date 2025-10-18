select schedule_job( 
  'daily-log-cleanup',
  '00 15 * * *',
  'UPDATE books SET uuid = NULL WHERE uuid IS NOT NULL'
);


INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('book_cover', 'book_cover', false, 10485760, ARRAY['image/png', 'image/*']);


create policy "book_cover_storage_public_select"
on storage.objects
for select
to public
using (bucket_id = 'book_cover');

create policy "book_cover_storage_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'book_cover');

create policy "book_cover_storage_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'book_cover')
with check (bucket_id = 'book_cover');

create policy "book_cover_storage_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'book_cover');