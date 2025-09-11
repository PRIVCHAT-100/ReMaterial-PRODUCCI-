-- supabase/sql/2025-09-02_company_basic_guard.sql
-- Evita que un usuario se ponga como vendedor (is_seller=true) si su plan no es BASIC o PRO.

create or replace function public.has_basic_or_pro(uid uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1
    from public.billing_subscriptions s
    where s.user_id = uid
      and s.plan_tier in ('basic','pro')
      and coalesce(s.status, 'inactive') in ('active','trialing')
  );
$$;

-- Policy para actualizar su propio profile: permitimos todo menos activar is_seller sin plan.
-- Ajusta el nombre de tu policy si ya tienes una existente.
drop policy if exists "profiles_user_update_guard_basic" on public.profiles;

create policy "profiles_user_update_guard_basic"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and (
    -- Si intenta activar is_seller, exige plan basic/pro:
    (new.is_seller is distinct from true)
    or public.has_basic_or_pro(auth.uid())
  )
);