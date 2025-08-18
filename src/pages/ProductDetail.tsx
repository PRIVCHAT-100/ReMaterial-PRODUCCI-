import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useTranslation } from "react-i18next";

const ProductDetail = () => {
  const { t } = useTranslation();

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

  useEffect(() => {
    if (id) {
      fetchProduct();
      if (user) {
        checkFavorite();
      }
    }
  }, [id, user]);

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

  // 🆕 Quitar reserva (solo vendedor)
  const unreserve = async () => {
    if (!user || user.id !== product.seller_id) return;
    try {
      const { error } = await supabase
        .from('products')
        .update({ reserved: false, reserved_by: null, reserved_price: null, reserved_until: null, updated_at: new Date().toISOString() })
        .eq('id', product.id);
      if (error) throw error;
      setProduct((prev: any) => ({ ...prev, reserved: false, reserved_by: null, reserved_price: null, reserved_until: null }));
      toast({ title: "Reserva retirada", description: "El producto ya no está reservado." });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo retirar la reserva", variant: "destructive" });
    }
  };

  // 🆕 Reservar directamente (sin oferta previa)
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
      const { error } = await supabase
        .from('products')
        .update({ reserved: true, reserved_by: null, reserved_price: agreed, reserved_until: null, updated_at: new Date().toISOString() })
        .eq('id', product.id);
      if (error) throw error;
      setProduct((prev: any) => ({ ...prev, reserved: true, reserved_by: null, reserved_price: agreed }));
      toast({ title: "Reservado", description: "El producto ha sido marcado como RESERVADO." });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo reservar el producto", variant: "destructive" });
    }
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
            <ArrowLeft className="h-4 w-4 mr-2" />{t('ui.volver')}</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Imágenes */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {/* 🆕 Cinta RESERVADO en la imagen */}
                {product.reserved && (
                  <div className="absolute left-0 top-0 z-10">
                    <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-br-xl">
                      RESERVADO
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
                    {/* 🆕 Badge RESERVADO junto al título */}
                    {product.reserved && (
                      <Badge className="bg-amber-600 hover:bg-amber-600 text-white">RESERVADO</Badge>
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
              {product.reserved && product.reserved_price != null && (
                <div className="text-sm text-amber-700 mb-2">
                  Reservado por €{Number(product.reserved_price).toLocaleString("es-ES")}
                </div>
              )}
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {product.location}
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

            {/* Acciones */}
            <div className="space-y-3">
              {/* 🆕 Reservar directo (solo vendedor y si NO está reservado) */}
              {user?.id === product.seller_id && !product.reserved && (
                <Button
                  variant="secondary"
                  className="w-full"
                  type="button"
                  onClick={reserveDirect}
                >{t('ui.marcar-como-reservado-precio-acordado')}</Button>
              )}

              {/* 🆕 Quitar reserva (solo vendedor y si está reservado) */}
              {user?.id === product.seller_id && product.reserved && (
                <Button
                  variant="destructive"
                  className="w-full"
                  type="button"
                  onClick={unreserve}
                >
                  Quitar reserva
                </Button>
              )}

              {/* 🔒 Editar: pasa el producto por state para precargar al instante */}
              {user?.id === product.seller_id && (
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => navigate(`/product/${product.id}/edit`, { state: { product } })}
                >
                  <Pencil className="h-4 w-4 mr-2" />{t('ui.editar-producto')}</Button>
              )}

              <Button onClick={handleContact} className="w-full" type="button">
                <MessageSquare className="h-4 w-4 mr-2" />{t('ui.contactar-vendedor')}</Button>

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
              >
                💬 Hacer contraoferta
              </Button>

              {product.allow_direct_purchase && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setPaymentDialogOpen(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />{t('ui.comprar-directamente')}</Button>
              )}
            </div>

            {/* Vendedor */}
            {seller && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {seller.company_name?.charAt(0) || 'E'}
                      </AvatarFallback>
                    </Avatar>
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
                        onClick={() => navigate(`/empresa/${seller.id}`, { state: { from: `/product/${product.id}` } })}
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
              <h2 className="text-xl font-semibold mb-4">{t('ui.descripci-n-del-producto')}</h2>
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