--book
DROP POLICY IF EXISTS "books_auth_delete" on "public"."books";
DROP POLICY IF EXISTS "books_auth_update" on "public"."books";
DROP POLICY IF EXISTS "books_auth_insert" on "public"."books";

create policy "books_auth_insert"
 on "public"."books"
 for insert
 to authenticated
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com');

 create policy "books_auth_update"
 on "public"."books"
 for update
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com')
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com');

 create policy "books_auth_delete"
 on "public"."books"
 for delete
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com');

 --chapters

DROP POLICY IF EXISTS "chapters_auth_insert" on "public"."chapters";
DROP POLICY IF EXISTS "chapters_auth_update" on "public"."chapters";
DROP POLICY IF EXISTS "chapters_auth_delete" on "public"."chapters";

create policy "chapters_auth_insert"
 on "public"."chapters"
 for insert
 to authenticated
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com');

 create policy "chapters_auth_update"
 on "public"."chapters"
 for update
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com')
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com');

 create policy "chapters_auth_delete"
 on "public"."chapters"
 for delete
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com');

  --mainvisual

DROP POLICY IF EXISTS "mainvisual_auth_insert" on "public"."mainvisual";
DROP POLICY IF EXISTS "mainvisual_auth_update" on "public"."mainvisual";
DROP POLICY IF EXISTS "mainvisual_auth_delete" on "public"."mainvisual";

create policy "mainvisual_auth_insert"
 on "public"."mainvisual"
 for insert
 to authenticated
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com');

 create policy "mainvisual_auth_update"
 on "public"."mainvisual"
 for update
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com')
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com');

 create policy "mainvisual_auth_delete"
 on "public"."mainvisual"
 for delete
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com');


 --bucket
DROP POLICY IF EXISTS "mainvisual_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "mainvisual_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "mainvisual_storage_update" ON storage.objects;

create policy "mainvisual_storage_insert"
 on storage.objects
 for insert
 to authenticated
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com' AND bucket_id = 'mainvisual');

 create policy "mainvisual_storage_update"
 on storage.objects
 for update
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com' AND bucket_id = 'mainvisual')
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com' AND bucket_id = 'mainvisual');

 create policy "mainvisual_storage_delete"
 on storage.objects
 for delete
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com' AND bucket_id = 'mainvisual');

--

DROP POLICY IF EXISTS "book_covers_storage_delete" ON storage.objects;
DROP POLICY IF EXISTS "book_covers_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "book_covers_storage_update" ON storage.objects;

create policy "book_covers_storage_insert"
 on storage.objects
 for insert
 to authenticated
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com' AND bucket_id = 'book_covers');

 create policy "book_covers_storage_update"
 on storage.objects
 for update
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com' AND bucket_id = 'book_covers')
 with check ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com' AND bucket_id = 'book_covers');

 create policy "book_covers_storage_delete"
 on storage.objects
 for delete
 to authenticated
 using ((auth.jwt() ->> 'email') = 'rudgks1505@gmail.com' AND bucket_id = 'book_covers');
