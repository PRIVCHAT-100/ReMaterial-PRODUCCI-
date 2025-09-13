
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { supabaseAdmin } from '../_shared/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { userId, email, name } = req.body || {};
    if (!userId || !email) return res.status(400).json({ error: 'Missing userId or email' });

    const customer = await stripe.customers.create({ email, name });
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customer.id, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;

    return res.status(200).json({ customerId: customer.id });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
