// src/lib/chat/realtime.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MessageDTO, OfferDTO } from "./supabaseChat";

type Handlers = {
  onMessageInsert?: (row: MessageDTO) => void;
  onOfferInsert?: (row: OfferDTO) => void;
  onOfferUpdate?: (row: OfferDTO) => void;
};

export function subscribeToConversation(
  supabase: SupabaseClient,
  conversationId: string,
  handlers: Handlers
) {
  console.log("[Realtime] 🔍 Suscribiendo a conversación:", conversationId);
  
  // PRIMERO: Verificar que realtime esté habilitado
  console.log("[Realtime] 🔍 Verificando tablas...");
  
  const channel = supabase.channel(`conv:${conversationId}`, {
    config: {
      broadcast: { self: true },
      presence: { key: conversationId },
    },
  });

  // SUSCRIBIRSE A TODOS LOS EVENTOS PRIMERO para debugging
  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
    },
    (payload) => {
      console.log("[Realtime] 🔍 EVENTO GENERAL:", payload);
    }
  );

  // Luego suscribirse específicamente
  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      console.log("[Realtime] 📩 MENSAJE INSERT ESPECÍFICO:", payload);
      if (payload.new) {
        handlers.onMessageInsert?.(payload.new as MessageDTO);
      }
    }
  ).on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "offers",
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      console.log("[Realtime] 💰 OFERTA INSERT ESPECÍFICO:", payload);
      if (payload.new) {
        handlers.onOfferInsert?.(payload.new as OfferDTO);
      }
    }
  ).on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "offers",
      filter: `conversation_id=eq.${conversationId}`,
    },
    (payload) => {
      console.log("[Realtime] 🔄 OFERTA UPDATE ESPECÍFICO:", payload);
      if (payload.new) {
        handlers.onOfferUpdate?.(payload.new as OfferDTO);
      }
    }
  );

  channel.subscribe((status) => {
    console.log("[Realtime] 📊 Estado del canal:", status, "para:", conversationId);
  });

  return () => {
    console.log("[Realtime] 🚫 Desuscribiendo de:", conversationId);
    try {
      supabase.removeChannel(channel);
    } catch (e) {
      console.error("[Realtime] Error al eliminar canal:", e);
    }
  };
}