-- Amsta Clean: cleaners give a full address on their application.
alter table public.cleaner_applications
  add column if not exists street text,
  add column if not exists house_number text,
  add column if not exists house_number_addition text,
  add column if not exists postcode text,
  add column if not exists city text;
