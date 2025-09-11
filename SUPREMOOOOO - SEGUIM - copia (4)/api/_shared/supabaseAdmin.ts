
// api/_shared/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export function toIntOrNull(v: any): number | null {
  const n = typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? Math.floor(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function setStripeAccountId(userId: string, accountId: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ stripe_account_id: accountId, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, stripe_account_id, plan, plan_status, stripe_customer_id')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function createOrderFromPayment(params: {
  conversation_id?: string | null;
  offer_id?: string | null;
  product_id?: string | null;
  buyer_id?: string | null;
  seller_id?: string | null;
  quantity?: number | null;
  unit_amount_cents?: number | null;
  amount_total_cents: number;
  currency: string;
  stripe_payment_intent_id?: string | null;
}) {
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      conversation_id: params.conversation_id || null,
      product_id: params.product_id || null,
      buyer_id: params.buyer_id || null,
      seller_id: params.seller_id || null,
      quantity: params.quantity || 1,
      agreed_price_cents: params.unit_amount_cents || params.amount_total_cents,
      amount_total_cents: params.amount_total_cents,
      currency: params.currency,
      stripe_payment_intent_id: params.stripe_payment_intent_id || null,
      status: 'paid',
    })
    .select('*')
    .single();

  if (orderErr) {
    console.error('createOrder insert error:', orderErr);
    throw orderErr;
  }

  // Decrementa inventario si existe
  if (params.product_id && params.quantity && params.quantity > 0) {
    try {
      const { error: invErr } = await supabaseAdmin.rpc('decrement_inventory_if_exists', {
        p_product_id: params.product_id,
        p_qty: params.quantity,
      });
      if (invErr) console.warn('Inventory RPC warn:', invErr.message);
    } catch (e: any) {
      console.warn('Inventory RPC missing; skipping:', e.message);
    }
  }

  // Marca oferta como comprada si aplica
  if (params.offer_id) {
    const { error: offerErr } = await supabaseAdmin
      .from('offers')
      .update({ status: 'purchased', updated_at: new Date().toISOString() })
      .eq('id', params.offer_id);
    if (offerErr) console.warn('Offer update warn:', offerErr.message);
  }

  return order;
}

export async function setProfilePlanFromSubscription(params: {
  buyer_id: string;
  plan: string;
  plan_status: string;
  current_period_end?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: params.plan,
      plan_status: params.plan_status,
      plan_current_period_end: params.current_period_end || null,
      stripe_customer_id: params.stripe_customer_id || null,
      stripe_subscription_id: params.stripe_subscription_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.buyer_id);
  if (error) throw error;
}
