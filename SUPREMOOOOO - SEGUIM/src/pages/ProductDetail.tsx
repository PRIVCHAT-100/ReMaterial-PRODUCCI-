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
                      {product.images.map((_: any, i: number) => (
                        <span
                          key={i}
                          className={
                            "h-1.5 w-1.5 rounded-full bg-white/50 " +
                            (i === currentIdx ? "bg-white" : "")
                          }
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{product.title}</h1>
                  <div className="flex items-center gap-2">
                    {product.category && <Badge variant="secondary">{product.category}</Badge>}
                    {/* 🆕 Badge RESERVADO/AGOTADO junto al título */}
                    {reservedInfo.reserved && (
                      <Badge className={`${getReserveColor()} text-white`}>
                        {getReserveText()}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleFavorite} type="button">
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Enlace copiado", description: "El enlace del producto ha sido copiado al portapapeles" });
                  }}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-4xl font-bold text-primary mb-2">€{product.price}</div>
              {/* 🆕 Mostrar precio reservado si existe */}
              {reservedInfo.reserved && reservedInfo.reserved_price != null && (
                <div className="text-sm text-amber-700 mb-2">
                  Precio reserva: €{Number(reservedInfo.reserved_price).toLocaleString("es-ES")}
                </div>
              )}
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {product.location}
                  <DistanceBadge
                    me={me}
                    item={product.latitude && product.longitude ? { latitude: product.latitude, longitude: product.longitude } : null}
                    className="ml-1 opacity-70"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Publicado el {new Date(product.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Cantidad: {product.quantity} {product.unit}
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {product.shipping_available ? "Envío disponible" : "Sin envío"}
                </div>
              </div>
            </div>

            {/* 🆕 Información de reserva */}
            {reservedInfo.reserved && (
              <div className={`rounded-lg border p-3 ${
                isSoldOut ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
              }`}>
                <div className={`font-medium ${
                  isSoldOut ? "text-red-800" : "text-amber-800"
                }`}>
                  {isSoldOut ? "🔴 PRODUCTO AGOTADO" : "🟠 PRODUCTO RESERVADO"}
                </div>
                {reservedInfo.reserved_quantity !== null && product.quantity !== null && (
                  <div className={`text-sm ${isSoldOut ? "text-red-600" : "text-amber-600"}`}>
                    {isSoldOut 
                      ? `Total reservado: ${reservedInfo.reserved_quantity} ${product.unit}`
                      : `Reservado: ${reservedInfo.reserved_quantity} de ${product.quantity} ${product.unit}`
                    }
                  </div>
                )}
                {reservedInfo.reserved_price && (
                  <div className={`text-sm ${isSoldOut ? "text-red-600" : "text-amber-600"}`}>
                    Precio acordado: €{reservedInfo.reserved_price.toLocaleString("es-ES")}
                  </div>
                )}
                {!isSoldOut && product.quantity !== null && reservedInfo.reserved_quantity !== null && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    📦 Disponible: {product.quantity - reservedInfo.reserved_quantity} {product.unit}
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="space-y-3">
              {/* 🆕 Reservar directo (solo vendedor y si NO está reservado) */}
              {user?.id === product.seller_id && !reservedInfo.reserved && (
                <Button
                  variant="secondary"
                  className="w-full"
                  type="button"
                  onClick={reserveDirect}
                >
                  Marcar como RESERVADO (precio acordado)
                </Button>
              )}

              {/* 🆕 Quitar reserva (solo vendedor y si está reservado) */}
              {user?.id === product.seller_id && reservedInfo.reserved && (
                <Button
                  variant="destructive"
                  className="w-full"
                  type="button"
                  onClick={unreserve}
                >
                  Quitar todas las reservas
                </Button>
              )}

              {/* 🔒 Editar: pasa el producto por state para precargar al instante */}
              {user?.id === product.seller_id && (
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => navigate(`/edit/${product.id}`, { state: { product } })}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar producto
                </Button>
              )}

              <Button onClick={handleContact} className="w-full" type="button">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contactar Vendedor
              </Button>

              {/* 🆕 SOLO deshabilitar contraoferta si está agotado */}
              {!(reservedInfo.reserved && user?.id !== product.seller_id) && (
                <Button 
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => {
                    if (!user) {
                      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para hacer una contraoferta", variant: "destructive" });
                      return;
                    }
                    setCounterOpen(true);
                  }}
                  disabled={isSoldOut}
                >
                  💬 {isSoldOut ? "Producto Agotado" : "Hacer contraoferta"}
                </Button>
              )}

              {product.allow_direct_purchase && !(reservedInfo.reserved && user?.id !== product.seller_id) && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setPaymentDialogOpen(true)}
                  disabled={isSoldOut}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isSoldOut ? "Producto Agotado" : "Comprar Directamente"}
                </Button>
              )}

              {reservedInfo.reserved && user?.id !== product.seller_id && (
                <div className={`mt-2 rounded-md border px-3 py-2 text-sm ${
                  isSoldOut ? "border-red-300 bg-red-50 text-red-900" : "border-amber-300 bg-amber-50 text-amber-900"
                }`}>
                  {isSoldOut 
                    ? "Este producto está completamente agotado."
                    : "Este producto está reservado."
                  }
                </div>
              )}
            </div>

            {/* Vendedor */}
            {seller && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <ProfileAvatar className="h-12 w-12" name={ seller?.company_name || user?.email || "Perfil" } />
                    <div className="flex-1">
                      <h3 className="font-semibold">{seller.company_name}</h3>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">(4.8)</span>
                      </div>
                      
                      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {seller.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {seller.location}
                          </div>
                        )}
                        {seller.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {seller.phone}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 w-full"
                        onClick={() => navigate(`/empresa/${seller.id}`, { state: { from: `/products/${product.id}` } })}
                      >
                        Ver Perfil Completo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Descripción del Producto</h2>
              <div className="prose max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              </div>
              
              {product.specifications && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Especificaciones</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-muted-foreground">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <CounterOfferDialog
        open={counterOpen}
        onOpenChange={setCounterOpen}
        product={{
          id: product.id,
          title: product.title,
          unit: product.unit,
          price: product.price,
          seller_id: product.seller_id,
        }}
      />

      <PaymentDialog 
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        product={product}
      />
      
      <Footer />
    </div>
  );
};

export default ProductDetail;