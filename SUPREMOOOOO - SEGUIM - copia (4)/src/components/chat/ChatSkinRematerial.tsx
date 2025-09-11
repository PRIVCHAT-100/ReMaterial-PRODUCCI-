
import * as React from "react";
import { useEffect, useRef } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import ConfirmDeleteChat from "@/components/chat/ConfirmDeleteChat";
import { ImageCarousel } from "@/components/ImageCarousel";

export type Role = "buyer" | "seller";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type ChatUser = { id: string; name?: string | null; avatarUrl?: string | null; role: Role; };
export type ProductProfile = { id?: string; name: string; price: number; unit?: string; imageUrl?: string | null; location?: string | null; inventory?: number | null; badges?: string[]; };
export type ConversationListItem = { id: string; title: string; subtitle?: string; unread?: number; pinned?: boolean; archived?: boolean; product?: ProductProfile | null; };
export type Message = { id: string; authorId: string; authorRole: Role; content: string; createdAt: string; };
export type Offer = { id: string; madeBy: Role; price: number; note?: string | null; status: OfferStatus; createdAt: string; reserved?: boolean | null; finalAgreed?: boolean | null; };

export type ChatSkinProps = {
  currentUser: ChatUser;
  conversations: ConversationListItem[];
  activeConversationId: string | null;
  partner?: ChatUser | null;
  product?: ProductProfile | null;
  messages: Message[];
  offers: Offer[];
  loadingConversations?: boolean;
  loadingChat?: boolean;
  errorText?: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (content: string) => void;
  onMakeOffer: (price: number, note?: string) => void;
  onAcceptOffer: (offerId: string) => void;
  onRejectOffer: (offerId: string) => void;
  onToggleReserve: (offerId: string, value: boolean) => void;
  onBuyNow: (offerId: string) => void;
  className?: string;
  tabs?: Array<"Productos" | "General" | "Archivados">;
  activeTab?: "Productos" | "General" | "Archivados";
  onChangeTab?: (t: "Productos" | "General" | "Archivados") => void;
};

export default function ChatSkinRematerial(props: ChatSkinProps) {
  const { currentUser, conversations, activeConversationId, partner, product, messages, offers, loadingConversations, loadingChat, errorText, onSelectConversation, onSendMessage, onMakeOffer, onAcceptOffer, onRejectOffer, onToggleReserve, onBuyNow, tabs = ["Productos","General","Archivados"], activeTab = "Productos", onChangeTab } = props;
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages.length, offers.length, activeConversationId]);
  const finalAccepted = offers.find((o) => o.status === "accepted");

  function sendNow() {
    const text = inputRef.current?.value?.trim();
    if (text) { onSendMessage(text); if (inputRef.current) inputRef.current.value = ""; }
  }

  return (
    <div className="w-full grid grid-cols-12 gap-4">
      <aside className="col-span-12 md:col-span-4 lg:col-span-3">
        <div className="h-full rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200">
            <div className="text-base font-semibold">Mensajes</div>
            <div className="mt-2 flex gap-2 text-sm">
              {tabs.map((t) => (
                <button key={t} className={`px-3 py-1 rounded-full border text-sm ${t===activeTab?'bg-[#2F6BFF] text-white border-[#2F6BFF]':'bg-white text-slate-700 border-slate-200'}`} onClick={() => onChangeTab?.(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div className="p-2 space-y-2 overflow-auto max-h-[70vh]">
            {loadingConversations ? <div className="text-slate-500 text-sm p-3">Cargando conversaciones…</div> :
              conversations.length===0 ? <div className="text-slate-500 text-sm p-3">No hay conversaciones.</div> :
              conversations.map((c) => {
                const active = c.id === activeConversationId;
                const inv = typeof c.product?.inventory === 'number' ? (c.product?.inventory ?? 0) : null;
                const invClass = inv===null ? '' : inv<=0 ? 'border-rose-400 text-rose-600' : inv<5 ? 'border-amber-400 text-amber-600' : 'border-slate-300 text-slate-600';
                return (
                  <button key={c.id} onClick={() => onSelectConversation(c.id)} className={`w-full text-left p-3 rounded-xl border transition ${active ? 'bg-indigo-50 border-indigo-200':'bg-white border-slate-200 hover:bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900">{c.title}</div>
                      {c.unread ? <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-[11px] font-medium bg-[#2F6BFF] text-white">{c.unread}</span> : null}
                    </div>
                    {c.subtitle && <div className="text-slate-500 text-sm mt-0.5">{c.subtitle}</div>}
                    {c.product && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full border border-slate-300 text-xs text-slate-700">{c.product.name}</span>
                        {inv !== null && <span className={`px-2 py-0.5 rounded-full border text-xs ${invClass}`}>Stock: {inv}</span>}
                      </div>
                    )}
                  </button>
                );
              })
            }
          </div>
        </div>
      </aside>

      <main className="col-span-12 md:col-span-8 lg:col-span-6">
        <div className="h-full rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 grid place-items-center font-bold text-slate-600">{partner?.name?.[0]?.toUpperCase() || "?"}</div>
              <div>
                <div className="font-semibold text-slate-900">{partner?.name || "Conversación"}</div>
                <div className="text-slate-500 text-xs">{partner?.role === "seller" ? "Vendedor" : partner?.role === "buyer" ? "Comprador" : ""}</div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto max-h-[54vh] bg-slate-50 border-y border-slate-200 p-3">
            {offers.map((o) => (
              <OfferItem key={o.id} offer={o} isBuyer={currentUser.role==='buyer'} isSeller={currentUser.role==='seller'} onAccept={() => onAcceptOffer(o.id)} onReject={() => onRejectOffer(o.id)} onToggleReserve={(v)=>onToggleReserve(o.id, v)} onBuyNow={() => onBuyNow(o.id)} />
            ))}
            <ul className="flex flex-col gap-2 py-2">
              {messages.map((m) => {
                const mine = m.authorId === currentUser.id && m.authorRole === currentUser.role && m.id !== "system";
                const isSystem = m.authorId === "system";
                return (
                  <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`${isSystem ? "max-w-[80%] bg-emerald-50 border-emerald-200" : mine ? "max-w-[80%] bg-indigo-50 border-indigo-200" : "max-w-[80%] bg-white border-slate-200"} border rounded-2xl px-3 py-2`}>
                      <div className={`whitespace-pre-wrap ${isSystem ? "text-emerald-800" : "text-slate-900"}`}>{m.text}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-slate-200 grid grid-cols-12 gap-2 items-start">
            <div className="col-span-12 lg:col-span-8 flex items-end gap-2">
              <textarea ref={inputRef} rows={2} placeholder="Escribe un mensaje… (Ctrl/Cmd + Enter para enviar)" className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200" onKeyDown={(e)=>{ if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){ sendNow(); } }} />
              <button className="px-4 py-2 rounded-xl bg-[#2F6BFF] text-white border border-[#2F6BFF]" onClick={sendNow}>Enviar</button>
            </div>
            {currentUser.role === "buyer" && product ? (
              <div className="col-span-12 lg:col-span-4 flex items-end gap-2">
                <input id="quick-offer-price" type="number" step="0.01" min={0} defaultValue={Math.max(0, Math.round(product.price * 0.9 * 100) / 100)} className="w-32 rounded-xl border border-slate-300 px-3 py-2" placeholder="Oferta (€)" />
                <input id="quick-offer-note" className="flex-1 rounded-xl border border-slate-300 px-3 py-2" placeholder="Nota (opcional)" />
                <button className="px-3 py-2 rounded-xl border border-slate-300 bg-white" onClick={()=>{ const price = Number((document.getElementById('quick-offer-price') as HTMLInputElement)?.value || 0); const note = (document.getElementById('quick-offer-note') as HTMLInputElement)?.value || undefined; if(price>0) onMakeOffer(price, note); }}>Ofertar</button>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <aside className="col-span-12 lg:col-span-3">
        <div className="h-full rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-3 border-b border-slate-200"><div className="font-semibold">Perfil del producto</div></div>
          {product ? (
            <div className="p-3 space-y-3">
              <div className="w-full aspect-[4/3] rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center text-slate-500 font-semibold">IMG</div>
              <div className="text-slate-900 font-semibold">{product.name}</div>
              <div className="font-extrabold">€ {product.price.toLocaleString()} {product.unit ? `/${product.unit}` : ""}</div>
              {product.location && <div className="text-slate-500 text-sm">{product.location}</div>}
              <div className="flex flex-wrap gap-2">
                {typeof product.inventory === "number" && (
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${(product.inventory ?? 0) <= 0 ? "border-rose-400 text-rose-600" : (product.inventory ?? 0) < 5 ? "border-amber-400 text-amber-600" : "border-slate-300 text-slate-600"}`}>Stock: {product.inventory}</span>
                )}
                {(product.badges || []).map((b, i) => (<span key={i} className="px-2 py-0.5 rounded-full border border-slate-300 text-xs text-slate-700">{b}</span>))}
              </div>
              {finalAccepted && (
                <button className={`w-full px-3 py-2 rounded-xl border text-sm font-medium ${ currentUser.role === "buyer" ? "bg-[#2F6BFF] text-white border-[#2F6BFF]" : "bg-white text-slate-700 border-slate-200" }`} onClick={()=> currentUser.role === "buyer" && onBuyNow(finalAccepted.id)} disabled={currentUser.role !== "buyer"}>
                  {currentUser.role === "buyer" ? `Comprar por € ${finalAccepted.price.toLocaleString()}` : `Aceptada a € ${finalAccepted.price.toLocaleString()}`}
                </button>
              )}
            </div>

) : <div className="p-3 text-slate-500 text-sm">Sin producto vinculado a este chat.</div>}

        </div>
      </aside>
    </div>
  );
}

function OfferItem({ offer, isBuyer, isSeller, onAccept, onReject, onToggleReserve, onBuyNow }:{ offer: Offer; isBuyer: boolean; isSeller: boolean; onAccept: ()=>void; onReject: ()=>void; onToggleReserve: (v:boolean)=>void; onBuyNow: ()=>void; }) {
  const roleText = offer.madeBy === "buyer" ? "Oferta" : "Contraoferta";
  const statusClass = offer.status === "accepted" ? "text-emerald-600" : offer.status === "rejected" ? "text-rose-600" : offer.status === "pending" ? "text-amber-600" : "text-slate-500";
  return (
    <div className={`grid grid-cols-12 gap-3 items-center p-3 my-2 rounded-xl border border-dashed ${ offer.madeBy === "buyer" ? "bg-sky-50 border-sky-200" : "bg-amber-50 border-amber-200" }`}>
      <div className="col-span-12 md:col-span-3"><div className="font-semibold">{roleText}</div><div className={`text-xs uppercase tracking-wide ${statusClass}`}>{offer.status}</div></div>
      <div className="col-span-12 md:col-span-6">
        <div className="text-lg font-bold">€ {offer.price.toLocaleString()}</div>
        {offer.note && <div className="mt-1 text-slate-600 text-sm whitespace-pre-wrap">{offer.note}</div>}
        <div className="text-[11px] text-slate-500 mt-1">{new Date(offer.createdAt).toLocaleString()}</div>
      </div>
      <div className="col-span-12 md:col-span-3 flex flex-wrap gap-2 justify-start md:justify-end">
        {offer.status === "pending" && isSeller && (<><button className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm" onClick={onAccept}>Aceptar</button><button className="px-3 py-1 rounded-lg border border-slate-300 bg-white text-sm" onClick={onReject}>Rechazar</button></>)}
        {offer.status === "accepted" && isSeller && (<button className={`px-3 py-1 rounded-lg text-sm border ${offer.reserved ? "border-slate-300 bg-white" : "bg-amber-500 text-white border-amber-500"}`} onClick={()=> onToggleReserve(!offer.reserved)}>{offer.reserved ? "Quitar reserva" : "Reservar"}</button>)}
        {offer.status === "accepted" && isBuyer && (<button className="px-3 py-1 rounded-lg bg-[#2F6BFF] text-white text-sm" onClick={onBuyNow}>Comprar por € {offer.price.toLocaleString()}</button>)}
      </div>
    </div>
  );
}