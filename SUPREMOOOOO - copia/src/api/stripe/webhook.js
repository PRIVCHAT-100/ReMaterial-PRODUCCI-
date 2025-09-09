// api/stripe/webhook.js
// Handles Stripe webhooks to sync subscription state into Supabase.
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Collect raw body for signature verification
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function tierFromPriceId(priceId) {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_BASIC) return "basic";
  return "free";
}

async function upsertSubscriptionByCustomer({
  supabase_uid,
  stripe_customer_id,
  stripe_subscription_id,
  price_id,
  status,
  current_period_end,
  cancel_at_period_end,
}) {
  // Try to upsert based on stripe_customer_id
  const plan_tier = tierFromPriceId(price_id);

  const payload = {
    user_id: supabase_uid || null,
    stripe_customer_id,
    stripe_subscription_id,
    price_id,
    plan_tier,
    status,
    current_period_end: current_period_end ? new Date(current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: !!cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  // Ensure a row exists for this customer
  const { data: existing, error: fetchErr } = await supabase
    .from("billing_subscriptions")
    .select("id, user_id")
    .or(`stripe_customer_id.eq.${stripe_customer_id},user_id.eq.${supabase_uid || "00000000-0000-0000-0000-000000000000"}`)
    .limit(1)
    .maybeSingle();

  if (fetchErr) {
    console.error("Supabase fetch error:", fetchErr);
  }

  if (existing) {
    const { error } = await supabase
      .from("billing_subscriptions")
      .update(payload)
      .eq("id", existing.id);
    if (error) console.error("Supabase update error:", error);
    return;
  }

  const { error: insertErr } = await supabase
    .from("billing_subscriptions")
    .insert({
      ...payload,
      created_at: new Date().toISOString(),
    });
  if (insertErr) console.error("Supabase insert error:", insertErr);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    res.statusCode = 400;
    return res.send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const supabase_uid = session.metadata?.supabase_uid || session.subscription?.metadata?.supabase_uid || null;
        const stripe_customer_id = session.customer;
        const stripe_subscription_id = session.subscription;

        let subscription = null;
        if (stripe_subscription_id) {
          subscription = await stripe.subscriptions.retrieve(stripe_subscription_id);
        }
        const price_id = subscription?.items?.data?.[0]?.price?.id || null;
        const status = subscription?.status || "active";
        const current_period_end = subscription?.current_period_end || null;
        const cancel_at_period_end = subscription?.cancel_at_period_end || false;

        await upsertSubscriptionByCustomer({
          supabase_uid,
          stripe_customer_id,
          stripe_subscription_id,
          price_id,
          status,
          current_period_end,
          cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const stripe_customer_id = sub.customer;
        const stripe_subscription_id = sub.id;
        const price_id = sub.items?.data?.[0]?.price?.id || null;
        const status = sub.status;
        const current_period_end = sub.current_period_end;
        const cancel_at_period_end = sub.cancel_at_period_end || false;
        const supabase_uid = sub.metadata?.supabase_uid || null;

        await upsertSubscriptionByCustomer({
          supabase_uid,
          stripe_customer_id,
          stripe_subscription_id,
          price_id,
          status,
          current_period_end,
          cancel_at_period_end,
        });
        break;
      }

      default:
        // Ignore other events
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.statusCode = 500;
    res.json({ error: "Webhook handler failure" });
  }
};