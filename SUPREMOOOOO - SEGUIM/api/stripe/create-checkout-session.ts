import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { priceId, success_url, cancel_url, customer_email, mode = 'subscription' } = req.body || {};
    if (!priceId) return res.status(400).json({ error: 'Missing priceId' });

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: success_url || `${req.headers.origin}/billing/success`,
      cancel_url: cancel_url || `${req.headers.origin}/billing/cancel`,
      customer_email,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (e:any) {
    return res.status(500).json({ error: e.message || 'Stripe error' });
  }
}
