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

const PRICE_BASIC_MONTHLY  = env('VITE_PRICE_BASIC_MONTHLY');
const PRICE_BASIC_YEARLY   = env('VITE_PRICE_BASIC_YEARLY');
const PRICE_PREMIUM_MONTHLY= env('VITE_PRICE_PREMIUM_MONTHLY');
const PRICE_PREMIUM_YEARLY = env('VITE_PRICE_PREMIUM_YEARLY');
const PRICE_PRO_PLUS_MONTHLY=env('VITE_PRICE_PRO_PLUS_MONTHLY');
const PRICE_PRO_PLUS_YEARLY =env('VITE_PRICE_PRO_PLUS_YEARLY');
const PRICE_KEYWORD_EXTRA_MONTHLY = env('VITE_PRICE_KEYWORD_EXTRA_MONTHLY');

export const PLANS: Record<PlanKey, PlanSpec> = {
  basic: {
    name: 'Básico',
    monthly: { priceId: PRICE_BASIC_MONTHLY, amount: 29.99 },
    yearly:  { priceId: PRICE_BASIC_YEARLY, amount: 299.90 },
    limits: { products: 20 },
    includedKeywords: 0,
    extraKeywordMonthly: 9.99,
    features: [
      'Publicar hasta 20 productos a la vez',
      'Perfil de empresa completo',
      'Chat y negociación con compradores',
      'Pedidos y ventas activas',
      'Sin gestión de inventario avanzada (solo número total al crear producto)',
      'Soporte básico por email',
    ],
    keywordExtraPriceId: PRICE_KEYWORD_EXTRA_MONTHLY,
  },
  premium: {
    name: 'Premium',
    monthly: { priceId: PRICE_BASIC_MONTHLY, amount: 44.99 },
    yearly:  { priceId: PRICE_BASIC_YEARLY, amount: 449.90 },
    limits: { products: 40 },
    includedKeywords: 1,
    extraKeywordMonthly: 9.99,
    features: [
      'Incluye todo lo del Básico, más:',
      'Publicar hasta 40 productos a la vez',
      'Gestión de inventario avanzada (resta automática, edición manual, alertas de stock bajo)',
      '1 palabra clave destacada gratis incluida (extra: 9,99€/mes por keyword adicional)',
      'Estadísticas avanzadas de ventas y visitas',
      'Soporte prioritario',
    ],
    keywordExtraPriceId: PRICE_KEYWORD_EXTRA_MONTHLY,
  },
  pro_plus: {
    name: 'Pro+',
    monthly: { priceId: PRICE_BASIC_MONTHLY, amount: 69.99 },
    yearly:  { priceId: PRICE_BASIC_YEARLY, amount: 699.90 },
    limits: { products: 'unlimited' },
    includedKeywords: 3,
    extraKeywordMonthly: 9.99,
    features: [
      'Incluye todo lo del Premium, más:',
      'Publicar productos ilimitados',
      '3 palabras clave destacadas gratis incluidas (extra: 9,99€/mes por keyword adicional)',
      'Acceso completo a todas las herramientas analíticas',
      'Logo de empresa destacado en su perfil y fichas de producto',
      'Soporte preferente (respuesta rápida)',
    ],
    keywordExtraPriceId: PRICE_KEYWORD_EXTRA_MONTHLY,
  },
};
