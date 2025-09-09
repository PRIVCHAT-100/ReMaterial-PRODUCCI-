// api/stripe/create-checkout-session.js
// Creates a Stripe Checkout Session for subscriptions.
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Small util to safely parse JSON body
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
    const { priceId, userId, email, successPath, cancelPath } = await parseJson(req);

    if (!priceId) {
      res.statusCode = 400;
      return res.json({ error: "Missing priceId" });
    }
    // userId and email improve reconciliation on the webhook
    // In production, prefer verifying the requester with a Supabase JWT on the server.
    const success_url = `${process.env.APP_URL}${successPath || "/settings/billing"}?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${process.env.APP_URL}${cancelPath || "/onboarding/plan"}?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
      customer_creation: "if_required",
      customer_email: email || undefined,
      metadata: {
        supabase_uid: userId || "",
      },
      subscription_data: {
        metadata: {
          supabase_uid: userId || "",
        },
      },
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    res.statusCode = 500;
    return res.json({ error: "Internal error creating session" });
  }
};