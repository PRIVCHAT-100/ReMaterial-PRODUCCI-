import { supabase } from '../../integrations/supabase/client';

export const PLAN_FEATURES: Record<'basic'|'premium'|'pro_plus', string[]> = {
  basic: [
    'Hasta 20 productos activos',
    'Visibilidad estándar en el marketplace',
    'Atención por email',
  ],
  premium: [
    'Hasta 40 productos activos',
    'Gestión de inventario avanzada',
    '1 palabra clave destacada incluida',
    'Atención prioritaria',
  ],
  pro_plus: [
    'Productos ilimitados',
    'Gestión de inventario avanzada',
    '3 palabras clave destacadas incluidas',
    'Analíticas avanzadas',
    'Soporte preferente',
  ],
};

const env = (k: string) => (import.meta as any)?.env?.[k] || '';

// Monthly (build-time)
export const VITE_PRICE_BASIC_MONTHLY    = import.meta.env.VITE_PRICE_BASIC_MONTHLY || '';
export const VITE_PRICE_PREMIUM_MONTHLY  = import.meta.env.VITE_PRICE_PREMIUM_MONTHLY || '';
export const VITE_PRICE_PRO_PLUS_MONTHLY = import.meta.env.VITE_PRICE_PRO_PLUS_MONTHLY || '';

// Yearly
export const VITE_PRICE_BASIC_YEARLY     = import.meta.env.VITE_PRICE_BASIC_YEARLY || '';
export const VITE_PRICE_PREMIUM_YEARLY   = import.meta.env.VITE_PRICE_PREMIUM_YEARLY || '';
export const VITE_PRICE_PRO_PLUS_YEARLY  = import.meta.env.VITE_PRICE_PRO_PLUS_YEARLY || '';

export const VITE_PRICE_KEYWORD_EXTRA    = import.meta.env.VITE_PRICE_KEYWORD_EXTRA || '';

// Helper
export const PRICES_CONFIGURED = [
  VITE_PRICE_BASIC_MONTHLY, VITE_PRICE_PREMIUM_MONTHLY, VITE_PRICE_PRO_PLUS_MONTHLY,
  VITE_PRICE_BASIC_YEARLY, VITE_PRICE_PREMIUM_YEARLY, VITE_PRICE_PRO_PLUS_YEARLY
].every(v => typeof v === 'string' && v.startsWith('price_'));

export function getIncludedKeywordsForPlan(planTier?: string | null): number {
  switch ((planTier || '').toLowerCase()) {
    case 'premium': return 1;
    case 'pro+':
    case 'pro_plus': return 3;
    default: return 0;
  }
}

async function postJSON(url: string, body: any) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || 'Operación fallida');
  return data;
}

export async function startSubscription(
  priceId: string,
  opts?: { successPath?: string; cancelPath?: string }
) {
  if (!priceId) throw new Error('Falta el priceId del plan');
  const { data: { user } } = await supabase.auth.getUser();
  const payload: any = {
    priceId,
    mode: 'subscription',
    success_url: opts?.successPath ? `${window.location.origin}${opts.successPath}` : undefined,
    cancel_url: opts?.cancelPath ? `${window.location.origin}${opts.cancelPath}` : undefined,
    metadata: user?.id ? { user_id: user.id } : undefined,
  };
  const data = await postJSON('/api/create-checkout-session', payload);
  if (data?.url) window.location.href = data.url as string;
}

export async function startOneTimePurchase(
  priceId: string,
  opts?: { successPath?: string; cancelPath?: string; metadata?: Record<string, string> }
) {
  if (!priceId) throw new Error('Falta el priceId del plan');
  const { data: { user } } = await supabase.auth.getUser();
  const payload: any = {
    priceId,
    mode: 'payment',
    success_url: opts?.successPath ? `${window.location.origin}${opts.successPath}` : undefined,
    cancel_url: opts?.cancelPath ? `${window.location.origin}${opts.cancelPath}` : undefined,
    metadata: { ...(opts?.metadata || {}), ...(user?.id ? { user_id: user.id } : {}) },
  };
  const data = await postJSON('/api/create-checkout-session', payload);
  if (data?.url) window.location.href = data.url as string;
}

export async function getMySubscription() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { plan_tier: 'free', status: 'inactive', stripe_customer_id: null } as const;

  const { data, error } = await supabase
    .from('profiles')
    .select('plan,plan_status,stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  const plan = (data?.plan as string | null) || null;
  const status = (data?.plan_status as string | null) || (plan ? 'active' : 'inactive');
  return {
    plan_tier: (plan as any) || 'free',
    status,
    stripe_customer_id: (data?.stripe_customer_id as string | null) || null,
  };
}

export async function openCustomerPortal(customerId: string) {
  const data = await postJSON('/api/create-portal-session', { customerId });
  if (data?.url) window.location.href = data.url as string;
}
