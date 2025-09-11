// src/lib/billing.ts
import { PLANS } from '@/lib/billing/plans';
export type PlanKey = keyof typeof PLANS;

export type MySubscription = {
  price_id?: string | null;
  status?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
  stripe_customer_id?: string | null;
} | null;

/**
 * startCheckout: Crea sesión de Checkout en Vercel y redirige al usuario.
 * Requiere: STRIPE_SECRET_KEY en Vercel y VITE_PRICE_* en el frontend.
 */
export async function startCheckout(priceId: string, opts?: {
  mode?: 'subscription' | 'payment';
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string;
}) {
  if (!priceId) {
    console.warn('[billing] startCheckout: priceId vacío');
    return;
  }
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data?.url) {
    window.location.href = data.url as string;
    return;
  }
  console.error('[billing] No url in checkout session response', data);
}

/**
 * subscribeToPrice (shim): export para evitar romper imports existentes.
 * Si tu app lo usa realmente para escuchar cambios, implementa la lógica real aquí.
 */
export function subscribeToPrice(_priceId: string, _cb: (v: any) => void) {
  console.warn('[billing] subscribeToPrice shim: no-op');
  return () => {};
}

/**
 * getPlanByPriceId: busca el plan a partir de un priceId (mensual, anual o keyword extra).
 * Devuelve el objeto del plan si coincide alguna de sus priceIds.
 */
export function getPlanByPriceId(priceId: string) {
  if (!priceId) return null;
  const entries = Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][];
  for (const [_key, plan] of entries) {
    if (
      plan.monthly?.priceId === priceId ||
      plan.yearly?.priceId === priceId ||
      plan.keywordExtraPriceId === priceId
    ) {
      return plan;
    }
  }
  return null;
}

/**
 * getIncludedKeywordsForPlan: devuelve cuántas keywords vienen incluidas
 * Recibe o bien un planKey o un priceId (mensual/anual). Prioriza planKey si se da.
 */
export function getIncludedKeywordsForPlan(params: { planKey?: PlanKey; priceId?: string }): number {
  if (params?.planKey) {
    const plan = PLANS[params.planKey];
    return plan?.includedKeywords ?? 0;
  }
  if (params?.priceId) {
    const plan = getPlanByPriceId(params.priceId);
    return plan?.includedKeywords ?? 0;
  }
  return 0;
}

/**
 * getMySubscription: stub seguro que evita romper SettingsBilling.
 * Devuelve null por defecto. Más adelante podemos enlazar Supabase/Stripe Webhooks.
 */
export async function getMySubscription(): Promise<MySubscription> {
  console.warn('[billing] getMySubscription stub: devuelve null hasta enlazar con tu backend (Supabase o webhooks).');
  return null;
}

/**
 * openCustomerPortal: abre el Portal de Facturación de Stripe para un customerId dado.
 * Requiere tener el `stripe_customer_id` del usuario.
 */
export async function openCustomerPortal(customerId: string, returnUrl?: string) {
  if (!customerId) {
    console.warn('[billing] openCustomerPortal: customerId vacío');
    return;
  }
  const res = await fetch('/api/create-customer-portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId, returnUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data?.url) {
    window.location.href = data.url as string;
    return;
  }
  console.error('[billing] No url in portal session response', data);
}
