import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function rawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const PRICE_TO_TIER: Record<string, 'basic'|'premium'|'pro_plus'> = Object.fromEntries(
  [
    [process.env.PRICE_BASIC_MONTHLY, 'basic'],
    [process.env.PRICE_BASIC_YEARLY, 'basic'],
    [process.env.PRICE_PREMIUM_MONTHLY, 'premium'],
    [process.env.PRICE_PREMIUM_YEARLY, 'premium'],
    [process.env.PRICE_PRO_PLUS_MONTHLY, 'pro_plus'],
    [process.env.PRICE_PRO_PLUS_YEARLY, 'pro_plus'],
  ]
  .filter(Boolean)
  .map(([k, v]) => [String(k), v as any])
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  let event: Stripe.Event;
  try {
    const buf = await rawBody(req);
    const sig = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[webhook] signature error', err?.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata && (session.metadata as any).user_id) || null;
        let priceId: string | null = null;
        if (session.mode === 'subscription' && session.subscription) {
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          priceId = sub.items.data[0]?.price?.id || null;
        } else if (session.mode === 'payment') {
          // one-time purchases not used for gating plans now
        }

        const tier = priceId ? PRICE_TO_TIER[priceId] : undefined;
        const customerId = (typeof session.customer === 'string' ? session.customer : session.customer?.id) || null;

        if (userId && (tier || customerId)) {
          const updates: any = {};
          if (tier) { updates.plan = tier; updates.plan_status = 'active'; }
          if (customerId) updates.stripe_customer_id = customerId;
          if (Object.keys(updates).length > 0) {
            const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
            if (error) console.error('[webhook] profiles update error', error.message);
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const priceId = sub.items.data[0]?.price?.id || null;
        const tier = priceId ? PRICE_TO_TIER[priceId] : undefined;

        if (customerId && (tier || true)) { // update by customer id if we can find the profile
          const { data } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).maybeSingle();
          if (data?.id) {
            const { error } = await supabase.from('profiles').update({
              plan: tier || null,
              plan_status: sub.status === 'active' ? 'active' : sub.status
            }).eq('id', data.id);
            if (error) console.error('[webhook] subscription.updated profiles error', error.message);
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        if (customerId) {
          const { data } = await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId).maybeSingle();
          if (data?.id) {
            const { error } = await supabase.from('profiles').update({
              plan: null,
              plan_status: 'canceled'
            }).eq('id', data.id);
            if (error) console.error('[webhook] subscription.deleted profiles error', error.message);
          }
        }
        break;
      }
      default:
        // ignore others
        break;
    }
  } catch (e: any) {
    console.error('[webhook] handler error', e?.message || e);
  }

  return res.json({ received: true });
}
