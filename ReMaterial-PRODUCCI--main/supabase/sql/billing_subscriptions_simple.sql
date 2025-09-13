-- Creates a simple view backed by profiles, so the app can read plan info uniformly.
-- Safe to run multiple times (drops view if exists, then recreates).

drop view if exists public.billing_subscriptions;

create view public.billing_subscriptions as
select
  p.id                         as user_id,
  coalesce(p.plan, 'free')     as plan_tier,
  coalesce(p.plan_status, case when p.plan is null then 'inactive' else 'active' end) as status,
  p.stripe_customer_id         as stripe_customer_id,
  null::text                   as price_id,
  null::timestamptz            as current_period_end,
  false                        as cancel_at_period_end
from public.profiles p;

-- Optional RLS (views don't have RLS; secure base table instead)
-- Ensure profiles has policies allowing the owner to select/update their own row.
