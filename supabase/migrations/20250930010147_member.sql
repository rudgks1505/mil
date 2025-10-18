ALTER TABLE public.member
DROP COLUMN user_level;

ALTER TABLE public.member
DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.member
ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE
REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE public.member
DROP COLUMN IF EXISTS email;

alter table public.member
add column IF NOT EXISTS email text UNIQUE;



alter table public.member
add column last_sign timestamptz;

alter table public.member
add column user_role text;

alter table public.member
add column user_phone text UNIQUE;

alter table public.member
add column uuid uuid;

alter table public.member
add column uuid_close timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.member (user_id, email, last_sign, user_role, user_phone)
  values (new.id, new.email, new.last_sign_in_at, new.role, (new.raw_user_meta_data->>'phone'))
  on conflict (user_id) do update
    set email = excluded.email,
        last_sign = excluded.last_sign,
        user_role = excluded.user_role,
        user_phone = excluded.user_phone;
  return new;
end;
$$;

drop trigger if exists new_user_trigger on auth.users;

--insert만 할 경우, last_sign_in_at, role null들어감.
create trigger new_user_trigger
after insert or update on auth.users
for each row
execute function public.handle_new_user();


drop policy if exists "Policy with security definer functions" on "public"."member";

 create policy "member_rudgks_select"
 on "public"."member"
 for select
 to authenticated
 using ( auth.email() = 'rudgks9999@gmail.com' or user_id = auth.uid() );

 create policy "member_insert"
 on "public"."member"
for insert
to anon
with check (true);

create policy "member_update"
 on "public"."member"
for update
to authenticated
using ( user_id = auth.uid())
with check (user_id = auth.uid());

create policy "member_delete"
 on "public"."member"
for delete
to authenticated
using ( user_id = auth.uid());