// src/pages/Messages_NEW_SKIN.tsx
import * as React from "react";
import { useEffect, useState } from "react";
import NegotiationChatLayout, {
  type ConversationListItem,
  type Message as UIMsg,
  type Offer as UIOffer,
  type Product as UIProduct,
  type ChatCategory,
  type Role,
} from "@/components/chat/NegotiationChatLayout";
import {
  getCurrentUserId,
  loadConversations,
  enrichConversationsToUI,
  loadThreadForUI,
  loadProductProfile,
  sendMessage,
  makeOffer,
  acceptOffer,
  rejectOffer,
  withdrawOffer,
  type ConversationDTO,
  createOrderAndDecrementInventory,
  openOrCreateConversation,
  type MessageDTO,
  type OfferDTO,
  reserveOffer,
  type UIMsg as InternalUIMsg,
  type UIOffer as InternalUIOffer
} from "@/lib/chat/supabaseChat";

import Header from "@/components/Header";
import { subscribeToConversation } from "@/lib/chat/realtime";
import { supabase } from "@/lib/supabaseClient";

export default function Messages_NEW_SKIN() {
  const [activeTab, setActiveTab] = useState<ChatCategory>("general");
  const onTabChange = React.useCallback((tab: ChatCategory) => setActiveTab(tab), []);

  const [convs, setConvs] = useState<ConversationListItem[]>([]);

  const [byId, setById] = useState<Record<string, ConversationDTO>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMsg[]>([]);
  const [offers, setOffers] = useState<UIOffer[]>([]);
  const [product, setProduct] = useState<UIProduct | null>(null);
  const [meRole, setMeRole] = useState<Role>("buyer");
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const filteredConvs = convs.filter(c => !archivedIds.has(c.id));

  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [deeplinkHandled, setDeeplinkHandled] = useState(false);

  // Función para manejar la selección de conversación (MOVIDA AL PRINCIPIO)
  const onSelectConversation = React.useCallback(async (id: string) => {
    setSelectedId(id);
    await refreshThread(id);
  }, [byId]);

  // Función para abrir o crear y seleccionar una conversación
  async function openOrCreateAndSelect({ productId, sellerId }: { productId: string; sellerId?: string }) {
    try {
      const conv = await openOrCreateConversation({ productId, sellerId });
      if (conv?.id) {
        setSelectedId(conv.id);
        await refreshThread(conv.id);
        await refreshConversations();
      }
    } catch (error) {
      console.error("Error opening/creating conversation:", error);
      throw error;
    }
  }

  async function refreshConversations() {
    setLoadingConvs(true);
    try {
      const list = await loadConversations();
      console.log("Conversaciones cargadas:", list);
      
      const { list: uiList, byId: byIdMap } = await enrichConversationsToUI(list);
      console.log("Conversaciones enriquecidas para UI:", uiList);
      
      setConvs(uiList);
      setById(byIdMap);
      if (!selectedId && uiList.length > 0) {
        setSelectedId(uiList[0].id);
      }
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    } finally {
      setLoadingConvs(false);
    }
  }

  async function refreshThread(convId: string | null) {
    if (!convId) return;
    setLoadingMsgs(true);
    try {
      const meId = (await getCurrentUserId()) as string;
      const conv = byId[convId];
      if (!conv) {
        console.error("Conversation not found in byId map:", convId);
        return;
      }
      
      const { msgs, offers: threadOffers, meRole: role } = await loadThreadForUI(conv, meId);
      const prod = await loadProductProfile(conv.product_id ?? null);
      
      setMessages(msgs as UIMsg[]);
      setOffers(threadOffers as UIOffer[]);
      setProduct(prod as UIProduct | null);
      setMeRole(role);
    } catch (error) {
      console.error("Error refreshing thread:", error);
    } finally {
      setLoadingMsgs(false);
    }
  }

// ——— Acciones de conversación (local, sin romper nada) ———
async function handleArchiveConversation(id: string) {
  setArchivedIds(prev => new Set([...prev, id]));
  // Opcional: podríamos persistir en el futuro (tabla user_settings_conversations)
}

async function handleMuteConversation(id: string) {
  setMutedIds(prev => new Set([...prev, id]));
}

async function handleDeleteConversation(id: string) {
  try {
    // Intento de borrado real; si las policies no lo permiten, al menos limpiamos del UI
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      console.warn("[conversations] delete blocked by RLS, fallback to UI-only remove:", error.message);
    }
  } finally {
    setConvs(prev => prev.filter(c => c.id !== id));
    setById(prev => {
      const cp = { ...prev };
      delete cp[id];
      return cp;
    });
    if (selectedId === id) setSelectedId(null);
  }
}

  // Función específica para refrescar solo las ofertas (útil después de reservar)
  async function refreshOffers() {
    if (!selectedId) return;
    
    try {
      const meId = (await getCurrentUserId()) as string;
      const conv = byId[selectedId];
      if (!conv) return;
      
      const { offers: threadOffers } = await loadThreadForUI(conv, meId);
      setOffers(threadOffers as UIOffer[]);
    } catch (error) {
      console.error("Error refreshing offers:", error);
    }
  }

  useEffect(() => {
  if (deeplinkHandled) return;
  try {
    const sp = new URLSearchParams(window.location.search);
    const pid = sp.get("product") || sp.get("product_id");
    const sid = sp.get("seller") || sp.get("seller_id");
    const bid = sp.get("buyer") || sp.get("buyer_id");
    if (pid && (sid || bid)) {
      (async () => {
        try {
          await openOrCreateAndSelect({ productId: String(pid), sellerId: sid || undefined });
        } catch (e) {
          console.error("deeplink open/create error", e);
        } finally {
          setDeeplinkHandled(true);
        }
      })();
    } else if (sid && !pid) {
      (async () => {
        try {
          const conv = await openOrCreateConversation({ sellerId: sid, productId: null });
          if (conv?.id) {
            setSelectedId(conv.id);
            try { await refreshThread(conv.id); } catch {}
          }
          try { await refreshConversations(); } catch {}
        } catch (e) {
          console.error("deeplink open/create (seller-only) error", e);
        } finally {
          setDeeplinkHandled(true);
        }
      })();
    } else {
      setDeeplinkHandled(true);
    }
  } catch (e) {
    setDeeplinkHandled(true);
  }
}, [deeplinkHandled]);

  // Encontrar oferta aceptada para saber si está reservada
  const acceptedOffer = offers.find(o => o.status === "accepted");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
      </div>
      {/* ESPACIO REDUCIDO: Cambiado de pt-16 a pt-2 */}
      <div className="flex-1 pt-2">
        <NegotiationChatLayout
          conversations={filteredConvs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onArchiveConversation={handleArchiveConversation}
          onMuteConversation={handleMuteConversation}
          onDeleteConversation={handleDeleteConversation}
          selectedConversationId={selectedId}
          onSelectConversation={onSelectConversation}
          hasMoreConversations={false}
          isLoadingConversations={loadingConvs}
          onLoadMoreConversations={() => {}}
          headerOffsetPx={0}
          me={meRole}
          messages={messages}
          offers={offers}
          product={product ?? undefined}
          hasMoreMessages={false}
          isLoadingMessages={loadingMsgs}
          onLoadMoreMessages={() => {}}
          onSendMessage={async (text) => {
            if (!selectedId) return;
            await sendMessage(selectedId, text);
            await refreshThread(selectedId);
          }}
          onMakeOffer={async (price, quantity) => {
            if (!selectedId) return;
            const conv = byId[selectedId];
            if (!conv) return;
            await makeOffer(conv, price, quantity);
            await refreshThread(selectedId);
          }}
          onAcceptOffer={async (offerId) => {
            await acceptOffer(offerId);
            if (selectedId) await refreshThread(selectedId);
          }}
          onRejectOffer={async (offerId) => {
            await rejectOffer(offerId);
            if (selectedId) await refreshThread(selectedId);
          }}
          onWithdrawOffer={async (offerId) => {
            await withdrawOffer(offerId);
            if (selectedId) await refreshThread(selectedId);
          }}
          onBuy={async (acceptedOffer) => {
            try {
              await createOrderAndDecrementInventory(selectedId!, acceptedOffer.price, acceptedOffer.reserved_quantity || 1, acceptedOffer.id);
              if (selectedId) await refreshThread(selectedId);
            } catch (e) { console.error('buy error', e); }
          }}
          onReserveAcceptedOffer={async (offerId, quantity, price) => {
            await reserveOffer(offerId, quantity, price);
            if (selectedId) await refreshThread(selectedId);
          }}
          isAcceptedOfferReserved={acceptedOffer?.reserved}
        />
      </div>
    </div>
  );
}