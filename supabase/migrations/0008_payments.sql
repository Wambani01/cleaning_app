-- Amsta Clean: payments ledger and saved payment method (TEST MODE: a fake provider stands in for Stripe).
-- Full card numbers and security codes are never stored. Only the last four digits.
create sequence if not exists public.payment_receipt_seq;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  waitlist_id uuid not null references public.customer_waitlist(id) on delete cascade,
  kind text not null check (kind in ('membership','cleaning')),
  request_id uuid references public.cleaning_requests(id) on delete set null,   -- set for kind = 'cleaning'
  description text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'EUR',
  status text not null check (status in ('due','succeeded','failed')),
  provider text check (provider in ('fake','manual')),
  reference text,                       -- the provider's charge id
  card_last4 text check (card_last4 is null or card_last4 ~ '^[0-9]{4}$'),
  failure_reason text,
  receipt_no text unique,               -- assigned when a payment succeeds
  due_on date,
  paid_at timestamptz,
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists payments_customer_idx on public.payments (waitlist_id, created_at desc);
create index if not exists payments_status_idx on public.payments (status, kind);
-- one open charge per completed cleaning
create unique index if not exists payments_one_cleaning_charge_idx on public.payments (request_id) where kind = 'cleaning' and status in ('due','succeeded');

create table if not exists public.payment_methods (
  waitlist_id uuid primary key references public.customer_waitlist(id) on delete cascade,
  provider text not null default 'fake',
  token text not null,                  -- fake token. With Stripe this is the payment method id.
  brand text not null,
  last4 text not null check (last4 ~ '^[0-9]{4}$'),
  exp_month smallint not null check (exp_month between 1 and 12),
  exp_year smallint not null,
  will_decline boolean not null default false,   -- test card that always declines, to demo a failed renewal
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;
alter table public.payment_methods enable row level security;
revoke all on public.payments, public.payment_methods from anon, authenticated;
revoke all on sequence public.payment_receipt_seq from anon, authenticated;
