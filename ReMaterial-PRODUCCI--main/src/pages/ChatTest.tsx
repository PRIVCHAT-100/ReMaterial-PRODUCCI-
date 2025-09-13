import * as React from "react";
import NegotiationChatLayout, { type ChatCategory, type ConversationListItem, type Message, type Offer, type Product } from "@/components/chat/NegotiationChatLayout";

export default function ChatTest() {
  const [activeTab, setActiveTab] = React.useState<ChatCategory>("productos");
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>("c1");

  const conversations: ConversationListItem[] = [
    { id: "c1", title: "Compra - PET triturado", lastMessage: "OK, te paso precio final.", updatedAt: new Date().toISOString(), category: "productos", unread: 0 },
    { id: "c2", title: "General - Transporte", lastMessage: "Podemos coordinar la recogida.", updatedAt: new Date(Date.now() - 3600_000).toISOString(), category: "general", unread: 2 },
    { id: "c3", title: "Archivado - Cartón", lastMessage: "Gracias por la operación.", updatedAt: new Date(Date.now() - 86400_000).toISOString(), category: "archivados", unread: 0 },
  ];

  const [messages, setMessages] = React.useState<Message[]>([
    { id: "m1", author: "buyer", content: "Hola, ¿sigue disponible?", createdAt: new Date(Date.now() - 7200_000).toISOString() },
    { id: "m2", author: "seller", content: "Sí, ¿qué cantidad te interesa?", createdAt: new Date(Date.now() - 7100_000).toISOString() },
  ]);

  const [offers, setOffers] = React.useState<Offer[]>([
    { id: "o1", madeBy: "buyer", price: 180, note: "por tonelada", status: "pending", createdAt: new Date(Date.now() - 7000_000).toISOString() },
  ]);

  const product: Product = { name: "PET triturado", unit: "t", pricePerUnit: 220, location: "Girona", inventory: 12, sellerName: "EcoPlast SL" };

  return (
    <div className="container mx-auto py-6">
      <NegotiationChatLayout
        conversations={conversations}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        headerOffsetPx={0}
        me="buyer"
        messages={messages}
        offers={offers}
        product={product}
        hasMoreMessages={false}
        isLoadingMessages={false}
        hasMoreConversations={false}
        isLoadingConversations={false}
        onLoadMoreMessages={() => {}}
        onLoadMoreConversations={() => {}}
        onSendMessage={(txt) => setMessages((prev) => prev.concat({ id: crypto.randomUUID(), author: "buyer", content: txt, createdAt: new Date().toISOString() }))}
        onMakeOffer={(price, note) => setOffers(prev => prev.concat({ id: crypto.randomUUID(), madeBy: "buyer", price, note, status: "pending", createdAt: new Date().toISOString() }))}
        onAcceptOffer={(id) => setOffers(prev => prev.map(o => o.id === id ? { ...o, status: "accepted" } : o))}
        onRejectOffer={(id) => setOffers(prev => prev.map(o => o.id === id ? { ...o, status: "rejected" } : o))}
        onWithdrawOffer={(id) => setOffers(prev => prev.map(o => o.id === id ? { ...o, status: "withdrawn" } : o))}
        onBuy={() => {}}
        onReserveAcceptedOffer={() => {}}
      />
    </div>
  );
}
