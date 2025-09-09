import * as React from "react";
import NegotiationChatLayout, { type ChatCategory, type ConversationListItem, type Message as MsgUI, type Offer as OfferUI, type Product as ProductUI, type Role } from "@/components/chat/NegotiationChatLayout";
import { listConversations, listMessages, listOffers, sendMessage, createOfferWithProduct, acceptOffer, rejectOffer, withdrawOffer, reserveAcceptedOffer, getCurrentUserId } from "@/lib/chat/supabaseChat";

export default function Messages_Orders() {
  const [meRole] = React.useState<Role>("buyer");
  const [userId, setUserId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<ChatCategory>("productos");
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);

  const [conversations, setConversations] = React.useState<ConversationListItem[]>([]);
  const [messages, setMessages] = React.useState<MsgUI[]>([]);
  const [offers, setOffers] = React.useState<OfferUI[]>([]);
  const [product, setProduct] = React.useState<ProductUI | null>(null);

  React.useEffect(() => { (async () => { try { const uid = await getCurrentUserId(); setUserId(uid); } catch(e) { console.error(e); } })(); }, []);

  return (
    <div className="container mx-auto py-6">
      <NegotiationChatLayout
        conversations={conversations}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        me={meRole}
        messages={messages}
        offers={offers}
        product={product}
        hasMoreMessages={false}
        isLoadingMessages={false}
        hasMoreConversations={false}
        isLoadingConversations={false}
        onLoadMoreMessages={() => {}}
        onLoadMoreConversations={() => {}}
        onSendMessage={(t)=>{}}
        onMakeOffer={(p,n)=>{}}
        onAcceptOffer={()=>{}}
        onRejectOffer={()=>{}}
        onWithdrawOffer={()=>{}}
        onReserveAcceptedOffer={()=>{}}
      />
    </div>
  );
}