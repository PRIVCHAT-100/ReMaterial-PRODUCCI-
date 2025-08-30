// src/pages/Messages_NEW_SKIN.tsx
// Contenedor que conecta Supabase con tu UI PREVIEW sin tocar la estética.

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import NegotiationChatLayout, {
  type ConversationListItem,
  type Message as UIMsg,
  type Offer as UIOffer,
  type Product as UIProduct,
  type ChatCategory,
  type Role,
} from "@/components/chat/NegotiationChatLayout";
import { getCurrentUserId, loadConversations, enrichConversationsToUI, loadThread, loadProductProfile, sendMessage, makeOffer, acceptOffer, rejectOffer, withdrawOffer, type ConversationDTO, createOrderAndDecrementInventory, openOrCreateConversation } from "@/lib/chat/supabaseChat";

import Header from "@/components/Header";

export default function Messages_NEW_SKIN() {
  const [activeTab, setActiveTab] = useState<ChatCategory>("productos");
  const [convs, setConvs] = useState<ConversationListItem[]>([]);
  const [byId, setById] = useState<Record<string, ConversationDTO>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMsg[]>([]);
  const [offers, setOffers] = useState<UIOffer[]>([]);
  const [product, setProduct] = useState<UIProduct | null>(null);
  const [meRole, setMeRole] = useState<Role>("buyer");

  // Loading flags (minimos; tu UI ya soporta props para loading si necesitas pasarlos)
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  async function refreshConversations() {
    setLoadingConvs(true);
    try {
      const list = await loadConversations();
      const { list: uiList, byId } = await enrichConversationsToUI(list);
      // categorizar por pestaña (productos/general) la hace el propio UI con 'category', aquí simplemente guardamos todo
      setConvs(uiList);
      setById(byId);
      if (!selectedId && uiList.length > 0) {
        setSelectedId(uiList[0].id);
      }
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
      const { msgs, offers, meRole } = await loadThread(conv, meId);
      const prod = await loadProductProfile(conv.product_id ?? null);
      setMessages(msgs);
      setOffers(offers);
      setProduct(prod);
      setMeRole(meRole);
    } finally {
      setLoadingMsgs(false);
    }
  }

  useEffect(() => {
    refreshConversations();
  }, [activeTab]);

  useEffect(() => {
    if (selectedId) refreshThread(selectedId);
  }, [selectedId, byId[selectedId ?? ""]]);

  const onTabChange = (tab: ChatCategory) => setActiveTab(tab);
  const onSelectConversation = (id: string) => setSelectedId(id);

  // Helper: ensure new conversation becomes selected and thread loads even if list is capped
  async function openOrCreateAndSelect(params: { productId: string; sellerId?: string; buyerId?: string; }) {
    const conv = await openOrCreateConversation({ productId: params.productId, sellerId: params.sellerId, buyerId: params.buyerId });
    try {
      await refreshConversations();
    } catch (e) {
      console.warn("refreshConversations failed, will still select the conv", e);
    }
    if (conv?.id) {
      setSelectedId(conv.id);
      try { await refreshThread(conv.id); } catch {}
    }
    return conv;
  }

  // Deep link: open/create conversation from URL (?product or ?product_id; optional seller_id/buyer_id)
  const [deeplinkHandled, setDeeplinkHandled] = useState(false);
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
            await openOrCreateAndSelect({ productId: String(pid), sellerId: sid || undefined, buyerId: bid || undefined });
          } catch (e) { console.error("deeplink open/create error", e); }
          finally { setDeeplinkHandled(true); }
        })();
      } else {
        setDeeplinkHandled(true);
      }
    } catch {
      setDeeplinkHandled(true);
    }
  }, [deeplinkHandled]);





  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
      </div>
      <div className="flex-1">
        <NegotiationChatLayout
    conversations={convs}
    activeTab={activeTab}
    onTabChange={onTabChange}
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
    onMakeOffer={async (price, note) => {
      if (!selectedId) return;
      const conv = byId[selectedId];
      await makeOffer(conv, price, note);
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
        await createOrderAndDecrementInventory(selectedId!, acceptedOffer.price, 1, acceptedOffer.id);
        // Opcional: refrescar conversación/hilo si quieres ver inventario actualizado en UI
        if (selectedId) await refreshThread(selectedId);
      } catch (e) { console.error('buy error', e); }
    }}
    onReserveAcceptedOffer={undefined}
    isAcceptedOfferReserved={undefined}
  />
      </div>
    </div>
  );
}
