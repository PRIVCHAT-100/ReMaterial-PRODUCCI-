// sql/rematerial_stripe.sql
-- Igual que antes
alter table if exists public.profiles add column if not exists stripe_account_id text;
alter table if exists public.profiles add column if not exists stripe_customer_id text;
alter table if exists public.profiles add column if not exists stripe_subscription_id text;
alter table if exists public.profiles add column if not exists plan text;
alter table if exists public.profiles add column if not exists plan_status text;
alter table if exists public.profiles add column if not exists plan_current_period_end timestamp with time zone;
alter table if exists public.orders add column if not exists amount_total_cents bigint;
alter table if exists public.orders add column if not exists agreed_price_cents bigint;
alter table if exists public.orders add column if not exists currency text;
alter table if exists public.orders add column if not exists stripe_payment_intent_id text;
alter table if exists public.orders add column if not exists status text;
create or replace function public.decrement_inventory_if_exists(p_product_id uuid, p_qty int)
returns void as $$
declare col_exists boolean;
begin
  select exists (select 1 from information_schema.columns where table_schema='public' and table_name='products' and column_name='inventory') into col_exists;
  if col_exists then
    update public.products set inventory = greatest(0, coalesce(inventory,0) - p_qty) where id = p_product_id;
  end if;
end; $$ language plpgsql security definer;
grant execute on function public.decrement_inventory_if_exists(uuid, int) to anon, authenticated;
