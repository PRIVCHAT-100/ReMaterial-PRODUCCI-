// api/stripe/create-portal-session.js
// Creates a Stripe Billing Portal Session for the given customer (or by userId lookup).
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function parseJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.json({ error: "Method not allowed" });
  }

  try {
    const { customerId, userId } = await parseJson(req);

    let stripeCustomerId = customerId;

    if (!stripeCustomerId && userId) {
      // Try to look up by DB subscription or profile
      const { data: sub } = await supabase
        .from("billing_subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (sub?.stripe_customer_id) stripeCustomerId = sub.stripe_customer_id;

      if (!stripeCustomerId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("stripe_customer_id")
          .eq("id", userId)
          .maybeSingle();
        if (profile?.stripe_customer_id) stripeCustomerId = profile.stripe_customer_id;
      }
    }

    if (!stripeCustomerId) {
      res.statusCode = 400;
      return res.json({ error: "Missing customerId (and userId lookup failed)" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.APP_URL}/settings/billing`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("create-portal-session error:", err);
    res.statusCode = 500;
    return res.json({ error: "Internal error creating portal session" });
  }
};