// src/lib/billing.ts
// Frontend helpers to start a subscription and open the billing portal.
import { supabase } from "@/lib/supabase/client";

export type PlanTier = "free" | "basic" | "pro";

export const PLAN_FEATURES: Record<PlanTier, string[]> = {
  free: [
    "Hasta 5 productos publicados",
    "Chat y contraofertas básicas",
    "Soporte por email estándar",
  ],
  basic: [
    "Hasta 50 productos publicados",
    "Chat/negociación + reserva automática",
    "Checkout estándar",
    "Comisiones reducidas",
    "Soporte prioritario por email",
  ],
  pro: [
    "Productos ilimitados",
    "Historial avanzado de ofertas",
    "Checkout avanzado + cupones",
    "Analytics y exportaciones",
    "Soporte prioritario 24/7",
  ],
};

export function hasFeature(tier: PlanTier, feature: string) {
  const normalized = feature.trim().toLowerCase();
  return Object.values(PLAN_FEATURES).some(() => {
    return PLAN_FEATURES[tier].some(f => f.trim().toLowerCase() === normalized);
  });
}

export async function startSubscription(priceId: string, opts?: { successPath?: string; cancelPath?: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");

  const email = user.email ?? undefined;
  const userId = user.id;

  const res = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      priceId,
      userId,
      email,
      successPath: opts?.successPath,
      cancelPath: opts?.cancelPath,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json?.url) {
    throw new Error(json?.error || "No se pudo crear la sesión de pago");
  }
  window.location.href = json.url as string;
}

export async function openCustomerPortal() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Debes iniciar sesión");
  const res = await fetch("/api/create-portal-session", {
    method: "GET",
    headers: { "Authorization": `Bearer ${session.access_token}` }
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.url) {
    throw new Error(json?.error || "No se pudo abrir el portal de facturación");
  }
  window.location.href = json.url as string;
}

export async function getMySubscription() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");

  // 1) Intento 1: vista/tabla 'billing_subscriptions' (si existe)
  try {
    const { data, error } = await supabase
      .from("billing_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data) return data as any;
  } catch {}

  // 2) Intento 2: tabla 'subscriptions' (última por created_at) + perfil
  let sub: any = null;
  try {
    const { data: s } = await supabase
      .from("subscriptions")
      .select("price_id,status,current_period_end, cancel_at_period_end, stripe_customer_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (s) sub = s;
  } catch {}

  // 3) Perfil para tier aproximado y fechas si las hubiera
  let profile: any = null;
  try {
    const { data: p } = await supabase
      .from("profiles")
      .select("plan, plan_status, plan_current_period_end, plan_renews_at")
      .eq("id", user.id)
      .maybeSingle();
    if (p) profile = p;
  } catch {}

  const plan_tier = (profile?.plan || null) as any; // 'free' | 'basic' | 'premium' | 'pro' | 'pro_plus' | null
  const status = (sub?.status || profile?.plan_status || null) as any;
  const current_period_end = (sub?.current_period_end || profile?.plan_current_period_end || profile?.plan_renews_at || null) as any;
  const stripe_customer_id = sub?.stripe_customer_id || null;

  return {
    plan_tier,
    status,
    price_id: sub?.price_id || null,
    current_period_end,
    cancel_at_period_end: sub?.cancel_at_period_end ?? null,
    stripe_customer_id,
    user_id: user.id,
  };
}

export async function startCheckout(priceId: string, opts?: { mode?: 'subscription' | 'payment', customer_email?: string }) {
  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      mode: opts?.mode || 'subscription',
      customer_email: opts?.customer_email
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.error || 'No se pudo iniciar el checkout');
  }
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  return data;
}

export async function startKeywordExtraCheckout(priceId: string, opts?: { customer_email?: string }) {
  if (!priceId) throw new Error('Falta priceId para Keyword Extra');
  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      mode: 'subscription',
      customer_email: opts?.customer_email
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.error || 'No se pudo iniciar el checkout de Keyword Extra');
  }
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  return data;
}

/** Devuelve cuántas palabras clave gratis están incluidas según el plan. */
export function getIncludedKeywordsForPlan(planTier: PlanTier | string | null | undefined): number {
  switch ((planTier || '').toString().toLowerCase()) {
    case "basic": return 1;
    case "pro":
    case "pro_plus":
    case "pro+": return 3;
    default: return 0; // free u otros
  }
}

/** Lógica de bloqueo: devuelve true si puedes asignar otra keyword sin exceder el límite incluido. */
export function canAssignAnotherKeyword(currentAssignedCount: number, planTier: PlanTier | string | null | undefined): boolean {
  const maxIncluded = getIncludedKeywordsForPlan(planTier);
  return (currentAssignedCount || 0) < maxIncluded;
}