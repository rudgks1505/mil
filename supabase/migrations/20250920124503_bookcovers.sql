
-- 스토리지 삭제
DROP POLICY IF EXISTS "book_cover_storage_public_select" ON storage.objects;
DROP POLICY IF EXISTS "book_cover_storage_insert"         ON storage.objects;
DROP POLICY IF EXISTS "book_cover_storage_update"         ON storage.objects;
DROP POLICY IF EXISTS "book_cover_storage_delete"         ON storage.objects;

DELETE FROM storage.objects
WHERE bucket_id = 'book_cover';

DELETE FROM storage.buckets
WHERE id = 'book_cover';


DROP POLICY IF EXISTS "mainvisual_storage_public_select" ON storage.objects;
DROP POLICY IF EXISTS "mainvisual_storage_insert"         ON storage.objects;
DROP POLICY IF EXISTS "mainvisual_storage_update"         ON storage.objects;
DROP POLICY IF EXISTS "mainvisual_storage_delete"         ON storage.objects;


-- 스토리지 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('book_covers', 'book_covers', false, 10485760, ARRAY['image/png','image/jpeg','image/webp']);


create policy "book_covers_storage_public_select"
on storage.objects
for select
to public
using (bucket_id = 'book_covers');

create policy "book_covers_storage_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'book_covers' and owner = auth.uid());

create policy "book_covers_storage_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'book_covers' and owner = auth.uid())
with check (bucket_id = 'book_covers' and owner = auth.uid());

create policy "book_covers_storage_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'book_covers' and owner = auth.uid());

--mainvisual
update storage.buckets
set allowed_mime_types = ARRAY['image/png','image/jpeg','image/webp']
where id = 'mainvisual';

create policy "mainvisual_storage_public_select"
on storage.objects
for select
to public
using (bucket_id = 'mainvisual');

create policy "mainvisual_storage_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'mainvisual' and owner = auth.uid());

create policy "mainvisual_storage_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'mainvisual' and owner = auth.uid())
with check (bucket_id = 'mainvisual' and owner = auth.uid());

create policy "mainvisual_storage_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'mainvisual' and owner = auth.uid());


--booktable
ALTER TABLE "public"."books"
add column owner uuid not null default auth.uid();

ALTER TABLE "public"."books"
DROP COLUMN uuid;

ALTER TABLE "public"."books"
add column uuid uuid not null default auth.uid();

 drop policy if exists "books_public_select" on "public"."books";
 drop policy if exists "books_auth_insert" on "public"."books";
 drop policy if exists "books_auth_update" on "public"."books";
 drop policy if exists "books_auth_delete" on "public"."books";


 create policy "books_public_select"
 on "public"."books"
 for select
 to public
 using (true);

 create policy "books_auth_insert"
 on "public"."books"
 for insert
 to authenticated
 with check (owner = auth.uid());

 create policy "books_auth_update"
 on "public"."books"
 for update
 to authenticated
 using (owner = auth.uid())
 with check (owner = auth.uid());

 create policy "books_auth_delete"
 on "public"."books"
 for delete
 to authenticated
 using (owner = auth.uid());

--chapters
 ALTER TABLE "public"."chapters"
 add column owner uuid not null default auth.uid();

 drop policy if exists "chapters_public_select" on "public"."chapters";
 drop policy if exists "chapters_auth_insert" on "public"."chapters";
 drop policy if exists "chapters_auth_update" on "public"."chapters";
 drop policy if exists "chapters_auth_delete" on "public"."chapters";

 create policy "chapters_public_select"
 on "public"."chapters"
 for select
 to public
 using (true);

 create policy "chapters_auth_insert"
 on "public"."chapters"
 for insert
 to authenticated
 with check (owner = auth.uid());

 create policy "chapters_auth_update"
 on "public"."chapters"
 for update
 to authenticated
 using (owner = auth.uid())
 with check (owner = auth.uid());

 create policy "chapters_auth_delete"
 on "public"."chapters"
 for delete
 to authenticated
 using (owner = auth.uid());


--mainvisual
 ALTER TABLE "public"."mainvisual"
 add column owner uuid not null default auth.uid();

  drop policy if exists "mainvisual_public_select" on "public"."mainvisual";
 drop policy if exists "mainvisual_auth_insert" on "public"."mainvisual";
 drop policy if exists "mainvisual_auth_update" on "public"."mainvisual";
 drop policy if exists "mainvisual_auth_delete" on "public"."mainvisual";

 create policy "mainvisual_public_select"
 on "public"."mainvisual"
 for select
 to public
 using (true);

 create policy "mainvisual_auth_insert"
 on "public"."mainvisual"
 for insert
 to authenticated
 with check (owner = auth.uid());

 create policy "mainvisual_auth_update"
 on "public"."mainvisual"
 for update
 to authenticated
 using (owner = auth.uid())
 with check (owner = auth.uid());

 create policy "mainvisual_auth_delete"
 on "public"."mainvisual"
 for delete
 to authenticated
 using (owner = auth.uid());
