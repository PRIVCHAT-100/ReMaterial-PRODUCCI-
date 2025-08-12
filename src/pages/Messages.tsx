import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, MessageSquare, Search, Package, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ConversationActions from "@/features/chat/ConversationActions";
import { markAsRead, getUnreadTotals, getUnreadForUser } from "@/features/chat/chatApi";

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"product" | "general" | "archived">("product");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadTotals, setUnreadTotals] = useState({ productTotal: 0, generalTotal: 0 });

  // Refs (únicos)
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const messageChannelRef = useRef<any>(null);
  const justOpenedRef = useRef(false);

  // 👉 Refs para mantener la posición de la PÁGINA (no el chat)
  const outerScrollPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const restoreOnConversationRef = useRef(false);
  const restoreOnTabRef = useRef(false);

  // === Helper: ordenar por última actividad (updated_at DESC) ===
  const sortByUpdated = (list: any[]) =>
    [...list].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  // Mantener la PÁGINA quieta mientras el chat auto-desplaza por envíos/entrantes
  const withWindowScrollFreeze = (fn: () => void) => {
    const x = window.scrollX;
    const y = window.scrollY;
    fn();
    requestAnimationFrame(() => {
      window.scrollTo(x, y);
      requestAnimationFrame(() => window.scrollTo(x, y));
    });
  };

  // --- Scroll handler del área de mensajes ---
  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = distance <= 80;
    if (el.scrollTop === 0) loadOlderMessages();
  };

  // --- Scroll al fondo (robusto, solo dentro del chat) ---
  const scrollToBottom = (smooth = true) => {
    const el = messagesContainerRef.current;
    const anchor = bottomAnchorRef.current;
    if (!el || !anchor) return;

    const doScrollToAnchor = () => {
      try {
        anchor.scrollIntoView({
          block: "end",
          inline: "nearest",
          behavior: smooth ? "smooth" : "auto",
        });
      } catch {
        el.scrollTop = el.scrollHeight;
      }
    };

    const nudgeToAbsoluteBottom = () => {
      const maxTop = el.scrollHeight - el.clientHeight;
      if (Math.abs(el.scrollTop - maxTop) > 2) {
        el.scrollTop = maxTop + 2;
      }
    };

    requestAnimationFrame(() => {
      doScrollToAnchor();
      requestAnimationFrame(nudgeToAbsoluteBottom);
    });
  };

  const loadOlderMessages = async () => {
    if (!selectedConversation) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation.id)
        .order("created_at", { ascending: false })
        .range(messages.length, messages.length + 19);
      if (error) throw error;
      if (data?.length) setMessages(prev => [...data.reverse(), ...prev]);
    } catch (err) {
      console.error("Error loading older messages:", err);
    }
  };

  // Carga conversaciones + deep link
  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const sellerId = searchParams.get("seller");
    const productId = searchParams.get("product");
    if (sellerId) startConversation(sellerId, productId);
    return () => {
      if (messageChannelRef.current) supabase.removeChannel(messageChannelRef.current);
    };
  }, [user, searchParams]);

  // Suscripción realtime a mensajes de la conversación seleccionada
  useEffect(() => {
    if (!selectedConversation) return;
    justOpenedRef.current = true;
    isAtBottomRef.current = true;
    fetchMessages(selectedConversation.id);

    messageChannelRef.current = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        async (payload) => {
          const newMsg = payload.new;
          setMessages(prev => [...prev, newMsg]);

          // 👇 mover el chat activo arriba (última actividad) sin tocar nada más
          setConversations(prev => {
            const idx = prev.findIndex(c => c.id === selectedConversation.id);
            if (idx === -1) return prev;
            const copy = [...prev];
            // si viene created_at del mensaje, úsalo como referencia; si no, Date.now()
            const bumpTime = new Date(newMsg?.created_at ?? Date.now()).toISOString();
            copy[idx] = { ...copy[idx], updated_at: bumpTime };
            return sortByUpdated(copy);
          });

          if (isAtBottomRef.current) {
            requestAnimationFrame(() => withWindowScrollFreeze(() => scrollToBottom(true)));
          }
          if (user?.id) {
            try {
              const totals = await getUnreadTotals(user.id);
              setUnreadTotals(totals);
            } catch {}
          }

          if (newMsg.sender_id !== user?.id) {
            const isBuyer = selectedConversation?.buyer_id === user?.id;
            const mutedUntil = isBuyer
              ? selectedConversation?.muted_until_buyer
              : selectedConversation?.muted_until_seller;
            const isMuted = mutedUntil ? new Date(mutedUntil) > new Date() : false;
            if (!isMuted) {
              toast({ title: "Nuevo mensaje", description: "Has recibido un nuevo mensaje" });
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (messageChannelRef.current) supabase.removeChannel(messageChannelRef.current);
    };
  }, [selectedConversation, user?.id, toast]);

  // ✅ Autoscroll del CHAT al abrir (no toca la página)
  useLayoutEffect(() => {
    if (justOpenedRef.current) {
      scrollToBottom(false);
      justOpenedRef.current = false;
    }
  }, [messages]);

  // ✅ Restaurar posición de la PÁGINA al cambiar de conversación
  useLayoutEffect(() => {
    if (!restoreOnConversationRef.current) return;
    const { x, y } = outerScrollPosRef.current;
    window.scrollTo(x, y);
    requestAnimationFrame(() => window.scrollTo(x, y));
    restoreOnConversationRef.current = false;
  }, [selectedConversation]);

  // ✅ Restaurar posición de la PÁGINA al cambiar de pestaña (Productos/Generales/Archivados)
  useLayoutEffect(() => {
    if (!restoreOnTabRef.current) return;
    const { x, y } = outerScrollPosRef.current;
    window.scrollTo(x, y);
    requestAnimationFrame(() => window.scrollTo(x, y));
    restoreOnTabRef.current = false;
  }, [activeTab]);

  // --- Data ---
  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`)
        .order("updated_at", { ascending: false });
    if (error) throw error;

      const withData = await Promise.all(
        (data || []).map(async (c: any) => {
          const { data: buyer } = await supabase.from("profiles").select("*").eq("id", c.buyer_id).single();
          const { data: seller } = await supabase.from("profiles").select("*").eq("id", c.seller_id).single();
          let product = null;
          if (c.product_id) {
            const { data: prod } = await supabase.from("products").select("*").eq("id", c.product_id).single();
            product = prod;
          }
          return { ...c, buyer, seller, product };
        })
      );

      // ⬅️ siempre guardamos ordenado por updated_at DESC
      setConversations(sortByUpdated(withData));
      if (user?.id) {
        try {
          const totals = await getUnreadTotals(user.id);
          setUnreadTotals(totals);
        } catch {}
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔔 Reordenar lista en tiempo real si una conversación se actualiza o se crea
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("conversations-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `or(buyer_id.eq.${user.id},seller_id.eq.${user.id})`,
        },
        (payload) => {
          const updated = payload.new as any;
          setConversations((prev: any[]) => {
            const idx = prev.findIndex((c) => c.id === updated.id);
            if (idx === -1) return prev;
            const merged = { ...prev[idx], ...updated };
            const next = [...prev];
            next[idx] = merged;
            return sortByUpdated(next);
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: `or(buyer_id.eq.${user.id},seller_id.eq.${user.id})`,
        },
        async (payload) => {
          const c = payload.new as any;
          // completar buyer/seller/product como en fetchConversations
          const { data: buyer } = await supabase.from("profiles").select("*").eq("id", c.buyer_id).single();
          const { data: seller } = await supabase.from("profiles").select("*").eq("id", c.seller_id).single();
          let product = null;
          if (c.product_id) {
            const { data: prod } = await supabase.from("products").select("*").eq("id", c.product_id).single();
            product = prod;
          }
          const convWithData = { ...c, buyer, seller, product };
          setConversations((prev: any[]) =>
            sortByUpdated([ ...prev.filter((x) => x.id !== c.id), convWithData ])
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const startConversation = async (sellerId: string, productId: string | null) => {
    try {
      let q = supabase.from("conversations").select("*").eq("buyer_id", user?.id).eq("seller_id", sellerId);
      q = productId ? q.eq("product_id", productId) : q.is("product_id", null);

      const { data: existing } = await q.maybeSingle();
      if (existing) {
        const { data: buyer } = await supabase.from("profiles").select("*").eq("id", existing.buyer_id).single();
        const { data: seller } = await supabase.from("profiles").select("*").eq("id", existing.seller_id).single();
        let product = null;
        if (existing.product_id) {
          const { data: prod } = await supabase.from("products").select("*").eq("id", existing.product_id).single();
          product = prod;
        }
        const convWithData = { ...existing, buyer, seller, product };
        setSelectedConversation(convWithData);
        setConversations((prev) => {
          const idx = prev.findIndex((c: any) => c.id === convWithData.id);
          if (idx === -1) return sortByUpdated([convWithData, ...prev]);
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...convWithData };
          return sortByUpdated(copy);
        });
        justOpenedRef.current = true;
        isAtBottomRef.current = true;
        fetchMessages(existing.id);
        return;
      }

      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({ buyer_id: user?.id, seller_id: sellerId, product_id: productId })
        .select("*")
        .single();
      if (error) throw error;

      const { data: buyer } = await supabase.from("profiles").select("*").eq("id", newConv.buyer_id).single();
      const { data: seller } = await supabase.from("profiles").select("*").eq("id", newConv.seller_id).single();
      let product = null;
      if (newConv.product_id) {
        const { data: prod } = await supabase.from("products").select("*").eq("id", newConv.product_id).single();
        product = prod;
      }

      const convWithData = { ...newConv, buyer, seller, product };
      setSelectedConversation(convWithData);
      setConversations(prev => sortByUpdated([convWithData, ...prev]));
      setMessages([]);
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const withSenders = await Promise.all(
        (data || []).map(async (m: any) => {
          const { data: sender } = await supabase.from("profiles").select("*").eq("id", m.sender_id).single();
          return { ...m, sender };
        })
      );

      setMessages(withSenders);
      requestAnimationFrame(() => scrollToBottom(true));
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user?.id,
          content: newMessage.trim(),
        })
        .select("*")
        .single();
      if (error) throw error;

      const { data: sender } = await supabase.from("profiles").select("*").eq("id", data.sender_id).single();
      const msg = { ...data, sender };

      setMessages(prev => [...prev, msg]);

      // 👉 subimos el chat actual arriba inmediatamente
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === selectedConversation.id);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = { ...copy[idx], updated_at: new Date().toISOString() };
        return sortByUpdated(copy);
      });

      // Mantener la PÁGINA quieta mientras el chat hace autoscroll
      requestAnimationFrame(() => withWindowScrollFreeze(() => scrollToBottom(false)));

      setNewMessage("");

      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", selectedConversation.id);
    } catch (err) {
      console.error("Error sending message:", err);
      toast({ title: "Error", description: "No se pudo enviar el mensaje", variant: "destructive" });
    }
  };

  // 🔒 Guardar/restaurar posición exacta de la página al cambiar de chat
  const selectConversation = async (c: any) => {
    outerScrollPosRef.current = { x: window.scrollX, y: window.scrollY };
    restoreOnConversationRef.current = true;

    setSelectedConversation(c);
    justOpenedRef.current = true;
    isAtBottomRef.current = true;
    fetchMessages(c.id);

    try {
      if (user?.id) {
        await markAsRead(c.id, user.id);
        const totals = await getUnreadTotals(user.id);
        setUnreadTotals(totals);
      }
    } catch {}
  };

  // 🔒 Guardar/restaurar posición exacta de la página al cambiar de pestaña
  const handleTabChange = (v: "product" | "general" | "archived") => {
    outerScrollPosRef.current = { x: window.scrollX, y: window.scrollY };
    restoreOnTabRef.current = true;
    setActiveTab(v);
  };

  // Filtro de conversaciones
  const filteredConversations = conversations.filter((c) => {
    const isBuyer = c.buyer_id === user?.id;

    const deletedForUser = isBuyer ? c.deleted_for_buyer : c.deleted_for_seller;
    if (deletedForUser) return false;

    const archivedForUser = isBuyer ? c.archived_for_buyer : c.archived_for_seller;
    if (activeTab === "archived") {
      if (!archivedForUser) return false;
    } else if (archivedForUser) {
      return false;
    }

    const isProductChat = !!c.product_id;
    const matchesTab = activeTab === "product" ? isProductChat : activeTab === "general" ? !isProductChat : true;
    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;

    const otherUser = isBuyer ? c.seller : c.buyer;
    const q = searchQuery.toLowerCase();
    return (
      otherUser?.company_name?.toLowerCase().includes(q) ||
      otherUser?.first_name?.toLowerCase().includes(q) ||
      otherUser?.last_name?.toLowerCase().includes(q) ||
      c.product?.title?.toLowerCase().includes(q)
    );
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
              <p className="text-muted-foreground">Debes iniciar sesión para ver tus mensajes.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* ⛔ Evita “scroll anchoring” del navegador en este bloque */}
      <div className="container mx-auto px-4 py-8" style={{ overflowAnchor: "none" as any }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mensajes</h1>
          <p className="text-muted-foreground">Gestiona tus conversaciones con compradores y vendedores</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]" style={{ overflowAnchor: "none" as any }}>
          {/* Lista de conversaciones */}
          <div className="lg:col-span-1 min-h-0">
            <Card className="h-full flex flex-col min-h-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversaciones
                </CardTitle>
                <Tabs value={activeTab} onValueChange={handleTabChange as any} className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="product" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Productos
                      {unreadTotals.productTotal > 0 && <Badge className="ml-1">{unreadTotals.productTotal}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="general" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Generales
                      {unreadTotals.generalTotal > 0 && <Badge className="ml-1">{unreadTotals.generalTotal}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="flex items-center gap-2">🗄️ Archivados</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={activeTab === "product" ? "Buscar por producto/empresa..." : "Buscar por empresa..."}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>

              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="space-y-1 h-full overflow-y-auto overflow-x-hidden overscroll-contain">
                  {filteredConversations.map((c: any) => {
                    const isCurrentUserBuyer = c.buyer_id === user.id;
                    const otherUser = isCurrentUserBuyer ? c.seller : c.buyer;

                    return (
                      <div
                        key={c.id}
                        onClick={() => selectConversation(c)}
                        className={`p-3 hover:bg-muted cursor-pointer border-b transition-colors ${
                          selectedConversation?.id === c.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {otherUser?.company_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {otherUser?.company_name ||
                                  `${otherUser?.first_name || ""} ${otherUser?.last_name || ""}`.trim() ||
                                  "Usuario"}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {isCurrentUserBuyer ? "Comprando" : "Vendiendo"}
                              </Badge>

                              {/* Silenciado */}
                              {(() => {
                                const isBuyer = c.buyer_id === user.id;
                                const mutedUntil = isBuyer ? c.muted_until_buyer : c.muted_until_seller;
                                const isMuted = mutedUntil ? new Date(mutedUntil) > new Date() : false;
                                return isMuted ? (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Silenciado
                                  </Badge>
                                ) : null;
                              })()}

                              {/* No leídos por conversación */}
                              {(() => {
                                const unread = getUnreadForUser(c, user.id);
                                return unread > 0 ? <Badge className="ml-2">{unread}</Badge> : null;
                              })()}

                              <ConversationActions
                                conversation={c}
                                userId={user.id}
                                onChange={() => {
                                  fetchConversations();
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{c.product?.title || "Consulta general"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(c.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {!loading && filteredConversations.length === 0 && (
                    <div className="p-8 text-center">
                      {activeTab === "product" ? (
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      ) : (
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      )}
                      <p className="text-muted-foreground">
                        {activeTab === "product" ? "No tienes chats de productos" : "No tienes chats generales"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área de mensajes */}
          <div className="lg:col-span-2 min-h-0">
            <Card className="h-full flex flex-col min-h-0">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {selectedConversation.buyer_id === user.id
                            ? selectedConversation.seller?.company_name?.charAt(0)
                            : selectedConversation.buyer?.company_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {selectedConversation.buyer_id === user.id
                            ? selectedConversation.seller?.company_name ||
                              `${selectedConversation.seller?.first_name || ""} ${selectedConversation.seller?.last_name || ""}`.trim() ||
                              "Usuario"
                            : selectedConversation.buyer?.company_name ||
                              `${selectedConversation.buyer?.first_name || ""} ${selectedConversation.buyer?.last_name || ""}`.trim() ||
                              "Usuario"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.product?.title ? `Sobre: ${selectedConversation.product.title}` : "Consulta general"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent
                    ref={messagesContainerRef}
                    onScroll={handleMessagesScroll}
                    className="flex-1 p-4 overflow-y-auto overscroll-contain"
                  >
                    <div className="space-y-4">
                      {messages.map((m: any) => {
                        const mine = m.sender_id === user.id;
                        return (
                          <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <p className="text-sm">{m.content}</p>
                              <p className="text-xs opacity-70 mt-1">{new Date(m.created_at).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        );
                      })}
                      {/* Ancla inferior con 1px de altura y margen de scroll para evitar cortes */}
                      <div ref={bottomAnchorRef} style={{ height: 1, scrollMarginBottom: 16 }} />
                    </div>
                  </CardContent>

                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button onClick={sendMessage} size="sm" type="button">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
                    <p className="text-muted-foreground">Elige una conversación de la lista para empezar a chatear</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Messages;

