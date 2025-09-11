-- Creates a public, aggregated view of reserved quantities per product.
-- Safe to expose to anon users via RLS policy (read-only).
create or replace view public.product_reservations_v1 as
select
  product_id,
  coalesce(sum(reserved_quantity), 0)::int as reserved_qty
from public.offers
where reserved = true
  and status = 'accepted'
group by product_id;

alter table public.product_reservations_v1 enable row level security;

drop policy if exists "read product_reservations_v1" on public.product_reservations_v1;
create policy "read product_reservations_v1"
on public.product_reservations_v1
for select
to public
using (true);
