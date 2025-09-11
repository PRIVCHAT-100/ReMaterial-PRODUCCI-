// api/create-checkout-session.ts
import Stripe from 'stripe';

// Vercel Node.js Function
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

  try {
    const { priceId, mode = 'subscription', success_url, cancel_url, customer_email } = req.body || {};

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    const origin = req.headers['origin'] || process.env.PUBLIC_URL || '';
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || (origin ? `${origin}/billing/success` : '/billing/success'),
      cancel_url: cancel_url || (origin ? `${origin}/billing/cancel` : '/billing/cancel'),
      customer_email,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (e: any) {
    console.error('[api/create-checkout-session] error:', e);
    return res.status(500).json({ error: e?.message || 'Stripe error' });
  }
}
