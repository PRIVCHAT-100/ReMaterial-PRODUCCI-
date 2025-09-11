-- Notifications
create table if not exists public.user_settings_notifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  channel_email boolean default true,
  channel_web_push boolean default false,
  type_messages boolean default true,
  type_offers boolean default true,
  type_favorites boolean default true,
  type_product_state boolean default true,
  type_system boolean default true,
  frequency text check (frequency in ('immediate','daily','weekly')) default 'immediate',
  muted_conversation_ids text[] default '{}',
  weekly_digest boolean default false,
  updated_at timestamp with time zone default now()
);

-- Privacy
create table if not exists public.user_settings_privacy (
  user_id uuid primary key references auth.users(id) on delete cascade,
  who_can_contact text check (who_can_contact in ('all','verified','prior_contacts')) default 'all',
  blocklist text[] default '{}',
  show_last_seen boolean default true,
  consent_analytics boolean default true,
  consent_cookies boolean default true,
  updated_at timestamp with time zone default now()
);

-- Billing
create table if not exists public.billing_tax_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  legal_name text default '',
  tax_id text default '',
  billing_address text default '',
  vat_preference text check (vat_preference in ('included','excluded')) default 'included',
  eu_vat_number text,
  vat_number_valid boolean,
  updated_at timestamp with time zone default now()
);

create table if not exists public.billing_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  label text not null,
  address text not null,
  is_default_pickup boolean default false,
  is_default_shipping boolean default false,
  created_at timestamp with time zone default now()
);

-- Example invoices store (can be sourced from Stripe webhooks)
create table if not exists public.billing_invoices (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  amount integer not null,
  currency text default 'eur',
  download_url text
);

-- Optional: a view for payment methods populated from Stripe (read-only placeholder)
create view if not exists public.billing_payment_methods_view as
  select 
    'pm_mock'::text as id,
    null::uuid as user_id,
    'visa'::text as brand,
    '4242'::text as last4,
    12::int as exp_month,
    2030::int as exp_year,
    true as is_default;

-- RLS (safe defaults - allow owner read/write)
alter table public.user_settings_notifications enable row level security;
alter table public.user_settings_privacy enable row level security;
alter table public.billing_tax_data enable row level security;
alter table public.billing_addresses enable row level security;
alter table public.billing_invoices enable row level security;

do $$ begin
  create policy if not exists "own read" on public.user_settings_notifications
    for select using (auth.uid() = user_id);
  create policy if not exists "own write" on public.user_settings_notifications
    for insert with check (auth.uid() = user_id);
  create policy if not exists "own upsert" on public.user_settings_notifications
    for update using (auth.uid() = user_id);
end $$;

do $$ begin
  create policy if not exists "own read" on public.user_settings_privacy
    for select using (auth.uid() = user_id);
  create policy if not exists "own write" on public.user_settings_privacy
    for insert with check (auth.uid() = user_id);
  create policy if not exists "own upsert" on public.user_settings_privacy
    for update using (auth.uid() = user_id);
end $$;

do $$ begin
  create policy if not exists "own read" on public.billing_tax_data
    for select using (auth.uid() = user_id);
  create policy if not exists "own write" on public.billing_tax_data
    for insert with check (auth.uid() = user_id);
  create policy if not exists "own upsert" on public.billing_tax_data
    for update using (auth.uid() = user_id);
end $$;

do $$ begin
  create policy if not exists "own read" on public.billing_addresses
    for select using (auth.uid() = user_id);
  create policy if not exists "own write" on public.billing_addresses
    for insert with check (auth.uid() = user_id);
  create policy if not exists "own upsert" on public.billing_addresses
    for update using (auth.uid() = user_id);
  create policy if not exists "own delete" on public.billing_addresses
    for delete using (auth.uid() = user_id);
end $$;

do $$ begin
  create policy if not exists "own read" on public.billing_invoices
    for select using (auth.uid() = user_id);
end $$;
