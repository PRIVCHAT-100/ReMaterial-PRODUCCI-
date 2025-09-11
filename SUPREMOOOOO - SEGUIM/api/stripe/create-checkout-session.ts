
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const feeBps = Number(process.env.PLATFORM_FEE_BPS || '200'); // 2.00%

function bpsToPercent(bps: number) { return Math.max(0, bps) / 100; }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { mode, amount, currency = 'eur', priceId, sellerAccountId, metadata = {}, applicationFeeAmountCents } = req.body || {};

    if (!mode || !['payment', 'subscription'].includes(mode)) return res.status(400).json({ error: 'Missing or invalid mode' });
    if (!sellerAccountId) return res.status(400).json({ error: 'Missing sellerAccountId' });

    const success_url = `${process.env.DOMAIN}/pago/exito?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${process.env.DOMAIN}/pago/cancelado`;

    let params: Stripe.Checkout.SessionCreateParams = { mode, success_url, cancel_url, metadata, payment_method_types: ['card'] };

    if (mode === 'payment') {
      if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'Missing or invalid amount (cents)' });
      const platformFee = typeof applicationFeeAmountCents === 'number'
        ? Math.max(0, Math.floor(applicationFeeAmountCents))
        : Math.floor(amount * (feeBps / 10000)); // default 2%

      params = {
        ...params,
        line_items: [{
          price_data: {
            currency,
            unit_amount: amount,
            product_data: { name: (metadata as any)?.product_name || 'Compra en ReMaterial' },
          },
          quantity: 1,
        }],
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: { destination: sellerAccountId },
        },
      };
    } else {
      if (!priceId) return res.status(400).json({ error: 'Missing priceId for subscription' });
      params = {
        ...params,
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: {
          transfer_data: { destination: sellerAccountId },
          application_fee_percent: bpsToPercent(feeBps),
        },
      };
    }

    const idempotencyKey = (metadata as any)?.offer_id ? `offer-${(metadata as any).offer_id}` : undefined;
    const session = await stripe.checkout.sessions.create(params, idempotencyKey ? { idempotencyKey } : undefined);

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
