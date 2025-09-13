import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) {
    return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
  }
  const stripe = new Stripe(sk, { apiVersion: '2025-01-27' as any });
  try {
    const { priceId } = (req.body || {}) as { priceId?: string };
    if (!priceId) return res.status(400).json({ error: 'Missing priceId' });
    const origin =
      (req.headers?.origin as string) ||
      (process.env.NEXT_PUBLIC_SITE_URL as string) ||
      (process.env.SITE_URL as string) ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rematerial.cat');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/plans`,
    });
    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error('[create-payment-session] Stripe error:', e?.message || e);
    return res.status(500).json({ error: 'Payment session creation failed' });
  }
}