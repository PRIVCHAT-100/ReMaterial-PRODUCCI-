
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { chargeId, reverseTransfer = true, refundApplicationFee = true } = req.body || {};
    if (!chargeId) return res.status(400).json({ error: 'Missing chargeId' });

    const refund = await stripe.refunds.create({
      charge: chargeId,
      reverse_transfer: !!reverseTransfer,
      refund_application_fee: !!refundApplicationFee,
    });

    return res.status(200).json(refund);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
