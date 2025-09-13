
import Stripe from 'stripe';
import { corsHeaders, detectOrigin } from '../_utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });

export default async function handler(req: any, res: any) {
  const origin = detectOrigin(req);
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Methods', cors['Access-Control-Allow-Methods']);
    res.setHeader('Access-Control-Allow-Headers', cors['Access-Control-Allow-Headers']);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { priceId, amount, currency = 'eur', quantity = 1, success_url, cancel_url, metadata = {} } = body;
    if (!priceId && !amount) {
      res.setHeader('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
      return res.status(400).json({ error: 'Provide priceId or amount' });
    }
    const siteOrigin = origin;
    const successUrl = success_url || `${siteOrigin}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = cancel_url || `${siteOrigin}/plans`;
    const line_items: any[] = priceId ? [{ price: priceId, quantity }] : [{ price_data: { currency, product_data: { name: 'One-time payment' }, unit_amount: Number(amount) }, quantity }];
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      allow_promotion_codes: true,
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata as Record<string, string>
    });
    res.setHeader('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('[create-payment-session] error', err);
    res.setHeader('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
    return res.status(500).json({ error: err?.message || 'Internal Error' });
  }
}
