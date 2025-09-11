// src/lib/billing/plans.ts
export type PlanKey = 'basic' | 'premium' | 'pro_plus';

export type PlanSpec = {
  name: string;
  monthly: { priceId: string; amount: number };
  yearly: { priceId: string; amount: number };
  limits: { products: number | 'unlimited' };
  includedKeywords: number;
  extraKeywordMonthly: number;
  features: string[];
  keywordExtraPriceId?: string;
};

const env = (key: string) => (import.meta as any).env?.[key] || '';

// Stripe Price IDs (Vite envs)
const PRICE_BASIC_MONTHLY   = env('VITE_PRICE_BASIC_MONTHLY');
const PRICE_BASIC_YEARLY    = env('VITE_PRICE_BASIC_YEARLY');
const PRICE_PREMIUM_MONTHLY = env('VITE_PRICE_PREMIUM_MONTHLY');
const PRICE_PREMIUM_YEARLY  = env('VITE_PRICE_PREMIUM_YEARLY');
const PRICE_PRO_PLUS_MONTHLY= env('VITE_PRICE_PRO_PLUS_MONTHLY');
const PRICE_PRO_PLUS_YEARLY = env('VITE_PRICE_PRO_PLUS_YEARLY');
const PRICE_KEYWORD_EXTRA_MONTHLY = env('VITE_PRICE_KEYWORD_EXTRA_MONTHLY'); // 9,99€/mes

export const PLANS: Record<PlanKey, PlanSpec> = {
  basic: {
    name: 'Básico',
    monthly: { priceId: PRICE_BASIC_MONTHLY, amount: 29.99 },
    yearly:  { priceId: PRICE_BASIC_YEARLY,  amount: 299.90 },
    limits: { products: 20 },
    includedKeywords: 0,
    extraKeywordMonthly: 9.99,
    features: [
      'Publicar hasta 20 productos',
      'Perfil de empresa visible en el directorio',
      'Soporte estándar por email',
      'Sin comisión adicional (mantener comisión por venta actual)',
    ],
    keywordExtraPriceId: PRICE_KEYWORD_EXTRA_MONTHLY,
  },
  premium: {
    name: 'Premium',
    monthly: { priceId: PRICE_PREMIUM_MONTHLY, amount: 44.99 },
    yearly:  { priceId: PRICE_PREMIUM_YEARLY,  amount: 449.90 },
    limits: { products: 40 },
    includedKeywords: 1,
    extraKeywordMonthly: 9.99,
    features: [
      'Todo lo del Básico, más:',
      'Publicar hasta 40 productos',
      'Gestión de inventario avanzada',
      '1 palabra clave destacada incluida (extras a 9,99€/mes)',
    ],
    keywordExtraPriceId: PRICE_KEYWORD_EXTRA_MONTHLY,
  },
  pro_plus: {
    name: 'Pro+',
    monthly: { priceId: PRICE_PRO_PLUS_MONTHLY, amount: 69.99 },
    yearly:  { priceId: PRICE_PRO_PLUS_YEARLY,  amount: 699.90 },
    limits: { products: 'unlimited' },
    includedKeywords: 3,
    extraKeywordMonthly: 9.99,
    features: [
      'Incluye todo lo del Premium, más:',
      'Publicar productos ilimitados',
      '3 palabras clave destacadas incluidas (extras a 9,99€/mes)',
      'Acceso a analíticas avanzadas',
      'Logo de empresa destacado en perfil y fichas',
      'Soporte preferente',
    ],
    keywordExtraPriceId: PRICE_KEYWORD_EXTRA_MONTHLY,
  },
};
