import { supabase } from "@/lib/supabase/client";
import type { Role } from "@/components/chat/NegotiationChatLayout";

export async function createOfferWithProduct(conversationId: string, madeBy: Role, price: number, note?: string) {
  // opcional: intentar resolver product_id en el cliente para evitar depender del trigger
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("product_id")
    .eq("id", conversationId)
    .single();

  if (convErr) throw convErr;

  const payload: any = {
    conversation_id: conversationId,
    made_by: madeBy,
    price,
    note: note ?? null,
  };

  if (conv?.product_id) {
    payload.product_id = conv.product_id;
  }

  const { data, error } = await supabase
    .from("offers")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}