--테이블

alter table "public"."mainvisual" drop column if exists "book_id";

drop policy if exists "Policy with security definer functions" on "public"."mainvisual";

create policy "mainvisual_public_select"
on "public"."mainvisual"
for select
to public
using (true);

create policy "mainvisual_auth_insert"
on "public"."mainvisual"
for insert
to authenticated
with check (true);

create policy "mainvisual_auth_update"
on "public"."mainvisual"
for update
to authenticated
using (true)
with check (true);

create policy "mainvisual_auth_delete"
on "public"."mainvisual"
for delete
to authenticated
using (true);

--스토리지
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('mainvisual', 'mainvisual', false, 10485760, ARRAY['image/png', 'image/*']);


create policy "mainvisual_storage_public_select"
on storage.objects
for select
to public
using (bucket_id = 'mainvisual');

create policy "mainvisual_storage_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'mainvisual');

create policy "mainvisual_storage_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'mainvisual')
with check (bucket_id = 'mainvisual');

create policy "mainvisual_storage_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'mainvisual');