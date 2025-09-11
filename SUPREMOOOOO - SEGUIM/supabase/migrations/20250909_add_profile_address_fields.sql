-- Adds address fields to profiles table if they don't exist. Idempotent.
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='address_line1') then
    alter table public.profiles add column address_line1 text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='address_number') then
    alter table public.profiles add column address_number text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='city') then
    alter table public.profiles add column city text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='province') then
    alter table public.profiles add column province text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='postal_code') then
    alter table public.profiles add column postal_code text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='country') then
    alter table public.profiles add column country text default 'España';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='latitude') then
    alter table public.profiles add column latitude double precision;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='longitude') then
    alter table public.profiles add column longitude double precision;
  end if;
end $$;