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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");
  const res = await fetch("/api/stripe/create-portal-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id }),
  });
  const json = await res.json();
  if (!res.ok || !json?.url) {
    throw new Error(json?.error || "No se pudo abrir el portal de facturación");
  }
  window.location.href = json.url as string;
}

export async function getMySubscription() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");
  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}