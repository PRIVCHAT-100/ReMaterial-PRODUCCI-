-- supabase/migrations/20250910_stripe_plans.sql

-- 1) Extend profiles with plan data (non-breaking; nullable)
alter table if exists public.profiles
  add column if not exists plan text check (plan in ('basic','premium','pro_plus')),
  add column if not exists plan_started_at timestamptz,
  add column if not exists plan_renews_at timestamptz;

-- 2) Subscriptions table (simple mirror of stripe status)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text check (plan in ('basic','premium','pro_plus')),
  status text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- minimal RLS (adjust as needed for your app)
alter table public.subscriptions enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='subscriptions' and policyname='subscriptions_select_own') then
    create policy subscriptions_select_own on public.subscriptions for select
      using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='subscriptions' and policyname='subscriptions_insert_own') then
    create policy subscriptions_insert_own on public.subscriptions for insert
      with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='subscriptions' and policyname='subscriptions_update_own') then
    create policy subscriptions_update_own on public.subscriptions for update
      using (auth.uid() = user_id);
  end if;
end $$;
