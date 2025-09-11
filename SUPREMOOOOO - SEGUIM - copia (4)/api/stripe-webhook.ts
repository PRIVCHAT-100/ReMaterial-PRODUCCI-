import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

function buffer(req: any) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: any[] = [];
    req.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');
  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  import { createClient } from '@supabase/supabase-js';

switch (event.type) {
    case 'checkout.session.completed': {
      // Map price to plan key using env to avoid hardcoding
      const session = event.data.object as any;
      const line = (session?.display_items?.[0] || session?.line_items?.data?.[0]) || null;
      const priceId = (line && (line.price?.id || line.price)) || session?.metadata?.priceId || null;

      const priceToPlan: Record<string,string> = {
        [process.env.PRICE_BASIC_MONTHLY || '']: 'basic',
        [process.env.PRICE_BASIC_YEARLY  || '']: 'basic',
        [process.env.PRICE_PREMIUM_MONTHLY || '']: 'premium',
        [process.env.PRICE_PREMIUM_YEARLY  || '']: 'premium',
        [process.env.PRICE_PRO_PLUS_MONTHLY || '']: 'pro_plus',
        [process.env.PRICE_PRO_PLUS_YEARLY  || '']: 'pro_plus',
      };

      const plan = priceId ? priceToPlan[priceId] : null;
      const customerEmail = session?.customer_details?.email || session?.customer_email || null;
      const renewsAt = session?.subscription ? new Date(session.expires_at ? session.expires_at * 1000 : Date.now()) : null;

      if (plan && customerEmail) {
        const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

        // Update profiles by email (assuming emails are unique and stored in profiles.email)
        const { data: profiles, error: perr } = await supabase
          .from('profiles')
          .select('id,email')
          .eq('email', customerEmail)
          .limit(1)
          .maybeSingle();

        if (!perr && profiles?.id) {
          await supabase.from('profiles').update({
            plan,
            plan_started_at: new Date().toISOString(),
            plan_renews_at: renewsAt ? new Date(renewsAt).toISOString() : null
          }).eq('id', profiles.id);
        }
      }
      break;
    }
  }

  res.json({ received: true });
}
