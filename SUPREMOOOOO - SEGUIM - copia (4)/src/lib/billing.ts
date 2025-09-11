// src/lib/billing.ts
// Helpers de billing para frontend (Stripe Checkout + Portal)
import { supabase } from "@/integrations/supabase/client";

export async function startCheckout(priceId: string, opts?: {
  mode?: 'subscription' | 'payment';
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
}) {
  if (!priceId) throw new Error("priceId vacío");
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      mode: opts?.mode || 'subscription',
      success_url: opts?.successUrl,
      cancel_url: opts?.cancelUrl,
      customer_email: opts?.customerEmail,
    }),
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  if (data?.url) { window.location.href = data.url as string; return; }
  throw new Error("Respuesta de checkout sin URL");
}

// Shim para mantener compatibilidad con imports antiguos
export function subscribeToPrice(_priceId: string, _cb: (v: any) => void) {
  console.warn('[billing] subscribeToPrice shim: no-op');
  return () => {};
}

export async function getMySubscription() {
  console.warn('[billing] getMySubscription stub → devuelve null');
  return null as any;
}

// Permite llamarse sin argumentos desde SettingsBilling.tsx
export async function openCustomerPortal(returnUrl?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("No hay sesión activa");

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();
  if (error) throw error;

  const customerId = profile?.stripe_customer_id;
  if (!customerId) throw new Error("El perfil no tiene stripe_customer_id");

  const res = await fetch('/api/stripe/customer-portal-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId, returnUrl }),
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  if (data?.url) { window.location.href = data.url as string; return; }
  throw new Error("Respuesta de portal sin URL");
}

export function getIncludedKeywordsForPlan(planTier: string | null | undefined): number {
  switch ((planTier || '').toLowerCase()) {
    case "basic": return 1;
    case "pro":
    case "pro_plus":
    case "pro+": return 3;
    default: return 0;
  }
}
