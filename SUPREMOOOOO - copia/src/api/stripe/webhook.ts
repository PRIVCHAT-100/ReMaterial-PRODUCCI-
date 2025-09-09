
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createOrderFromPayment, setProfilePlanFromSubscription, toIntOrNull } from '../_shared/supabaseAdmin';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

function buffer(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const sig = req.headers['stripe-signature'] as string;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) return res.status(500).send('Missing STRIPE_WEBHOOK_SECRET');

  let event: Stripe.Event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, whSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'payment') {
          const piId = session.payment_intent as string | null;
          const amount_total = session.amount_total ?? 0;
          const currency = session.currency ?? 'eur';
          const md = (session.metadata || {}) as Record<string, string>;
          const quantity = toIntOrNull(md.quantity);
          const unit_amount_cents = toIntOrNull(md.unit_price_cents);
          await createOrderFromPayment({
            conversation_id: md.conversation_id || null,
            offer_id: md.offer_id || null,
            product_id: md.product_id || null,
            buyer_id: md.buyer_id || null,
            seller_id: md.seller_id || null,
            quantity: quantity ?? 1,
            unit_amount_cents: unit_amount_cents ?? null,
            amount_total_cents: amount_total,
            currency,
            stripe_payment_intent_id: piId || null,
          });
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const buyer_id = (sub.metadata as any)?.buyer_id;
        if (buyer_id) {
          await setProfilePlanFromSubscription({
            buyer_id,
            plan: (sub.items.data[0]?.price?.id) || 'plan',
            plan_status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
            stripe_subscription_id: sub.id,
          });
        }
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error', err);
    return res.status(500).send('Webhook handler error');
  }
}
