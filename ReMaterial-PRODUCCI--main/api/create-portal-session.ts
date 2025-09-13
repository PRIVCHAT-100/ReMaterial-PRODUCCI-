import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

function resolveOrigin(req: VercelRequest): string {
  const hdrOrigin = (req.headers['origin'] as string) || '';
  const hdrReferer = (req.headers['referer'] as string) || '';
  const fromReferer = hdrReferer ? hdrReferer.replace(/\/[^/]*$/, '') : '';
  return (
    hdrOrigin ||
    fromReferer ||
    (process.env.NEXT_PUBLIC_SITE_URL as string) ||
    (process.env.SITE_URL as string) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = resolveOrigin(req);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
  const stripe = new Stripe(sk, { apiVersion: '2024-06-20' as any });

  const rawBody = (req as any).body;
  const body = typeof rawBody === 'string' ? JSON.parse(rawBody || '{}') : (rawBody || {});
  const { customerId } = (body || {}) as { customerId?: string };
  if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/plans`,
    });
    res.setHeader('Access-Control-Allow-Origin', origin);
    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error('[create-portal-session] Stripe error:', e?.message || e);
    return res.status(500).json({ error: 'Portal session creation failed' });
  }
}
