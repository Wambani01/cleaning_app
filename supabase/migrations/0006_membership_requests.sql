-- Amsta Clean: free accounts, first-request payment, monthly membership, regular schedule and cleaning requests.
-- A customer is a row in customer_waitlist (created when they sign up). These tables hang off that row.

-- Membership: starts as "free". Becomes "pending_payment" when the customer makes their first cleaning request,
-- and "active" once the first payment is received. The monthly fee is then due on the same day each month.
create table if not exists public.customer_memberships (
  waitlist_id uuid primary key references public.customer_waitlist(id) on delete cascade,
  status text not null default 'free' check (status in ('free','pending_payment','active','past_due','cancelled')),
  started_on date,
  billing_day smallint check (billing_day between 1 and 31),
  next_billing_date date,
  activated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The customer's regular cleaning slot (their "calendar"). One per customer.
create table if not exists public.customer_schedules (
  waitlist_id uuid primary key references public.customer_waitlist(id) on delete cascade,
  frequency text not null check (frequency in ('weekly','biweekly')),
  weekday smallint not null check (weekday between 1 and 7),            -- 1 = Monday ... 7 = Sunday
  anchor_date date not null,                                            -- first regular date; keeps "every 2 weeks" in step
  start_time time not null,
  hours numeric(3,1) not null check (hours >= 1 and hours <= 8),
  updated_at timestamptz not null default now()
);

-- A request for a cleaning on a given day.
create table if not exists public.cleaning_requests (
  id uuid primary key default gen_random_uuid(),
  waitlist_id uuid not null references public.customer_waitlist(id) on delete cascade,
  requested_date date not null,
  start_time time not null,
  hours numeric(3,1) not null check (hours >= 1 and hours <= 8),
  notes text,
  status text not null default 'requested' check (status in ('requested','awaiting_payment','confirmed','completed','cancelled')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cleaning_requests_waitlist_idx on public.cleaning_requests (waitlist_id, requested_date);
create index if not exists cleaning_requests_status_idx on public.cleaning_requests (status, requested_date);

alter table public.customer_memberships enable row level security;
alter table public.customer_schedules enable row level security;
alter table public.cleaning_requests enable row level security;
revoke all on public.customer_memberships, public.customer_schedules, public.cleaning_requests from anon, authenticated;
