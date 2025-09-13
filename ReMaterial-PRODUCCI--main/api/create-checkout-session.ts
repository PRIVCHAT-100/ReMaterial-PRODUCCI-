import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

function detectOrigin(req: any): string {
  const headers: any = req?.headers || {};
  const hasGet = headers && typeof headers.get === 'function';
  const get = (k: string) => hasGet ? headers.get(k) : (headers[k?.toLowerCase()] ?? headers[k]);
  let origin = (get?.('origin') || get?.('referer') || '') as string;
  if (origin) { try { origin = new URL(origin).origin; } catch { /* ignore */ } }
  if (!origin) {
    origin =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');
  }
  return origin;
}
function setCors(res: VercelResponse, origin: string) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = detectOrigin(req);

  if (req.method === 'OPTIONS') {
    setCors(res, origin);
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    setCors(res, origin);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: any = req.body || {};
    const priceId: string = body.priceId;
    const mode: 'payment' | 'subscription' = body.mode || 'subscription';
    const quantity: number = body.quantity || 1;
    const customer_email: string | undefined = body.customer_email;
    const metadata: Record<string, string> | undefined = body.metadata;
    const success_url: string | undefined = body.success_url;
    const cancel_url: string | undefined = body.cancel_url;

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY on server');
    }
    if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
      throw new Error('Missing or invalid priceId (expected a Stripe price_...)');
    }

    const siteOrigin = origin;
    const successUrl = success_url || `${siteOrigin}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = cancel_url || `${siteOrigin}/plans`;

    const params: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: [{ price: priceId, quantity }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata,
    };
    if (customer_email) (params as any).customer_email = customer_email;

    const session = await stripe.checkout.sessions.create(params);
    setCors(res, origin);
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('[create-checkout-session] error:', err?.message || err);
    setCors(res, origin);
    return res.status(500).json({
      error: 'Stripe session creation failed',
      message: err?.message || 'Internal Server Error',
    });
  }
}