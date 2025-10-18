
create table public.user_books (
  id bigserial primary key,
  user_id uuid not null references public.member (user_id) on delete cascade, --이메일은 변경 가능하니, uid로
  book_uuid uuid not null references public.books (uuid) on delete cascade,
  background_color text not null,
  font_color text not null,
  font_size text not null,
  font_weight text not null,
  font_height text not null,
  spread text not null,
  cfi text not null
);

alter table public.user_books enable row level security;
 
 create policy "user_books_select"
 on "public"."user_books"
 for select
 to authenticated
 using ( user_id = auth.uid() );

 create policy "user_books_insert"
 on "public"."user_books"
for insert
to authenticated
with check (user_id = auth.uid());

create policy "user_books_update"
 on "public"."user_books"
for update
to authenticated
using ( user_id = auth.uid())
with check (user_id = auth.uid());

create policy "user_books_delete"
 on "public"."user_books"
for delete
to authenticated
using ( user_id = auth.uid());


--history

create table public.history (
  id bigserial primary key,
  user_id uuid not null references public.member (user_id) on delete cascade,
  book_uuid uuid not null references public.books (uuid) on delete cascade,
  visited_at timestamptz not null default now()
);

alter table public.history enable row level security;
 
 create policy "history_select"
 on "public"."history"
 for select
 to authenticated
 using ( user_id = auth.uid() );

 create policy "history_insert"
 on "public"."history"
for insert
to authenticated
with check (user_id = auth.uid());

create policy "history_update"
 on "public"."history"
for update
to authenticated
using ( user_id = auth.uid())
with check (user_id = auth.uid());

create policy "history_delete"
 on "public"."history"
for delete
to authenticated
using ( user_id = auth.uid());