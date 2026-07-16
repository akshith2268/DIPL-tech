create extension if not exists pgcrypto;

create table if not exists public.contacts (
  id text primary key default ('contact_' || gen_random_uuid()::text),
  name text not null,
  email text not null,
  phone text not null,
  organization text,
  role text,
  project_type text not null default 'General inquiry',
  region text,
  message text not null,
  preferred_follow_up text not null default 'Email',
  request_evaluation boolean not null default false,
  subscribe boolean not null default false,
  consent boolean not null default false,
  source_url text,
  status text not null default 'NEW' check (status in ('NEW', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists contacts_created_at_idx on public.contacts (created_at desc);
create index if not exists contacts_status_idx on public.contacts (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

alter table public.contacts enable row level security;
alter table public.admin_users enable row level security;

revoke all on public.contacts from anon, authenticated;
revoke all on public.admin_users from anon, authenticated;

grant insert on public.contacts to anon, authenticated;
grant select, update on public.contacts to authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "Public can submit contact enquiries" on public.contacts;
create policy "Public can submit contact enquiries"
on public.contacts
for insert
to anon, authenticated
with check (
  consent = true
  and char_length(btrim(name)) between 2 and 120
  and char_length(btrim(email)) between 5 and 320
  and char_length(btrim(phone)) between 8 and 40
  and char_length(btrim(message)) between 20 and 5000
  and status = 'NEW'
);

drop policy if exists "Admins can view their membership" on public.admin_users;
create policy "Admins can view their membership"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can read contact enquiries" on public.contacts;
create policy "Admins can read contact enquiries"
on public.contacts
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update contact enquiries" on public.contacts;
create policy "Admins can update contact enquiries"
on public.contacts
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
