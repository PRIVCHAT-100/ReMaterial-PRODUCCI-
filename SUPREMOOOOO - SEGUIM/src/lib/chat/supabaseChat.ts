// src/lib/chat/supabaseChat.ts — FULL LOGIC (0829-final)
// Mantiene la estética intacta: SOLO lógica y tipos que consume Messages_NEW_Skin.tsx y NegotiationChatLayout.
// Firma de funciones alineada con tu Messages_NEW_Skin.tsx actual.

import { supabase } from "@/integrations/supabase/client";
import { type ChatCategory } from "@/components/chat/NegotiationChatLayout";

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
  reserved_quantity?: number | null;
  reserved_price?: number | null;
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

export type ProductProfileDTO = {
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
  seller_name?: string | null;
  seller_avatar?: string | null;
  images?: string[] | null;
  images?: string[] | null;
};

export type ThreadData = {
  conversation: ConversationDTO;
  messages: MessageDTO[];
  offers: OfferDTO[];
  product: ProductDTO | null;
  buyerInfo: { id: string; name: string; email: string } | null;
  sellerInfo: { id: string; name: string; email: string } | null;
};

// ---- Helpers internos ----
export function bodyFromMessage(m: MessageDTO): string {
  return (m?.content ?? m?.text ?? "").toString();
}

export function priceFromOffer(o: OfferDTO): number {
  const v = (o?.offered_price ?? o?.price ?? 0);
  return typeof v === "number" ? v : Number(v || 0);
}

export function noteFromOffer(o: OfferDTO): string | undefined {
  return (o?.message ?? o?.note ?? undefined) ?? undefined;
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

  const { data: existing, error: e1 } = await q.maybeSingle();
  if (e1) throw e1;
  if (existing) return existing;

  // Crear nueva
  const { data: newConv, error: e2 } = await supabase
    .from("conversations")
    .insert({
      buyer_id: me,
      seller_id: seller,
      product_id: product,
    })
    .select("id, buyer_id, seller_id, product_id, created_at, updated_at")
    .single();

  if (e2) throw e2;
  return newConv;
}

// 2) Cargar mensajes de una conversación
export async function loadMessages(conversationId: string): Promise<MessageDTO[]> {
  const me = await requireAuth();

    if (!me) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, created_at, author_id, sender_id, offer_id, content, text")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// 3) Cargar ofertas de una conversación
export async function loadOffers(conversationId: string): Promise<OfferDTO[]> {
  const me = await requireAuth();

    if (!me) return [];

  const { data, error } = await supabase
    .from("offers")
    .select("id, conversation_id, buyer_id, seller_id, status, created_at, offered_price, price, message, note, reserved, reserved_quantity, reserved_price")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// 4) Cargar producto (si aplica)
export async function loadProduct(productId: string | null): Promise<ProductDTO | null> {
  if (!productId) return null;
  
  // Validar que el productId tenga formato UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    console.warn("Invalid product ID format:", productId);
    return null;
  }
  
  const me = await requireAuth();
  if (!me) return null;

  const { data, error } = await supabase
    .from("products")
    .select("id, seller_id, name, unit, price, location, inventory, stock, image_url")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error("Error loading product:", error);
    return null;
  }
  return data;
}

// 4b) Cargar perfil de producto con información del vendedor
export async function loadProductProfile(productId: string | null): Promise<ProductProfileDTO | null> {
  if (!productId) return null;
  
  // Validar que el productId tenga formato UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(productId)) {
    console.warn("Invalid product ID format:", productId);
    return null;
  }
  
  const me = await requireAuth();
  if (!me) return null;

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      seller_id,
      name,
      unit,
      price,
      location,
      inventory,
      stock,
      image_url,
      profiles:seller_id(full_name, avatar_url)
    `)
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error("Error loading product profile:", error);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    seller_id: data.seller_id,
    name: data.name,
    unit: data.unit,
    price: data.price,
    price_per_unit: null, // Columna no existe en la base de datos
    location: data.location,
    inventory: data.inventory,
    stock: data.stock,
    image_url: data.image_url,
    seller_name: data.profiles?.full_name || null,
    seller_avatar: data.profiles?.avatar_url || null
  };
}

// 5) Cargar thread completo (conversación + mensajes + ofertas + información de usuarios) - FUNCIÓN ORIGINAL
export async function loadThread(conversationId: string): Promise<ThreadData> {
  const me = await requireAuth();
  if (!me) throw new Error("No auth");

  // Cargar conversación
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, product_id, created_at, updated_at")
    .eq("id", conversationId)
    .single();

  if (convError) throw convError;
  if (!conversation) throw new Error("Conversation not found");

  // Verificar que el usuario actual es parte de la conversación
  if (conversation.buyer_id !== me && conversation.seller_id !== me) {
    throw new Error("Not authorized to access this conversation");
  }

  // Cargar mensajes, ofertas y producto en paralelo
  const [messages, offers, product, buyerInfo, sellerInfo] = await Promise.all([
    loadMessages(conversationId),
    loadOffers(conversationId),
    loadProduct(conversation.product_id),
    getUserInfo(conversation.buyer_id),
    getUserInfo(conversation.seller_id)
  ]);

  return {
    conversation,
    messages: messages || [],
    offers: offers || [],
    product,
    buyerInfo,
    sellerInfo
  };
}

// 5b) Cargar thread para UI (conversación + mensajes + ofertas) - NUEVA FUNCIÓN
export async function loadThreadForUI(conversation: ConversationDTO, meId: string): Promise<{ msgs: UIMsg[], offers: UIOffer[], meRole: Role }> {
  if (!conversation) throw new Error("Conversation not found");

  // Verificar que el usuario actual es parte de la conversación
  if (conversation.buyer_id !== meId && conversation.seller_id !== meId) {
    throw new Error("Not authorized to access this conversation");
  }

  // Cargar mensajes y ofertas en paralelo
  const [messages, offers] = await Promise.all([
    loadMessages(conversation.id),
    loadOffers(conversation.id)
  ]);

  // Determinar el rol del usuario actual
  const meRole: Role = conversation.buyer_id === meId ? "buyer" : "seller";

  // Convertir mensajes a formato UI
  const uiMessages: UIMsg[] = messages.map(msg => ({
    id: msg.id,
    author: msg.author_id === conversation.seller_id ? "seller" : "buyer",
    text: bodyFromMessage(msg),
    createdAt: msg.created_at
  }));

  // Convertir ofertas a formato UI
  const uiOffers: UIOffer[] = offers.map(offer => ({
    id: offer.id,
    madeBy: offer.buyer_id === conversation.buyer_id ? "buyer" : "seller",
    price: priceFromOffer(offer),
    note: noteFromOffer(offer) || "",
    status: offer.status,
    createdAt: offer.created_at,
    reserved: offer.reserved || undefined,
    reserved_quantity: offer.reserved_quantity || undefined,
    reserved_price: offer.reserved_price || undefined
  }));

  return {
    msgs: uiMessages,
    offers: uiOffers,
    meRole
  };
}

// 6) Enviar mensaje
export async function sendMessage(conversationId: string, text: string): Promise<MessageDTO> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: me,
      author_id: me,
      content: text,
      text: text,
    })
    .select("id, conversation_id, created_at, author_id, sender_id, offer_id, content, text")
    .single();

  if (error) throw error;

  // Actualizar updated_at de la conversación
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return data;
}

// 7) Hacer oferta
export async function makeOffer(conversation: ConversationDTO, price: number, quantity: number = 1, note?: string): Promise<OfferDTO> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  // Verificar que el usuario es parte de la conversación
  if (conversation.buyer_id !== me && conversation.seller_id !== me) {
    throw new Error("Not in conversation");
  }

  // Determinar si es comprador o vendedor
  const isBuyer = conversation.buyer_id === me;

  // Crear la oferta
  const { data: offer, error: e1 } = await supabase
    .from("offers")
    .insert({
      conversation_id: conversation.id,
      buyer_id: conversation.buyer_id,
      seller_id: conversation.seller_id,
      status: "pending",
      price: price,
      offered_price: price,
      note: note,
      message: note,
    })
    .select("id, conversation_id, buyer_id, seller_id, status, created_at, offered_price, price, message, note, reserved, reserved_quantity, reserved_price")
    .single();

  if (e1) throw e1;

  // Crear mensaje automático que representa la oferta
  const offerText = isBuyer 
    ? `Oferta: ${price.toFixed(2)}€ — ${quantity} unidades`
    : `Contraoferta: ${price.toFixed(2)}€ — ${quantity} unidades`;

  await supabase
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      sender_id: me,
      author_id: me,
      offer_id: offer.id,
      content: offerText,
      text: offerText,
    });

  // Actualizar updated_at de la conversación
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversation.id);

  return offer;
}

// 8) Aceptar oferta
export async function acceptOffer(offerId: string): Promise<void> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  // Verificar que la oferta existe y el usuario es parte de ella
  const { data: offer } = await supabase
    .from("offers")
    .select("id, conversation_id, buyer_id, seller_id, status")
    .eq("id", offerId)
    .single();

  if (!offer) throw new Error("Offer not found");
  if (offer.buyer_id !== me && offer.seller_id !== me) throw new Error("Not authorized");

  // Actualizar estado de la oferta
  const { error } = await supabase
    .from("offers")
    .update({ status: "accepted" })
    .eq("id", offerId);

  if (error) throw error;

  // Rechazar automáticamente todas las demás ofertas pendientes en esta conversación
  await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("conversation_id", offer.conversation_id)
    .eq("status", "pending");

  // Actualizar updated_at de la conversación
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", offer.conversation_id);
}

// 9) Rechazar oferta
export async function rejectOffer(offerId: string): Promise<void> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  // Verificar que la oferta existe y el usuario es parte de ella
  const { data: offer } = await supabase
    .from("offers")
    .select("id, conversation_id, buyer_id, seller_id")
    .eq("id", offerId)
    .single();

  if (!offer) throw new Error("Offer not found");
  if (offer.buyer_id !== me && offer.seller_id !== me) throw new Error("Not authorized");

  const { error } = await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("id", offerId);

  if (error) throw error;

  // Actualizar updated_at de la conversación
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", offer.conversation_id);
}

// 10) Retirar oferta
export async function withdrawOffer(offerId: string): Promise<void> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  // Verificar que la oferta existe y el usuario es el que la hizo
  const { data: offer } = await supabase
    .from("offers")
    .select("id, conversation_id, buyer_id, seller_id, status")
    .eq("id", offerId)
    .single();

  if (!offer) throw new Error("Offer not found");
  if (offer.buyer_id !== me && offer.seller_id !== me) throw new Error("Not authorized");

  const { error } = await supabase
    .from("offers")
    .update({ status: "withdrawn" })
    .eq("id", offerId);

  if (error) throw error;

  // Actualizar updated_at de la conversación
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", offer.conversation_id);
}

// 11) Marcar oferta como reservada (para vendedor) - alias de reserveAcceptedOffer
export async function reserveOffer(offerId: string, quantity: number, price?: number): Promise<void> {
  return reserveAcceptedOffer(offerId, quantity, price);
}

// 12) Marcar oferta como reservada (para vendedor)
export async function reserveAcceptedOffer(offerId: string, quantity: number, price?: number): Promise<void> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  // Verificar que la oferta existe, está aceptada y el usuario es el vendedor
  const { data: offer } = await supabase
    .from("offers")
    .select("id, conversation_id, seller_id, status")
    .eq("id", offerId)
    .single();

  if (!offer) throw new Error("Offer not found");
  if (offer.seller_id !== me) throw new Error("Not authorized");
  if (offer.status !== "accepted") throw new Error("Offer not accepted");

  const { error } = await supabase
    .from("offers")
    .update({
      reserved: true,
      reserved_quantity: quantity,
      reserved_price: price
    })
    .eq("id", offerId);

  if (error) throw error;

  // Actualizar updated_at de la conversación
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", offer.conversation_id);
}

// 13) Comprar (para comprador) - confirmar compra de oferta aceptada
export async function buyAcceptedOffer(offerId: string): Promise<void> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  // Verificar que la oferta existe, está aceptada y el usuario es el comprador
  const { data: offer } = await supabase
    .from("offers")
    .select("id, conversation_id, buyer_id, status")
    .eq("id", offerId)
    .single();

  if (!offer) throw new Error("Offer not found");
  if (offer.buyer_id !== me) throw new Error("Not authorized");
  if (offer.status !== "accepted") throw new Error("Offer not accepted");

  // Aquí iría la lógica de procesamiento de pago
  // Por ahora solo marcamos como completada o similar si es necesario

  // Actualizar updated_at de la conversación
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", offer.conversation_id);
}

// 14) Crear pedido + decrementar inventario (RPC)
export async function createOrderAndDecrementInventory(
  conversationId: string, 
  price: number, 
  quantity = 1, 
  offerId?: string
): Promise<any> {
  const me = await requireAuth();

    if (!me) throw new Error("No auth");

  const { data, error } = await supabase.rpc("create_order_and_decrement_inventory", {
    p_conversation_id: conversationId,
    p_price: price,
    p_quantity: quantity,
    p_offer_id: offerId ?? null,
  });

  if (error) throw error;
  return data;
}

// 15) Obtener información del usuario
export async function getUserInfo(userId: string): Promise<{ id: string; name: string; email: string } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error loading user info:", error);
    return null;
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.full_name || "Usuario",
    email: data.email || "",
  };
}

// 16) Obtener conversaciones con información extendida
export async function getConversationsWithDetails(): Promise<any[]> {
  const me = await requireAuth();

    if (!me) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id,
      buyer_id,
      seller_id,
      product_id,
      created_at,
      updated_at,
      buyer:profiles!buyer_id(full_name),
      seller:profiles!seller_id(full_name),
      product:products(name),
      messages!conversation_id(id, content, created_at)
    `)
    .or(`buyer_id.eq.${me},seller_id.eq.${me}`)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error loading conversations with details:", error);
    return [];
  }
  return data || [];
}

// 17) Función para enriquecer conversaciones para la UI - CORREGIDA para coincidir con NegotiationChatLayout
export async function enrichConversationsToUI(conversations: ConversationDTO[]): Promise<{ list: ConversationListItem[], byId: Record<string, ConversationDTO> }> {
  const me = await currentUserId();
  if (!me) return { list: [], byId: {} };

  const byId: Record<string, ConversationDTO> = {};
  const list = await Promise.all(
    conversations.map(async (conv) => {
      try {
        byId[conv.id] = conv;
        
        // Obtener información del otro usuario
        const otherUserId = conv.buyer_id === me ? conv.seller_id : conv.buyer_id;
        const otherUserInfo = await getUserInfo(otherUserId);
        
        // Obtener información del producto si existe
        let productInfo = null;
        if (conv.product_id) {
          productInfo = await loadProduct(conv.product_id);
        }
        
        // Obtener el último mensaje
        const messages = await loadMessages(conv.id);
        const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
        
        // Formato CORRECTO para ConversationListItem que espera NegotiationChatLayout
        const conversationListItem: ConversationListItem = {
          id: conv.id,
          title: otherUserInfo?.name || "Usuario", // Nombre del otro usuario como título
          lastMessage: lastMessage ? bodyFromMessage(lastMessage) : "Sin mensajes",
          unread: 0, // Sin mensajes no leídos
          updatedAt: conv.updated_at || conv.created_at || new Date().toISOString(),
          category: (conv.product_id ? "productos" : "general"), // Categoría por defecto
          productName: productInfo?.name || undefined, // Nombre del producto si existe
          counterpart: otherUserInfo?.name || "Usuario" // Nombre del otro usuario
        };
        
        return conversationListItem;
      } catch (error) {
        console.error("Error enriching conversation:", error);
        byId[conv.id] = conv;
        
        // Devolver un item básico en caso de error
        const fallbackItem: ConversationListItem = {
          id: conv.id,
          title: "Usuario",
          lastMessage: "Error al cargar conversación",
          unread: 0,
          updatedAt: conv.updated_at || conv.created_at || new Date().toISOString(),
          category: (conv.product_id ? "productos" : "general"),
          counterpart: "Usuario"
        };
        
        return fallbackItem;
      }
    })
  );

  return { list: list.filter(conv => conv !== null), byId };
}

// Tipos para UI
export type UIMsg = {
  id: string;
  author: "buyer" | "seller";
  text: string;
  createdAt: string;
};

export type UIOffer = {
  id: string;
  madeBy: "buyer" | "seller";
  price: number;
  note: string;
  status: OfferStatus;
  createdAt: string;
  reserved?: boolean;
  reserved_quantity?: number;
  reserved_price?: number;
};

export type ConversationListItem = {
  id: string;
  title: string;
  lastMessage: string;
  unread?: number;
  updatedAt: string;
  category: ChatCategory;
  productName?: string;
  counterpart?: string;
};