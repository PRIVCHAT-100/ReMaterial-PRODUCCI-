import { useState, useEffect } from "react";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import DistanceBadge from "@/components/DistanceBadge";
import { getBrowserLocation } from "@/utils/geolocate";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar, 
  Package, 
  Truck,
  MessageSquare, 
  Heart, 
  Share2, 
  Star,
  Phone,
  ArrowLeft,
  ShoppingCart,
  Pencil
} from "lucide-react";
import { PaymentDialog } from "@/components/payment/PaymentDialog";
import { useToast } from "@/hooks/use-toast";
import CounterOfferDialog from "@/components/CounterOfferDialog";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailIndex, setDetailIndex] = useState(0);
  const [counterOpen, setCounterOpen] = useState(false);

  const [me, setMe] = useState<{ latitude:number; longitude:number }|null>(null);
  useEffect(() => { getBrowserLocation().then(setMe); }, []);

  // 🆕 Estado para información de reserva unificado
  const [reservedInfo, setReservedInfo] = useState<{
    reserved: boolean;
    reserved_quantity?: number;
    reserved_price?: number;
  }>({ reserved: false });

  useEffect(() => {
    if (id) {
      fetchProduct();
      if (user) {
        checkFavorite();
      }
    }
  }, [id, user]);

  // 🆕 Verificar reservas de ofertas (REEMPLAZA el useEffect original)
  useEffect(() => {
    if (!id) return;
    
    const checkReservedOffers = async () => {
      try {
        // Buscar conversaciones para este producto
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('product_id', id);

        if (convError) {
          console.error('Error finding conversations:', convError);
          return;
        }

        if (!conversations || conversations.length === 0) {
          setReservedInfo({ reserved: false });
          return;
        }

        const conversationIds = conversations.map(c => c.id);

        // Primero intentamos usar la vista agregada pública (funciona con RLS en producción)
        const { data: agg, error: aggErr } = await supabase
          .from('product_reservations_v1')
          .select('reserved_qty')
          .eq('product_id', id)
          .maybeSingle();

        if (!aggErr && agg && typeof agg.reserved_qty === 'number') {
          const qty = agg.reserved_qty || 0;
          setReservedInfo(qty > 0 ? { reserved: true, reserved_quantity: qty } : { reserved: false });
          return; // ya actualizamos la UI; no hace falta consultar offers (protegida por RLS)
        }

        // Buscar TODAS las ofertas reservadas y SUMAR cantidades
        const { data: reservedOffers, error: offersError } = await supabase
          .from('offers')
          .select('reserved, reserved_quantity, reserved_price')
          .in('conversation_id', conversationIds)
          .eq('reserved', true)
          .eq('status', 'accepted');

        if (offersError) {
          console.error('Error checking reserved offers:', offersError);
          return;
        }

        // Actualizar estado de reserva
        if (reservedOffers && reservedOffers.length > 0) {
          // 🆕 SUMAR todas las cantidades reservadas
          const totalReserved = reservedOffers.reduce((sum, offer) => {
            return sum + (offer.reserved_quantity || 0);
          }, 0);

          const firstOfferPrice = reservedOffers[0]?.reserved_price;

          setReservedInfo({
            reserved: true,
            reserved_quantity: totalReserved,
            reserved_price: firstOfferPrice
          });
        } else {
          setReservedInfo({ reserved: false });
        }
      } catch (error) {
        console.error('Error in realtime check:', error);
      }
    };

    checkReservedOffers();

    const channel = supabase
      .channel(`product-detail-offers-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers'
      }, () => {
        // Cuando cambie cualquier oferta, verificar reservas
        checkReservedOffers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;

      setProduct(productData);

      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', productData.seller_id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);

      await supabase
        .from('products')
        .update({ views: (productData.views || 0) + 1 })
        .eq('id', id);

    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user?.id)
        .eq('product_id', id)
        .maybeSingle(); 

      setIsFavorite(!!data);
    } catch (error) {
      // ignore
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id);
        setIsFavorite(false);
        toast({ title: "Eliminado de favoritos", description: "El producto ha sido eliminado de tus favoritos" });
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: id });
        setIsFavorite(true);
        toast({ title: "Añadido a favoritos", description: "El producto ha sido añadido a tus favoritos" });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({ title: "Error", description: "No se pudo actualizar los favoritos", variant: "destructive" });
    }
  };

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para contactar con el vendedor",
        variant: "destructive",
      });
      return;
    }
    navigate(`/messages?seller=${product.seller_id}&product=${product.id}`);
  };

  // 🆕 Quitar reserva (solo vendedor) - CORREGIDO
  const unreserve = async () => {
    if (!user || user.id !== product.seller_id) return;
    try {
      // Buscar conversaciones para este producto
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('product_id', product.id);

      if (convError) throw convError;
      if (!conversations || conversations.length === 0) {
        toast({ title: "Error", description: "No se encontraron conversaciones", variant: "destructive" });
        return;
      }

      const conversationIds = conversations.map(c => c.id);

      // Buscar TODAS las ofertas reservadas
      const { data: reservedOffers, error: findError } = await supabase
        .from('offers')
        .select('id')
        .in('conversation_id', conversationIds)
        .eq('reserved', true)
        .eq('status', 'accepted');

      if (findError) throw findError;
      if (!reservedOffers || reservedOffers.length === 0) {
        toast({ title: "Error", description: "No se encontraron ofertas reservadas", variant: "destructive" });
        return;
      }

      // Quitar la reserva de TODAS las ofertas
      const updatePromises = reservedOffers.map(offer => 
        supabase
          .from('offers')
          .update({ 
            reserved: false, 
            reserved_quantity: null, 
            reserved_price: null,
            updated_at: new Date().toISOString() 
          })
          .eq('id', offer.id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw errors[0].error;
      }
      
      setReservedInfo({ reserved: false });
      toast({ title: "Reserva retirada", description: "Todas las reservas han sido eliminadas." });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo retirar la reserva", variant: "destructive" });
    }
  };

  // 🆕 Reservar directamente (sin oferta previa) - CORREGIDO
  const reserveDirect = async () => {
    if (!user || user.id !== product.seller_id) return;
    
    const input = window.prompt("Introduce el precio acordado en euros (opcional). Deja vacío para no guardar precio:");
    if (input === null) return; // cancelado
    
    const txt = input.trim();
    let agreed: number | null = null;
    if (txt) {
      const parsed = Number(String(txt).replace(",", "."));
      if (!Number.isFinite(parsed) || parsed < 0) {
        toast({ title: "Precio inválido", description: "Introduce un número válido (ej. 1200.50)", variant: "destructive" });
        return;
      }
      agreed = parsed;
    }

    try {
      // Buscar conversaciones para este producto
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq('product_id', product.id);

      if (convError) throw convError;
      if (!conversations || conversations.length === 0) {
        toast({ title: "Error", description: "No hay conversaciones para este producto", variant: "destructive" });
        return;
      }

      // Usar la primera conversación disponible
      const conversationId = conversations[0].id;

      // Crear nueva oferta de reserva
      const { error } = await supabase
        .from('offers')
        .insert({
          conversation_id: conversationId,
          buyer_id: null,
          seller_id: user.id,
          status: 'accepted',
          reserved: true,
          reserved_quantity: product.quantity || 1,
          reserved_price: agreed,
          offered_price: agreed || product.price
        });

      if (error) throw error;
      
      setReservedInfo({ 
        reserved: true, 
        reserved_quantity: product.quantity || 1, 
        reserved_price: agreed 
      });
      toast({ title: "Reservado", description: "El producto ha sido marcado como RESERVADO." });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo reservar el producto", variant: "destructive" });
    }
  };

  // 🆕 Calcular si está agotado usando la nueva información de reserva
  const isSoldOut = reservedInfo.reserved && reservedInfo.reserved_quantity != null && product?.quantity != null 
    ? reservedInfo.reserved_quantity >= product.quantity
    : false;

  // 🆕 Color según disponibilidad
  const getReserveColor = () => {
    if (!reservedInfo.reserved) return "";
    return isSoldOut ? "bg-red-600 hover:bg-red-600" : "bg-amber-600 hover:bg-amber-600";
  };

  // 🆕 Texto según disponibilidad
  const getReserveText = () => {
    if (!reservedInfo.reserved) return "";
    return isSoldOut ? "🔴 Agotado" : "🟠 Reservado";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
              <p className="text-muted-foreground mb-4">El producto que buscas no existe o ha sido eliminado.</p>
              <Button onClick={() => navigate('/')} type="button">Volver al inicio</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const currentIdx = product?.images?.length
    ? Math.min(Math.max(detailIndex, 0), product.images.length - 1)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} type="button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imágenes */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {/* 🆕 Cinta RESERVADO/AGOTADO en la imagen */}
                {reservedInfo.reserved && (
                  <div className="absolute left-0 top-0 z-10">
                    <div className={`text-white text-xs font-bold px-3 py-1 rounded-br-xl ${
                      isSoldOut ? "bg-red-600" : "bg-amber-600"
                    }`}>
                      {isSoldOut ? "AGOTADO" : "RESERVADO"}
                    </div>
                  </div>
                )}

                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[currentIdx]} 
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <Package className="h-24 w-24 text-muted-foreground" />
                )}

                {product?.images?.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur px-2 py-2 border"
                      onClick={() =>
                        setDetailIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
                      }
                      aria-label="Anterior"
                    >
                      &lt;
                    </button>

                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur px-2 py-2 border"
                      onClick={() =>
                        setDetailIndex((prev) => (prev + 1) % product.images.length)
                      }
                      aria-label="Siguiente"
                    >
                      &gt;
                    </button>

                    <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
                      {product.images.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          className={`w-2 h-2 rounded-full ${
                            idx === currentIdx
                              ? "bg-primary"
                              : "bg-muted-foreground/50"
                          }`}
                          onClick={() => setDetailIndex(idx)}
                          aria-label={`Ir a imagen ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      className={`aspect-video bg-muted rounded overflow-hidden ${
                        idx === currentIdx ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setDetailIndex(idx)}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">{product.category}</Badge>
                    {reservedInfo.reserved && (
                      <Badge variant="outline" className={getReserveColor()}>
                        {getReserveText()}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleFavorite} type="button">
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-primary">
                  {product.price} €
                </span>
                {product.original_price && (
                  <span className="text-muted-foreground line-through">
                    {product.original_price} €
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{product.location}</span>
                {me && seller?.lat && seller?.lon && (
                  <DistanceBadge
                    lat1={me.latitude}
                    lon1={me.longitude}
                    lat2={seller.lat}
                    lon2={seller.lon}
                  />
                )}
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>
            </div>

            {/* Detalles del producto */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Detalles del producto</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condición</span>
                    <span className="font-medium">{product.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disponibilidad</span>
                    <span className="font-medium">
                      {product.quantity || 1} unidad{product.quantity !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Publicado</span>
                    <span className="font-medium">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vistas</span>
                    <span className="font-medium">{product.views || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="space-y-3">
              {user?.id !== product.seller_id ? (
                <>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setPaymentDialogOpen(true)}
                    disabled={isSoldOut}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Comprar ahora
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCounterOpen(true)}
                    disabled={isSoldOut}
                  >
                    <Pencil className="h-5 w-5 mr-2" />
                    Hacer contraoferta
                  </Button>
                  
                  <Button variant="outline" className="w-full" onClick={handleContact} type="button">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contactar con el vendedor
                  </Button>
                </>
              ) : (
                <>
                  {/* 🆕 Botones para el vendedor */}
                  {!reservedInfo.reserved ? (
                    <Button variant="outline" className="w-full" onClick={reserveDirect} type="button">
                      <Truck className="h-5 w-5 mr-2" />
                      Marcar como reservado
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={unreserve} type="button">
                      <Truck className="h-5 w-5 mr-2" />
                      Quitar reserva
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/edit-product/${product.id}`)} type="button">
                    <Pencil className="h-5 w-5 mr-2" />
                    Editar producto
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Información del vendedor */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Información del vendedor</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <ProfileAvatar 
                  profileId={product.seller_id} 
                  className="h-16 w-16"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{seller?.username || "Usuario"}</h3>
                  <p className="text-muted-foreground mb-2">
                    Miembro desde {new Date(seller?.created_at || Date.now()).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">25 valoraciones</span>
                  </div>
                </div>
                <Button variant="outline" onClick={handleContact} type="button">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PaymentDialog 
        open={paymentDialogOpen} 
        onOpenChange={setPaymentDialogOpen}
        product={product}
        seller={seller}
        reservedInfo={reservedInfo}
      />

      <CounterOfferDialog
        open={counterOpen}
        onOpenChange={setCounterOpen}
        product={product}
        seller={seller}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;