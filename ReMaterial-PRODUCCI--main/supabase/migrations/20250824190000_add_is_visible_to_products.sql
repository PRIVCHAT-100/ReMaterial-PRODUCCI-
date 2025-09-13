-- Add visibility flag so sellers can hide products from buyers while keeping them in inventory
alter table public.products
  add column if not exists is_visible boolean not null default true;

-- Helpful index for visibility filter
create index if not exists idx_products_is_visible on public.products(is_visible);

-- (No RLS change required; existing owner policies still apply)
