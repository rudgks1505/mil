alter table public.books
  add column "today_hit" bigint not null default 0;


-----------------------------------
create or replace function public.increment_book_hit(book_uuid uuid)
returns bigint
language plpgsql
set search_path = public
security definer
as $$
declare new_hit bigint;
begin
  update public.books
     set hit = hit + 1,
         today_hit = today_hit + 1
   where uuid = book_uuid
  returning hit into new_hit;

  return new_hit;
end;
$$;