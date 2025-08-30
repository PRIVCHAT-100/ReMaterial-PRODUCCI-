
// src/lib/chat/supabaseChat.ts — FULL LOGIC (0829-final)
// Mantiene la estética intacta: SOLO lógica y tipos que consume Messages_NEW_SKIN.tsx y NegotiationChatLayout.
// Firma de funciones alineada con tu Messages_NEW_SKIN.tsx actual.

import { supabase } from "@/integrations/supabase/client";

// === Auth helpers (canonical, single source of truth) ===
export async function currentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function requireAuth(): Promise<string> {
  let me = await currentUserId();
  if (me) return me;

  try { await supabase.auth.refreshSession(); } catch {}
  me = await currentUserId();
  if (me) return me;

  await new Promise<void>((resolve) => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user?.id) {
        try { sub.subscription.unsubscribe(); } catch {}
        resolve();
      }
    });
    setTimeout(() => {
      try { sub.subscription.unsubscribe(); } catch {}
      resolve();
    }, 1200);
  });

  me = await currentUserId();
  if (!me) throw new Error("No auth");
  return me;
}

// === Auth helpers (canonical, single source of truth) ===

// --- Auth helpers (canonical) ---

// --- Auth helpers ---

// --- Auth helpers (robust) ---

// ---- Tipos DTO para la capa de datos ----
export type UUID = string;
export type Role = "buyer" | "seller";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type ConversationDTO = {
  id: UUID;
  buyer_id: UUID;
  seller_id: UUID;
  product_id: UUID | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MessageDTO = {
  id: UUID;
  conversation_id: UUID;
  created_at: string;
  author_id?: UUID | null;
  sender_id?: UUID | null;
  offer_id?: UUID | null;
  // body
  content?: string | null;
  text?: string | null;
};

export type OfferDTO = {
  id: UUID;
  conversation_id: UUID;
  buyer_id: UUID;
  seller_id: UUID;
  status: OfferStatus;
  created_at: string;
  // body
  offered_price?: number | null; // esquema A
  price?: number | null;         // esquema B
  message?: string | null;       // esquema A
  note?: string | null;          // esquema B
  reserved?: boolean | null;     // si existe en tu tabla
};

export type ProductDTO = {
  id: UUID;
  seller_id?: UUID | null;
  name?: string | null;
  unit?: string | null;
  price?: number | null;
  price_per_unit?: number | null;
  location?: string | null;
  inventory?: number | null;
  stock?: number | null;
  image_url?: string | null;
};

// ---- Helpers internos ----
function bodyFromMessage(m: MessageDTO): string {
  return (m.content ?? m.text ?? "").toString();
}
function priceFromOffer(o: OfferDTO): number {
  const v = (o.offered_price ?? o.price ?? 0);
  return typeof v === "number" ? v : Number(v || 0);
}
function noteFromOffer(o: OfferDTO): string | undefined {
  return (o.message ?? o.note ?? undefined) ?? undefined;
}

// ---- API que consume tu página ----
export async function getCurrentUserId(): Promise<string> {
  return await currentUserId();
}

// 1) Cargar conversaciones del usuario actual
export async function loadConversations(): Promise<ConversationDTO[]> {
  const me = await requireAuth();
    if (!me) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, product_id, created_at, updated_at")
    .or(`buyer_id.eq.${me},seller_id.eq.${me}`)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Abre o crea una conversación según seller/product. Devuelve la conversación. */
export async function openOrCreateConversation(opts: { sellerId: string; productId?: string | null }): Promise<ConversationDTO> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  const seller = opts.sellerId;
  const product = opts.productId ?? null;

  // Buscar existente
  let q = supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, product_id, created_at, updated_at")
    .eq("buyer_id", me)
    .eq("seller_id", seller);

  if (product === null) q = q.is("product_id", null);
  else q = q.eq("product_id", product);

  const { data: found, error: efind } = await q.maybeSingle();
  if (!efind && found) return found as ConversationDTO;

  // Crear nueva
  const { data: created, error: eins } = await supabase
    .from("conversations")
    .insert({ buyer_id: me, seller_id: seller, product_id: product })
    .select("id, buyer_id, seller_id, product_id, created_at, updated_at")
    .maybeSingle();

  if (!eins && created) return created as ConversationDTO;

  // Si hay conflicto (índice único), volvemos a buscar
  const { data: retry } = await q.maybeSingle();
  if (retry) return retry as ConversationDTO;

  throw (eins || efind || new Error("No se pudo abrir o crear la conversación"));
}

// 2) Enriquecer a lista UI + diccionario por id
export async function enrichConversationsToUI(list: ConversationDTO[]): Promise<{
  list: Array<{
    id: string;
    title: string;
    lastMessage: string;
    unread?: number;
    updatedAt: string;
    category: "productos" | "general" | "archivados";
    productName?: string;
    counterpart?: string;
  }>;
  byId: Record<string, ConversationDTO>;
}> {
  const byId: Record<string, ConversationDTO> = {};
  for (const c of list) byId[c.id] = c;

  // Obtener último mensaje de cada conv (1 query por conv para robustez y evitar columnas desconocidas)
  const out = [];
  for (const c of list) {
    let lastText = "";
    let updatedAt = c.updated_at ?? c.created_at ?? new Date().toISOString();

    try {
      const { data: rows } = await supabase
        .from("messages")
        .select("id, created_at, content, text, author_id, sender_id, offer_id")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (rows && rows[0]) {
        lastText = bodyFromMessage(rows[0] as any);
        updatedAt = rows[0].created_at ?? updatedAt;
      }
    } catch {}

    // Título y counterpart simples (podemos enriquecer con profiles si lo deseas)
    const title = c.product_id ? "Chat de producto" : "Chat";
    const category = c.product_id ? "productos" as const : "general" as const;

    out.push({
      id: c.id,
      title,
      lastMessage: lastText || "—",
      unread: 0,
      updatedAt,
      category,
    });
  }

  return { list: out, byId };
}

// 3) Cargar hilo (mensajes + ofertas) y calcular mi rol
export async function loadThread(conv: ConversationDTO, meId: string): Promise<{
  msgs: Array<{ id: string; author: Role; text: string; createdAt: string }>;
  offers: Array<{ id: string; madeBy: Role; price: number; note?: string; status: OfferStatus; createdAt: string; reserved?: boolean }>;
  meRole: Role;
}> {
  const meRole: Role = meId === conv.seller_id ? "seller" : "buyer";

  const { data: mRows, error: em } = await supabase
    .from("messages")
    .select("id, created_at, content, text, author_id, sender_id, offer_id")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });
  if (em) throw em;

  const msgs = (mRows ?? []).map((m: any) => ({
    id: m.id,
    author: (m.author_id ?? m.sender_id) === conv.seller_id ? "seller" : "buyer",
    text: bodyFromMessage(m),
    createdAt: m.created_at,
  }));

  const { data: oRows, error: eo } = await supabase
    .from("offers")
    .select("*")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });
  if (eo) throw eo;

  const offers = (oRows ?? []).map((o: any) => ({
    id: o.id,
    madeBy: (o.buyer_id === conv.buyer_id) ? "buyer" : "seller",
    price: priceFromOffer(o),
    note: noteFromOffer(o),
    status: (o.status ?? "pending") as OfferStatus,
    createdAt: o.created_at,
    reserved: o.reserved ?? undefined,
  }));

  return { msgs, offers, meRole };
}

// 4) Perfil de producto (para el panel lateral) → shape que espera tu UI
export async function loadProductProfile(productId: string | null): Promise<{
  name: string;
  unit: string;
  pricePerUnit: number;
  location: string;
  inventory: number;
  sellerName: string;
} | null> {
  if (!productId) return null;

  const { data: p, error } = await supabase
    .from("products")
    .select("id, seller_id, name, unit, price, location, inventory, stock")
    .eq("id", productId)
    .maybeSingle();
  if (error) throw error;
  if (!p) return null;

  let sellerName = "";
  try {
    if (p.seller_id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("company_name, full_name")
        .eq("id", p.seller_id)
        .maybeSingle();
      sellerName = (prof?.company_name ?? prof?.full_name ?? "") as string;
    }
  } catch {}

  return {
    name: p.name ?? "Producto",
    unit: p.unit ?? "",
    pricePerUnit: Number(p.price_per_unit ?? p.price ?? 0),
    location: p.location ?? "",
    inventory: Number((p.inventory ?? p.stock ?? 0) as any),
    sellerName: sellerName || "Vendedor",
  };
}

// 5) Enviar mensaje (usa auth.uid como autor). Soporta content|text.
export async function sendMessage(conversationId: string, text: string): Promise<void> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  // intento A: content
  const a = await supabase.from("messages").insert({ conversation_id: conversationId, author_id: me, content: text });
  if (!a.error) return;

  // si es 42703, reintentamos con text
  if ((a.error as any)?.code === "42703") {
    const b = await supabase.from("messages").insert({ conversation_id: conversationId, author_id: me, text });
    if (b.error) throw b.error;
    return;
  }
  throw a.error;
}

// 6) Crear oferta (usa buyer/seller de la conversación). Soporta offered_price|price y message|note.
export async function makeOffer(conv: ConversationDTO, price: number, note?: string): Promise<void> {
  const value = Number(price);
  if (!Number.isFinite(value)) throw new Error("Precio inválido");

  // intento A: offered_price + message
  const a = await supabase.from("offers").insert({
    conversation_id: conv.id,
    buyer_id: conv.buyer_id,
    seller_id: conv.seller_id,
    offered_price: value,
    message: note ?? null,
    status: "pending",
  });
  if (!a.error) return;

  if ((a.error as any)?.code === "42703") {
    const b = await supabase.from("offers").insert({
      conversation_id: conv.id,
      buyer_id: conv.buyer_id,
      seller_id: conv.seller_id,
      price: value,
      note: note ?? null,
      status: "pending",
    });
    if (b.error) throw b.error;
    return;
  }

  throw a.error;
}

// 7) Aceptar/Rechazar/Retirar oferta (manteniendo RLS)
export async function acceptOffer(offerId: string): Promise<void> {
  const { error } = await supabase.from("offers").update({ status: "accepted" }).eq("id", offerId);
  if (error) throw error;
}
export async function rejectOffer(offerId: string): Promise<void> {
  const { error } = await supabase.from("offers").update({ status: "rejected" }).eq("id", offerId);
  if (error) throw error;
}
export async function withdrawOffer(offerId: string): Promise<void> {
  const { error } = await supabase.from("offers").update({ status: "withdrawn" }).eq("id", offerId);
  if (error) throw error;
}

// 8) Crear pedido + decrementar inventario (RPC)
export async function createOrderAndDecrementInventory(conversationId: string, price: number, quantity = 1, offerId?: string) {
  const { data, error } = await supabase.rpc("create_order_and_decrement_inventory", {
    p_conversation_id: conversationId,
    p_price: price,
    p_quantity: quantity,
    p_offer_id: offerId ?? null,
  });
  if (error) throw error;
  return data;
}