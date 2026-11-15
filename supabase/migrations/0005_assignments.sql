-- Amsta Clean: manual assignment of a regular cleaner (and optional backup) to a customer's home.
-- An "approved" cleaner application is a cleaner. A waitlist row is a customer request.
create table if not exists public.customer_assignments (
  id uuid primary key default gen_random_uuid(),
  waitlist_id uuid not null unique references public.customer_waitlist(id) on delete cascade,
  regular_cleaner_id uuid not null references public.cleaner_applications(id) on delete restrict,
  backup_cleaner_id uuid references public.cleaner_applications(id) on delete restrict,
  assigned_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint regular_and_backup_differ check (backup_cleaner_id is null or backup_cleaner_id <> regular_cleaner_id)
);

create index if not exists customer_assignments_regular_idx on public.customer_assignments (regular_cleaner_id);
create index if not exists customer_assignments_backup_idx on public.customer_assignments (backup_cleaner_id);

alter table public.customer_assignments enable row level security;
revoke all on public.customer_assignments from anon, authenticated;
