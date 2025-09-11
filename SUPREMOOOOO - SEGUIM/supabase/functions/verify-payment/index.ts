import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    // Initialize Supabase with service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update order status based on payment status
    const orderStatus = session.payment_status === 'paid' ? 'paid' : 'failed';
    
    const { data: order, error: updateError } = await supabaseService
      .from('orders')
      .update({
        status: orderStatus,
        stripe_payment_intent_id: session.payment_intent,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', sessionId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // If payment successful, update product availability
    if (orderStatus === 'paid' && order) {
      const { data: product } = await supabaseService
        .from('products')
        .select('quantity')
        .eq('id', order.product_id)
        .single();

      if (product) {
        const newQuantity = product.quantity - order.quantity;
        await supabaseService
          .from('products')
          .update({ 
            quantity: newQuantity,
            status: newQuantity <= 0 ? 'sold' : 'active'
          })
          .eq('id', order.product_id);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      order,
      paymentStatus: session.payment_status 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});