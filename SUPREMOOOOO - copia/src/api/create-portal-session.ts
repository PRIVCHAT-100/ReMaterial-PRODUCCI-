import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid user' });

    let customer: string | null = null;
// subscriptions (si existe)
try {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  customer = sub?.stripe_customer_id || null;
} catch {}
// fallback: profiles
if (!customer) {
  try {
    const { data: prof } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();
    customer = prof?.stripe_customer_id || null;
  } catch {}
}
    if (!customer) return res.status(400).json({ error: 'No Stripe customer found' });

    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url: (req.headers.origin as string) || 'https://'+(req.headers.host||'example.com')+'/settings/billing'
    });

    return res.status(200).json({ url: session.url });
  } catch (e:any) {
    return res.status(500).json({ error: e.message });
  }
}
