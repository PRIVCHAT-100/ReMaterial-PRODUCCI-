import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export type PlanKey = 'basic' | 'premium' | 'pro_plus' | null;

export function planProductLimit(plan: PlanKey): number | 'unlimited' {
  switch (plan) {
    case 'basic': return 20;
    case 'premium': return 40;
    case 'pro_plus': return 'unlimited';
    default: return 0;
  }
}

/**
 * Comprueba si el usuario puede publicar más productos.
 * No modifica nada: solo lee perfiles y conteo de productos activos.
 */
export async function canPublishMoreProducts(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; limit: number | 'unlimited'; current: number; }> {
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();
  if (profErr) throw profErr;

  const limit = planProductLimit(profile?.plan ?? null);

  const { count, error: cntErr } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('archived', false);
  if (cntErr) throw cntErr;

  if (limit === 'unlimited') return { allowed: true, limit, current: count || 0 };
  return { allowed: (count || 0) < (limit as number), limit: limit as number, current: count || 0 };
}
