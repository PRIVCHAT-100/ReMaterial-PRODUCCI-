
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { accountId, iconFileId, logoFileId, primary = '#2F6BFF', secondary = '#16A34A' } = req.body || {};
    if (!accountId) return res.status(400).json({ error: 'Missing accountId' });

    const account = await stripe.accounts.update(accountId, {
      settings: {
        branding: {
          icon: iconFileId || undefined,
          logo: logoFileId || undefined,
          primary_color: primary,
          secondary_color: secondary,
        },
      },
    });

    return res.status(200).json(account);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
