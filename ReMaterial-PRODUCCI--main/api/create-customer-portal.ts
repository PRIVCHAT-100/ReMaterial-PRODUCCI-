// api/create-customer-portal.ts
import Stripe from 'stripe';

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
    const { customerId, returnUrl } = req.body || {};
    if (!customerId) {
      return res.status(400).json({ error: 'Missing customerId' });
    }

    const origin = req.headers['origin'] || process.env.PUBLIC_URL || '';
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || (origin ? String(origin) : '/settings/billing'),
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error('[api/create-customer-portal] error:', e);
    return res.status(500).json({ error: e?.message || 'Stripe error' });
  }
}
