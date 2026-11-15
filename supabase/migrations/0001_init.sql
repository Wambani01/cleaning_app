-- Amsta Clean: initial schema. Run once in Supabase > SQL Editor.
-- Row-level security is ON and there are NO public policies, so the browser (anon key)
-- cannot read or write these tables. The website writes to them from the server only,
-- using the service role key.

create table if not exists public.cleaner_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text not null,
  area text not null,
  availability text,
  experience text,
  consent boolean not null default false,
  status text not null default 'new'
    check (status in ('new','contacted','interview_scheduled','documents_requested','approved','rejected')),
  notes text
);

create table if not exists public.customer_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  postcode text,
  consent boolean not null default false
);

alter table public.cleaner_applications enable row level security;
alter table public.customer_waitlist enable row level security;

revoke all on public.cleaner_applications from anon, authenticated;
revoke all on public.customer_waitlist from anon, authenticated;

create index if not exists cleaner_applications_status_idx on public.cleaner_applications (status, created_at desc);
