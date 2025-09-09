
/**
 * chatApi.ts
 * API de utilidades para gestionar conversaciones (1.3 y 1.4).
 * Asegúrate de tener las columnas en `conversations`:
 *  - title_override_buyer/seller (text)
 *  - archived_for_buyer/seller (boolean)
 *  - deleted_for_buyer/seller (boolean)
 *  - muted_until_buyer/seller (timestamptz)
 *  - unread_for_buyer/seller (int)
 */

import { supabase } from "@/integrations/supabase/client";

export type Conversation = {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string | null;
  updated_at?: string | null;
  title_override_buyer?: string | null;
  title_override_seller?: string | null;
  archived_for_buyer?: boolean | null;
  archived_for_seller?: boolean | null;
  deleted_for_buyer?: boolean | null;
  deleted_for_seller?: boolean | null;
  muted_until_buyer?: string | null;
  muted_until_seller?: string | null;
  unread_for_buyer?: number | null;
  unread_for_seller?: number | null;
};

export function getRole(conv: Conversation, userId: string) {
  if (conv.buyer_id === userId) return "buyer" as const;
  if (conv.seller_id === userId) return "seller" as const;
  throw new Error("El usuario no pertenece a esta conversación");
}

export function getUnreadForUser(conv: Conversation, userId: string): number {
  const role = getRole(conv, userId);
  return role === "buyer" ? (conv.unread_for_buyer ?? 0) : (conv.unread_for_seller ?? 0);
}

export async function renameConversation(convId: string, userId: string, newTitle: string) {
  const { data: conv, error: e1 } = await supabase
    .from("conversations")
    .select("id,buyer_id,seller_id")
    .eq("id", convId)
    .single();
  if (e1 || !conv) throw e1 ?? new Error("Conversación no encontrada");

  const role = getRole(conv as Conversation, userId);
  const col = role === "buyer" ? "title_override_buyer" : "title_override_seller";
  const { error } = await supabase.from("conversations").update({ [col]: newTitle }).eq("id", convId);
  if (error) throw error;
}

export async function setArchived(convId: string, userId: string, archived: boolean) {
  const { data: conv, error: e1 } = await supabase
    .from("conversations")
    .select("id,buyer_id,seller_id")
    .eq("id", convId)
    .single();
  if (e1 || !conv) throw e1 ?? new Error("Conversación no encontrada");

  const role = getRole(conv as Conversation, userId);
  const col = role === "buyer" ? "archived_for_buyer" : "archived_for_seller";
  const { error } = await supabase.from("conversations").update({ [col]: archived }).eq("id", convId);
  if (error) throw error;
}

export async function softDelete(convId: string, userId: string) {
  const { data: conv, error: e1 } = await supabase
    .from("conversations")
    .select("id,buyer_id,seller_id")
    .eq("id", convId)
    .single();
  if (e1 || !conv) throw e1 ?? new Error("Conversación no encontrada");

  const role = getRole(conv as Conversation, userId);
  const col = role === "buyer" ? "deleted_for_buyer" : "deleted_for_seller";
  const { error } = await supabase.from("conversations").update({ [col]: true }).eq("id", convId);
  if (error) throw error;
}

export async function mute(convId: string, userId: string, untilISO: string) {
  const { data: conv, error: e1 } = await supabase
    .from("conversations")
    .select("id,buyer_id,seller_id")
    .eq("id", convId)
    .single();
  if (e1 || !conv) throw e1 ?? new Error("Conversación no encontrada");

  const role = getRole(conv as Conversation, userId);
  const col = role === "buyer" ? "muted_until_buyer" : "muted_until_seller";
  const { error } = await supabase.from("conversations").update({ [col]: untilISO }).eq("id", convId);
  if (error) throw error;
}

export async function unmute(convId: string, userId: string) {
  const { data: conv, error: e1 } = await supabase
    .from("conversations")
    .select("id,buyer_id,seller_id")
    .eq("id", convId)
    .single();
  if (e1 || !conv) throw e1 ?? new Error("Conversación no encontrada");

  const role = getRole(conv as Conversation, userId);
  const col = role === "buyer" ? "muted_until_buyer" : "muted_until_seller";
  const { error } = await supabase.from("conversations").update({ [col]: null }).eq("id", convId);
  if (error) throw error;
}

export async function markAsRead(convId: string, userId: string) {
  const { data: conv, error: e1 } = await supabase
    .from("conversations")
    .select("id,buyer_id,seller_id")
    .eq("id", convId)
    .single();
  if (e1 || !conv) throw e1 ?? new Error("Conversación no encontrada");

  const role = getRole(conv as Conversation, userId);
  const col = role === "buyer" ? "unread_for_buyer" : "unread_for_seller";
  const { error } = await supabase.from("conversations").update({ [col]: 0 }).eq("id", convId);
  if (error) throw error;
}

/**
 * Devuelve el total de no leídos por pestaña para el usuario.
 *  - productTotal: sum de chats con product_id NOT NULL
 *  - generalTotal: sum de chats con product_id IS NULL
 * Solo cuenta conversaciones NO eliminadas para ese usuario.
 */
export async function getUnreadTotals(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  if (error) throw error;

  let productTotal = 0;
  let generalTotal = 0;
  for (const c of (data as Conversation[])) {
    const role = getRole(c as Conversation, userId);
    const deleted = role === "buyer" ? c.deleted_for_buyer : c.deleted_for_seller;
    if (deleted) continue;
    const unread = role === "buyer" ? (c.unread_for_buyer ?? 0) : (c.unread_for_seller ?? 0);
    if (c.product_id) productTotal += unread;
    else generalTotal += unread;
  }
  return { productTotal, generalTotal };
}
