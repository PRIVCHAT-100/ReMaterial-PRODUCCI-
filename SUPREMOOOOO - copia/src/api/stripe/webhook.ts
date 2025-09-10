import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

function buffer(req: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = [];
    req.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Map price IDs to internal plan keys via ENV (no code changes needed)
const PRICE_TO_PLAN: Record<string, 'basic' | 'premium' | 'pro_plus'> = Object.fromEntries(
  [
    [process.env.PRICE_BASIC_MONTHLY, 'basic'],
    [process.env.PRICE_BASIC_YEARLY, 'basic'],
    [process.env.PRICE_PREMIUM_MONTHLY, 'premium'],
    [process.env.PRICE_PREMIUM_YEARLY, 'premium'],
    [process.env.PRICE_PRO_PLUS_MONTHLY, 'pro_plus'],
    [process.env.PRICE_PRO_PLUS_YEARLY, 'pro_plus'],
  ].filter((x): x is [string, 'basic'|'premium'|'pro_plus'] => Boolean(x[0]))
);

function mapPlanFromPriceId(priceId?: string): 'basic' | 'premium' | 'pro_plus' | null {
  if (!priceId) return null;
  return PRICE_TO_PLAN[priceId] || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const status = sub.status;
        const currentPeriodEnd = new Date((sub.current_period_end || 0) * 1000).toISOString();
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        try {
          const { data: local, error: lerr } = await supabase
            .from('subscriptions')
            .select('id, user_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          if (!lerr && local?.user_id) {
            const { error } = await supabase
              .from('profiles')
              .update({
                plan_status: status,
                plan_current_period_end: currentPeriodEnd,
                stripe_customer_id: customerId,
                stripe_subscription_id: sub.id,
                updated_at: new Date().toISOString(),
              })
              .eq('id', local.user_id);
            if (error) console.warn('[webhook] update profile plan error', error.message);
          }
        } catch (e) {
          console.warn('[webhook] subscription.updated handler issue', (e as any)?.message);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        try {
          const { data: local, error: lerr } = await supabase
            .from('subscriptions')
            .select('id, user_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          if (!lerr && local?.user_id) {
            const { error } = await supabase
              .from('profiles')
              .update({
                plan: null,
                plan_status: 'canceled',
                plan_current_period_end: null,
                stripe_subscription_id: null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', local.user_id);
            if (error) console.warn('[webhook] delete profile plan error', error.message);
          }
        } catch (e) {
          console.warn('[webhook] subscription.deleted handler issue', (e as any)?.message);
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        try {
          const { data: local, error: lerr } = await supabase
            .from('subscriptions')
            .select('id, user_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          if (!lerr && local?.user_id) {
            const { error } = await supabase
              .from('profiles')
              .update({
                plan_status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('id', local.user_id);
            if (error) console.warn('[webhook] invoice.payment_failed profile update error', error.message);
          }
        } catch (e) {
          console.warn('[webhook] invoice.payment_failed handler issue', (e as any)?.message);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = (session.subscription as string) || null;
        const customerId = (session.customer as string) || null;
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const priceId = lineItems.data[0]?.price?.id;
        const mappedPlan = mapPlanFromPriceId(priceId);

        const email = session.customer_details?.email || session.customer_email || null;
        if (!email) break;

        const { data: userProfile, error: userErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        if (userErr || !userProfile) break;

        const sub = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;

        const { error: upSubErr } = await supabase.from('subscriptions').insert({
          user_id: userProfile.id,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: mappedPlan,
          status: sub?.status || null,
          current_period_start: sub ? new Date(sub.current_period_start * 1000).toISOString() : null,
          current_period_end: sub ? new Date(sub.current_period_end * 1000).toISOString() : null,
        });
        if (upSubErr) console.warn('[webhook] subscriptions insert error', upSubErr.message);

        if (mappedPlan) {
          const { error: upProfErr } = await supabase
            .from('profiles')
            .update({
              plan: mappedPlan,
              plan_started_at: sub ? new Date(sub.current_period_start * 1000).toISOString() : new Date().toISOString(),
              plan_renews_at: sub ? new Date(sub.current_period_end * 1000).toISOString() : null,
            })
            .eq('id', userProfile.id);
          if (upProfErr) console.warn('[webhook] profiles update error', upProfErr.message);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.canceled': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: localSubs, error: findErr } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_customer_id', customerId)
          .limit(1);
        if (findErr || !localSubs?.length) break;

        const local = localSubs[0];

        const { error: updErr } = await supabase.from('subscriptions').update({
          status: sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('id', local.id);
        if (updErr) console.warn('[webhook] subscriptions update error', updErr.message);

        if (['canceled','unpaid','incomplete_expired','paused'].includes(sub.status)) {
          const { error: profErr } = await supabase
            .from('profiles')
            .update({ plan: null, plan_started_at: null, plan_renews_at: null })
            .eq('id', local.user_id);
          if (profErr) console.warn('[webhook] profiles downgrade error', profErr.message);
        }
        break;
      }
    }
  } catch (e:any) {
    console.error('[webhook] error', e);
  }

  return res.json({ received: true });
}
