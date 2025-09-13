
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { accountId } = req.body || {};
    if (!accountId) return res.status(400).json({ error: 'Missing accountId' });

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.DOMAIN}/onboarding/refresh`,
      return_url: `${process.env.DOMAIN}/onboarding/success`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: link.url });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
