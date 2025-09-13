export type PlanKey = 'basic' | 'premium' | 'pro_plus';

export type PlanSpec = {
  name: string;
  monthlyPriceId: string;
  monthlyAmount: number | null;
};

const env = (key: string) => (import.meta as any).env?.[key] || '';

export const PLANS: Record<PlanKey, PlanSpec> = {
  basic: {
    name: 'Basic',
    monthlyPriceId: import.meta.env.VITE_PRICE_BASIC_MONTHLY || '',
    monthlyAmount: 29.99,
  },
  premium: {
    name: 'Premium',
    monthlyPriceId: import.meta.env.VITE_PRICE_PREMIUM_MONTHLY || '',
    monthlyAmount: 44.99,
  },
  pro_plus: {
    name: 'Pro+',
    monthlyPriceId: import.meta.env.VITE_PRICE_PRO_PLUS_MONTHLY || '',
    monthlyAmount: 69.99,
  },
};
