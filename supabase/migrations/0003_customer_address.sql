-- Amsta Clean: customers give a phone number and a full address when they sign up on /join.
alter table public.customer_waitlist
  add column if not exists phone text,
  add column if not exists street text,
  add column if not exists house_number text,
  add column if not exists house_number_addition text,
  add column if not exists city text;
