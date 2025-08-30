import * as React from "react";
import { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// --- Tipos públicos para integrar en tu app ---
export type Role = "buyer" | "seller";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type Message = {
  id: string;
  author: Role;
  text: string;
  createdAt: string; // ISO
};

export type Offer = {
  id: string;
  madeBy: Role;
  price: number;
  note?: string;
  status: OfferStatus;
  createdAt: string; // ISO
  reserved?: boolean; // opcional: si la oferta aceptada fue marcada como reservada por el vendedor
};

export type Product = {
  name: string;
  unit: string; // "kg", "t", etc
  pricePerUnit: number; // PVP inicial
  location: string;
  inventory: number; // cantidad disponible
  sellerName: string;
};

export type ChatCategory = "productos" | "general" | "archivados";

export type ConversationListItem = {
  id: string;
  title: string;
  lastMessage: string;
  unread?: number;
  updatedAt: string; // ISO
  category: ChatCategory;
  productName?: string;
  counterpart?: string;
};

// --- Props del componente (controlado) ---
export type NegotiationChatProps = {
  // Lista de conversaciones para la columna izquierda
  conversations: ConversationListItem[];
  activeTab: ChatCategory;
  onTabChange: (tab: ChatCategory) => void;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;

  // Paginación de conversaciones (scroll infinito)
  hasMoreConversations?: boolean;
  isLoadingConversations?: boolean;
  onLoadMoreConversations?: () => void;

  // Offset superior para encajar bajo tu Header
  headerOffsetPx?: number;

  // Datos de la conversación activa
  me: Role;
  messages: Message[];
  offers: Offer[];
  product?: Product | null;

  // Paginación del timeline de mensajes (scroll hacia arriba)
  hasMoreMessages?: boolean; // si hay más antiguos
  isLoadingMessages?: boolean;
  onLoadMoreMessages?: () => void; // llamado al llegar al inicio del scroll

  // Acciones
  onSendMessage: (text: string) => void;
  onMakeOffer: (price: number, note?: string) => void;
  onAcceptOffer: (offerId: string) => void;
  onRejectOffer: (offerId: string) => void;
  onWithdrawOffer: (offerId: string) => void;
  onBuy?: (acceptedOffer: Offer) => void; // comprador confirma compra
  onReserveAcceptedOffer?: (offerId: string) => void; // vendedor marca la oferta como reservada
  isAcceptedOfferReserved?: boolean; // estado de reserva para reflejar en UI
};

// --- Utils seguros (defensivos) ---
function currency(n: number) {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
  } catch {
    return `${n.toFixed(2)} €`;
  }
}

function ensureArray<T>(v: T[] | undefined | null): T[] {
  return Array.isArray(v) ? v : [];
}

// Intenta detectar si un mensaje es "Oferta: X — nota" y enlazarlo con una Offer real
function parseOfferInText(text: string): { price: number | null; note: string | null } {
  try {
    const m = text.match(/Oferta:\s*([0-9]+(?:[.,][0-9]+)?)\s*€?(?:\s*—\s*(.*))?/i);
    if (!m) return { price: null, note: null };
    const raw = m[1].replace(",", ".");
    const price = Number.parseFloat(raw);
    const note = (m[2] ?? "").trim() || null;
    if (!Number.isFinite(price)) return { price: null, note: null };
    return { price, note };
  } catch {
    return { price: null, note: null };
  }
}

function findRelatedOfferForMessage(
  msg: { text: string; author: Role; createdAt: string },
  offers: Offer[]
): Offer | null {
  const { price, note } = parseOfferInText(msg.text);
  if (price == null) return null;
  // buscador por precio + autor + proximidad temporal
  const tMsg = new Date(msg.createdAt).getTime();
  let best: { off: Offer; dt: number } | null = null;
  for (const o of offers) {
    if (o.madeBy !== msg.author) continue;
    if (Math.abs(o.price - price) > 0.005) continue; // ~0,01 EUR tolerancia
    const tOff = new Date(o.createdAt).getTime();
    const dt = Math.abs(tOff - tMsg);
    // si la nota existe, intentar coincidirla (cuando se guardó)
    if (note && o.note && o.note.trim() !== note) continue;
    if (!best || dt < best.dt) best = { off: o, dt };
  }
  // aceptar si está dentro de 5 minutos
  if (best && best.dt <= 5 * 60 * 1000) return best.off;
  return best ? best.off : null;
}


function ensureFn<T extends (...args: any[]) => any>(fn: T | undefined): T {
  return (fn ?? ((() => {}) as T)) as T;
}

export default function NegotiationChatLayout(props: NegotiationChatProps) {
  const {
    conversations,
    activeTab,
    onTabChange,
    selectedConversationId,
    onSelectConversation,
    hasMoreConversations,
    isLoadingConversations,
    onLoadMoreConversations,
    headerOffsetPx,
    me,
    messages,
    offers,
    product,
    hasMoreMessages,
    isLoadingMessages,
    onLoadMoreMessages,
    onSendMessage,
    onMakeOffer,
    onAcceptOffer,
    onRejectOffer,
    onWithdrawOffer,
    onBuy,
    onReserveAcceptedOffer,
    isAcceptedOfferReserved,
  } = props;

  // Normalizamos props para evitar crashes si llegan undefined en runtime
  const convsList = ensureArray(conversations);
  const messagesList = ensureArray(messages);
  const offersList = ensureArray(offers);
  const activeTabSafe: ChatCategory = (activeTab as any) ?? ("productos" as ChatCategory);
  const onTabChangeSafe = ensureFn(onTabChange);
  const onSelectConversationSafe = ensureFn(onSelectConversation);
  const onSendMessageSafe = ensureFn(onSendMessage);
  const onMakeOfferSafe = ensureFn(onMakeOffer);
  const onAcceptOfferSafe = ensureFn(onAcceptOffer);
  const onRejectOfferSafe = ensureFn(onRejectOffer);
  const onWithdrawOfferSafe = ensureFn(onWithdrawOffer);
  const onBuySafe = onBuy ? onBuy : undefined;
  const onReserveSafe = ensureFn(onReserveAcceptedOffer);

  const hasMoreConvs = Boolean(hasMoreConversations);
  const isLoadingConvs = Boolean(isLoadingConversations);
  const onLoadMoreConvs = ensureFn(onLoadMoreConversations);
  const topOffset = Number.isFinite(headerOffsetPx as any) ? (headerOffsetPx as number) : 0;

  const hasMoreMsgs = Boolean(hasMoreMessages);
  const isLoadingMsgs = Boolean(isLoadingMessages);
  const onLoadMoreMsgs = ensureFn(onLoadMoreMessages);

  // Estado local (inputs)
  const [messageText, setMessageText] = useState("");
  const [offerPrice, setOfferPrice] = useState<number | "">("");
  const [offerNote, setOfferNote] = useState("");

  // Refs de scroll
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null); // sentinel superior para cargar más
  const convEndRef = useRef<HTMLDivElement>(null); // sentinel inferior lista de chats

  // Derivados (¡primero acceptedOffer y luego cualquier derivado que dependa de él!)
  const acceptedOffer = useMemo(() => offersList.find((o) => o.status === "accepted") || null, [offersList]);
  const hasAccepted = !!acceptedOffer;
  const isReserved = useMemo(() => {
    // UI de reserva reflejada por prop externa o por el propio objeto oferta
    if (typeof isAcceptedOfferReserved !== "undefined") return Boolean(isAcceptedOfferReserved);
    return Boolean(acceptedOffer?.reserved);
  }, [isAcceptedOfferReserved, acceptedOffer]);

  // Mantener scroll anclado al último mensaje (enviados/recibidos)
  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messagesList.length]);

  // Tabs helper
  const tabBtn = (id: ChatCategory, label: string) => (
    <button
      key={id}
      onClick={() => onTabChangeSafe(id)}
      className={`px-3 py-2 text-sm border-b-2 -mb-px ${
        activeTabSafe === id
          ? "text-primary border-primary"
          : "text-muted-foreground border-transparent hover:text-foreground"
      }`}
      type="button"
    >
      {label}
    </button>
  );

  const filteredConvs = convsList
    .filter((c) => c.category === activeTabSafe)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  // Observer: scroll infinito en conversaciones (pie de lista)
  useEffect(() => {
    if (!convEndRef.current) return;
    if (!hasMoreConvs) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingConvs) {
          onLoadMoreConvs();
        }
      },
      { root: null, rootMargin: "96px", threshold: 0.1 }
    );
    io.observe(convEndRef.current);
    return () => io.disconnect();
  }, [hasMoreConvs, isLoadingConvs, onLoadMoreConvs]);

  // Observer: scroll infinito en mensajes (subida al inicio)
  useEffect(() => {
    const rootEl = messagesScrollRef.current;
    const target = messagesTopRef.current;
    if (!rootEl || !target) return;
    if (!hasMoreMsgs) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMsgs) {
          onLoadMoreMsgs();
        }
      },
      { root: rootEl, rootMargin: "64px", threshold: 0 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [hasMoreMsgs, isLoadingMsgs, onLoadMoreMsgs]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4" style={{ paddingTop: topOffset }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Columna 1: Lista de chats */}
        <div className="md:col-span-1">
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="text-base font-semibold">Chats</div>
              <div className="flex gap-2 mt-2">
                {tabBtn("productos", "Productos")}
                {tabBtn("general", "General")}
                {tabBtn("archivados", "Archivados")}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              <div className="h-[420px] overflow-y-auto">
                {filteredConvs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectConversationSafe(c.id)}
                    className={`w-full text-left px-4 py-3 border-b hover:bg-muted transition ${
                      (selectedConversationId ?? null) === c.id ? "bg-muted" : "bg-background"
                    }`}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate">{c.title}</div>
                      {c.unread ? (
                        <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 text-[11px] rounded-full bg-primary text-primary-foreground px-1">
                          {c.unread}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{c.lastMessage}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(c.updatedAt).toLocaleString("es-ES")}
                    </div>
                  </button>
                ))}

                {/* Footer de la lista */}
                {filteredConvs.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">No hay conversaciones en esta pestaña.</div>
                )}
                {hasMoreConvs ? (
                  <div ref={convEndRef} className="p-3 text-center text-xs text-muted-foreground">
                    {isLoadingConvs ? "Cargando más…" : "Desplázate para cargar más"}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-muted-foreground">Fin de la lista</div>
                )}
              </div>

              {/* Fallback manual */}
              {hasMoreConvs && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isLoadingConvs}
                    onClick={() => onLoadMoreConvs()}
                  >
                    {isLoadingConvs ? "Cargando…" : "Cargar más"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna 2-3: Chat */}
        <div className="md:col-span-2">
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={hasAccepted ? "default" : "secondary"}>
                    {hasAccepted ? "Contraoferta aceptada" : "Negociación activa"}
                  </Badge>
                  {hasAccepted && (
                    <span className="text-sm text-muted-foreground">
                      Precio final: <strong>{currency(acceptedOffer!.price)}</strong>
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent>
              <div
                ref={messagesScrollRef}
                className="h-[420px] overflow-y-auto space-y-3 p-2"
              >
                {/* Sentinel superior para cargar más mensajes */}
                <div ref={messagesTopRef} />

                {/* Aviso al inicio del historial */}
                {!hasMoreMsgs && (
                  <div className="text-center text-[11px] text-muted-foreground py-1">
                    Inicio del historial
                  </div>
                )}

                {messagesList.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] px-3 py-2 rounded-xl shadow ${
                      m.author === me ? "bg-primary text-primary-foreground ml-auto" : "bg-muted mr-auto"
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">
                      {m.author === "buyer" ? "Comprador" : "Vendedor"} · {new Date(m.createdAt).toLocaleString("es-ES")}
                    </div>
                    
<div className="whitespace-pre-wrap">{m.text}</div>
                    {/* Acciones inline sólo si este mensaje corresponde a una oferta pendiente */}
                    {(() => {
                      const rel = findRelatedOfferForMessage(m, offersList);
                      if (!rel) return null;
                      if (rel.status !== "pending") return null;
                      const isMine = rel.madeBy === me;
                      return (
                        <div className="flex gap-2 mt-2">
                          {!isMine ? (
                            <>
                              <Button size="sm" className="h-8" onClick={() => onAcceptOfferSafe(rel.id)}>
                                Aceptar
                              </Button>
                              <Button size="sm" variant="secondary" className="h-8" onClick={() => onRejectOfferSafe(rel.id)}>
                                Rechazar
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" className="h-8" onClick={() => onWithdrawOfferSafe(rel.id)}>
                              Retirar
                            </Button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>

              {/* Fallback manual por si el observer no dispara */}
              {hasMoreMsgs && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isLoadingMsgs}
                    onClick={() => onLoadMoreMsgs()}
                  >
                    {isLoadingMsgs ? "Cargando mensajes…" : "Cargar mensajes anteriores"}
                  </Button>
                </div>
              )}
            </CardContent>

            <Separator />

            <CardFooter className="flex flex-col gap-3">
              {acceptedOffer && (
                <div className="flex items-center justify-between border rounded-lg p-3 w-full">
                  <div>
                    Contraoferta aceptada: <strong>{currency(acceptedOffer.price)}</strong>
                    {isReserved && (
                      <Badge className="ml-2" variant="secondary">Reservado</Badge>
                    )}
                  </div>

                  {/* Acciones según rol */}
                  <div className="flex items-center gap-2">
                    {me === "seller" && (
                      <Button
                        onClick={() => !isReserved && onReserveSafe(acceptedOffer.id)}
                        disabled={isReserved}
                      >
                        {isReserved ? "Reservado" : "Marcar reservado"}
                      </Button>
                    )}

                    {me === "buyer" && (
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onBuySafe?.(acceptedOffer)}
                      >
                        Comprar por {currency(acceptedOffer.price)}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-xl border p-3 w-full">
                <div className="text-sm font-medium mb-2">Proponer oferta / contraoferta</div>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="Precio (EUR)"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                  <Input
                    placeholder="Nota (opcional)"
                    value={offerNote}
                    onChange={(e) => setOfferNote(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (offerPrice !== "" && !Number.isNaN(Number(offerPrice))) {
                        onMakeOfferSafe(Number(offerPrice), offerNote.trim() || undefined);
                        setOfferPrice("");
                        setOfferNote("");
                      }
                    }}
                  >
                    {me === "buyer" ? "Hacer oferta" : "Contraofertar"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full">
                <Textarea
                  placeholder="Escribe un mensaje…"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="min-h-[48px]"
                />
                <Button
                  onClick={() => {
                    const txt = messageText.trim();
                    if (txt) {
                      onSendMessageSafe(txt);
                      setMessageText("");
                    }
                  }}
                >
                  Enviar
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Columna 4: Resumen del producto */}
        <div className="md:col-span-1">
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader>
              <div className="text-base font-semibold">Resumen del producto</div>
            </CardHeader>
            <Separator />
            <CardContent className="space-y-3">
              {/* Imagen / media (deja tu img aquí) */}
              <div className="aspect-[4/3] w-full rounded-xl bg-muted grid place-items-center text-muted-foreground">
                Imagen del producto
              </div>
              <div>
                <div className="text-lg font-semibold leading-tight">{product?.name ?? "—"}</div>
                <div className="text-sm text-muted-foreground">
                  {product?.location ?? "—"} · Stock: <strong>{product?.inventory ?? 0} {product?.unit ?? "ud"}</strong>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Precio base</div>
                <div className="text-base font-semibold">
                  {product ? `${currency(product.pricePerUnit)} / ${product.unit}` : "—"}
                </div>
              </div>
              {acceptedOffer ? (
                <div className="flex items-center justify-between rounded-lg border p-2">
                  <div className="text-sm">Precio negociado</div>
                  <div className="font-semibold">{currency(acceptedOffer.price)} / {product?.unit ?? "ud"}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Aún no hay un precio final negociado.</div>
              )}
              <div className="text-sm text-muted-foreground">Vendedor: <span className="font-medium text-foreground">{product?.sellerName ?? "—"}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Test cases ligeros (opt-in) ---
// Activa window.__RUN_CHAT_TESTS__ = true para ejecutar estas aserciones en runtime (dev).
// No afectan a producción ni a la API del componente.
declare global {
  interface Window { __RUN_CHAT_TESTS__?: boolean }
}

export const _internalTestUtils = { ensureArray, ensureFn };

if (typeof window !== "undefined" && (window.__RUN_CHAT_TESTS__ === true)) {
  console.group("NegotiationChatLayout – lightweight tests");
  console.assert(ensureArray(undefined).length === 0, "ensureArray(undefined) debe devolver []");
  console.assert(ensureArray(null as any).length === 0, "ensureArray(null) debe devolver []");
  const f = ensureFn<void>(() => {});
  console.assert(typeof f === "function", "ensureFn debe devolver una función");
  const offersEmpty = ensureArray<Offer>(undefined);
  console.assert((offersEmpty.find as any) !== undefined, "offersEmpty debe exponer .find sin lanzar");
  console.groupEnd();
}
