import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Minimal helper to create an order and decrement product quantity.
 * NOTE: This runs two statements; for strict atomicity use a Postgres RPC.
 */
export async function createOrderAndDecrementInventory(
  supabase: SupabaseClient,
  params: {
    product_id: string;
    buyer_id: string;
    seller_id: string;
    quantity: number;
    final_price: number; // total price agreed
    currency?: string;
    conversation_id?: string;
  }
) {
  const { product_id, buyer_id, seller_id, quantity, final_price, currency = "EUR", conversation_id } = params;

  // 1) Check current quantity
  const { data: prod, error: prodErr } = await supabase
    .from("products")
    .select("id, quantity")
    .eq("id", product_id)
    .single();

  if (prodErr) throw prodErr;
  const available = (prod?.quantity ?? 0);
  if (available < quantity) {
    throw new Error("Insufficient inventory");
  }

  // 2) Create order
  const { data: order, error: ordErr } = await supabase
    .from("orders")
    .insert({
      product_id,
      buyer_id,
      seller_id,
      quantity,
      total_price: final_price,
      currency,
      conversation_id
    })
    .select("id")
    .single();

  if (ordErr) throw ordErr;

  // 3) Decrement inventory
  const { error: updErr } = await supabase
    .from("products")
    .update({ quantity: available - quantity })
    .eq("id", product_id);

  if (updErr) throw updErr;

  return order;
}
