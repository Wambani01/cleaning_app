-- Amsta Clean: full request details, and the assigned cleaner's accept / decline response.
alter table public.cleaning_requests
  -- who is asked to do this cleaning, and what they answered (null response = no cleaner assigned yet)
  add column if not exists cleaner_id uuid references public.cleaner_applications(id) on delete set null,
  add column if not exists cleaner_response text check (cleaner_response in ('pending','accepted','declined')),
  add column if not exists cleaner_responded_at timestamptz,
  add column if not exists decline_reason text,
  -- the address the cleaning takes place at (may differ from the customer's home address)
  add column if not exists street text,
  add column if not exists house_number text,
  add column if not exists house_number_addition text,
  add column if not exists postcode text,
  add column if not exists city text,
  -- the home and the job
  add column if not exists property_type text check (property_type in ('apartment','house')),
  add column if not exists bedrooms smallint check (bedrooms between 0 and 10),
  add column if not exists bathrooms smallint check (bathrooms between 0 and 6),
  add column if not exists windows smallint check (windows between 0 and 100),
  add column if not exists tasks text[] not null default '{}',
  add column if not exists has_pets boolean,
  add column if not exists supplies_at_home boolean,
  add column if not exists created_by text;                    -- 'customer', or the admin's email when an admin made the request

create index if not exists cleaning_requests_cleaner_idx on public.cleaning_requests (cleaner_id, cleaner_response);
