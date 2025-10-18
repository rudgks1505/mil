--mainvisual

ALTER TABLE public.mainvisual
ADD COLUMN img_path_m text not null DEFAULT ''::text;

--bookmark
create table public.book_marks (
  id bigserial primary key,
  user_id uuid not null references public.member (user_id) on delete cascade,
  book_uuid uuid not null references public.books (uuid) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.book_marks enable row level security;
 
 create policy "book_marks_select"
 on "public"."book_marks"
 for select
 to authenticated
 using ( user_id = auth.uid() );

 create policy "book_marks_insert"
 on "public"."book_marks"
for insert
to authenticated
with check (user_id = auth.uid());

create policy "book_marks_update"
 on "public"."book_marks"
for update
to authenticated
using ( user_id = auth.uid())
with check (user_id = auth.uid());

create policy "book_marks_delete"
 on "public"."book_marks"
for delete
to authenticated
using ( user_id = auth.uid());
