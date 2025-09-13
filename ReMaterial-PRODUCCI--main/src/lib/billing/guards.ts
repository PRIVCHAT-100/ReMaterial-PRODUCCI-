export type PlanKey = 'basic' | 'premium' | 'pro_plus' | null | undefined;

export function productLimitFor(plan: PlanKey): number | 'unlimited' {
  switch (plan) {
    case 'basic': return 20;
    case 'premium': return 40;
    case 'pro_plus': return 'unlimited';
    default: return 0;
  }
}

export function hasAdvancedInventory(plan: PlanKey): boolean {
  return plan === 'premium' || plan === 'pro_plus';
}
