import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { setProfilePlanFromSubscription } from '../_shared/supabaseAdmin';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { subscriptionId, buyerId } = req.body || {};
    if (!subscriptionId) return res.status(400).json({ error: 'Missing subscriptionId' });
    const sub = await stripe.subscriptions.cancel(subscriptionId);
    if (buyerId) {
      await setProfilePlanFromSubscription({
        buyer_id: buyerId,
        plan: sub.items.data[0]?.price?.id || 'plan',
        plan_status: sub.status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
        stripe_subscription_id: sub.id,
      });
    }
    return res.status(200).json(sub);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
}
