
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
    const { customer_id, return_url } = body;
    if (!customer_id) {
      res.setHeader('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
      return res.status(400).json({ error: 'Missing customer_id' });
    }
    const siteOrigin = origin;
    const retUrl = return_url || `${siteOrigin}/dashboard`;
    const session = await stripe.billingPortal.sessions.create({ customer: customer_id, return_url: retUrl });
    res.setHeader('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('[create-portal-session] error', err);
    res.setHeader('Access-Control-Allow-Origin', cors['Access-Control-Allow-Origin']);
    return res.status(500).json({ error: err?.message || 'Internal Error' });
  }
}
