drop policy if exists "Policy with security definer functions" on "public"."books";

create policy "books_public_select"
on "public"."books"
for select
to public
using (true);

create policy "books_auth_insert"
on "public"."books"
for insert
to authenticated
with check (true);

create policy "books_auth_update"
on "public"."books"
for update
to authenticated
using (true)
with check (true);

create policy "books_auth_delete"
on "public"."books"
for delete
to authenticated
using (true);

--챕터테이블

drop policy if exists "Policy with security definer functions" on "public"."chapters";

create policy "chapters_public_select"
on "public"."chapters"
for select
to public
using (true);

create policy "chapters_auth_insert"
on "public"."chapters"
for insert
to authenticated
with check (true);

create policy "chapters_auth_update"
on "public"."chapters"
for update
to authenticated
using (true)
with check (true);

create policy "chapters_auth_delete"
on "public"."chapters"
for delete
to authenticated
using (true);

