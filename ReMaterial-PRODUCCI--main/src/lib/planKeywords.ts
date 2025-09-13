/**
 * getIncludedKeywordsForPlan
 * Devuelve el número de palabras clave incluidas gratuitamente según el plan/price.
 * Cambios mínimos: módulo aislado para no tocar `billing.ts`.
 *
 * Acepta tanto slugs de plan ("basic", "premium", "pro_plus") como price IDs de Stripe.
 * Lee los PRICE IDs desde variables Vite: import.meta.env.VITE_PRICE_* (*obligatorio en frontend*).
 * Tolerante a mayúsculas/minúsculas y valores null/undefined.
 */
export function getIncludedKeywordsForPlan(planIdOrPriceId?: string | null): number {
  if (!planIdOrPriceId) return 0;
  const v = String(planIdOrPriceId).toLowerCase().trim();

  // Slugs tolerados
  if (v === "basic") return 0;
  if (v === "premium") return 1;
  if (v === "pro+" || v === "pro_plus" || v === "proplus" || v === "pro-plus") return 3;

  // Price IDs de Stripe (frontend)
  const PRICE = {
    BASIC_MONTHLY: import.meta.env.VITE_PRICE_BASIC_MONTHLY as string | undefined,
    BASIC_YEARLY: import.meta.env.VITE_PRICE_BASIC_YEARLY as string | undefined,
    PREMIUM_MONTHLY: import.meta.env.VITE_PRICE_PREMIUM_MONTHLY as string | undefined,
    PREMIUM_YEARLY: import.meta.env.VITE_PRICE_PREMIUM_YEARLY as string | undefined,
    PRO_PLUS_MONTHLY: import.meta.env.VITE_PRICE_PRO_PLUS_MONTHLY as string | undefined,
    PRO_PLUS_YEARLY: import.meta.env.VITE_PRICE_PRO_PLUS_YEARLY as string | undefined,
  };

  // Soporte opcional si alguien puso PRODUCT en vez de PRICE (evita romper UI si existe esa confusión)
  const PRODUCT = {
    BASIC_MONTHLY: (import.meta as any).env?.VITE_PRODUCT_BASIC_MONTHLY as string | undefined,
    BASIC_YEARLY: (import.meta as any).env?.VITE_PRODUCT_BASIC_YEARLY as string | undefined,
    PREMIUM_MONTHLY: (import.meta as any).env?.VITE_PRODUCT_PREMIUM_MONTHLY as string | undefined,
    PREMIUM_YEARLY: (import.meta as any).env?.VITE_PRODUCT_PREMIUM_YEARLY as string | undefined,
    PRO_PLUS_MONTHLY: (import.meta as any).env?.VITE_PRODUCT_PRO_PLUS_MONTHLY as string | undefined,
    PRO_PLUS_YEARLY: (import.meta as any).env?.VITE_PRODUCT_PRO_PLUS_YEARLY as string | undefined,
  };

  const target = planIdOrPriceId;

  const isAny = (ids: (string | undefined)[]) =>
    ids.filter(Boolean).some((id) => id === target);

  if (
    isAny([PRICE.PREMIUM_MONTHLY, PRICE.PREMIUM_YEARLY, PRODUCT.PREMIUM_MONTHLY, PRODUCT.PREMIUM_YEARLY])
  ) {
    return 1;
  }

  if (
    isAny([PRICE.PRO_PLUS_MONTHLY, PRICE.PRO_PLUS_YEARLY, PRODUCT.PRO_PLUS_MONTHLY, PRODUCT.PRO_PLUS_YEARLY])
  ) {
    return 3;
  }

  // Por defecto, 0
  return 0;
}
