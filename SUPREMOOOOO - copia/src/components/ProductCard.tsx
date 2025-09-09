import { MapPin, Star, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import DistanceBadge from "@/components/DistanceBadge";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  location: string;
  image: string;
  category: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
    shippingAvailable?: boolean;
  };
  description: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  latitude?: number | null;
  longitude?: number | null;
  quantity?: number;
  unit?: string;
}

const ProductCard = ({ 
  id,
  title, 
  price, 
  location, 
  image, 
  category, 
  seller, 
  description,
  isFavorite = false,
  onToggleFavorite,
  latitude = null,
  longitude = null,
  quantity = 0,
  unit = "ud",
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservedInfo, setReservedInfo] = useState<{
    reserved: boolean;
    reserved_quantity?: number;
    reserved_price?: number;
  }>({ reserved: false });

  const [me, setMe] = useState<{ latitude:number; longitude:number } | null>(null);
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user_coords_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
          setMe({ latitude: parsed.lat, longitude: parsed.lng });
        }
      }
    } catch {}
  }, []);

  // 🆕 Calcular si está agotado - CORREGIDO
  const isSoldOut = reservedInfo.reserved && reservedInfo.reserved_quantity != null && quantity != null 
    ? reservedInfo.reserved_quantity >= quantity
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

  // 🆕 Verificar si el producto tiene ofertas reservadas
  useEffect(() => {
    const checkReservedOffers = async () => {
      try {
        // PRIMERO: Buscar conversaciones relacionadas con este producto
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('product_id', id);

        if (convError) {
          console.error('Error finding conversations:', convError);
          return;
        }

        if (!conversations || conversations.length === 0) {
          return;
        }

        const conversationIds = conversations.map(c => c.id);

        // SEGUNDO: Buscar TODAS las ofertas reservadas y SUMAR las cantidades
        const { data: offers, error: offersError } = await supabase
          .from('offers')
          .select('reserved, reserved_quantity, reserved_price')
          .in('conversation_id', conversationIds)
          .eq('reserved', true)
          .eq('status', 'accepted');

        if (offersError) {
          console.error('Error checking reserved offers:', offersError);
          return;
        }

        if (offers && offers.length > 0) {
          // 🆕 SUMAR todas las cantidades reservadas
          const totalReserved = offers.reduce((sum, offer) => {
            return sum + (offer.reserved_quantity || 0);
          }, 0);

          // 🆕 Tomar el precio de la primera oferta
          const firstOfferPrice = offers[0]?.reserved_price;

          setReservedInfo({
            reserved: true,
            reserved_quantity: totalReserved,
            reserved_price: firstOfferPrice
          });
        }
      } catch (error) {
        console.error('Error checking reserved offers:', error);
      }
    };

    checkReservedOffers();
  }, [id]);

  // 🆕 Suscripción realtime para cambios en ofertas
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`product-card-offers-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers'
      }, async (payload) => {
        // Cuando cambie cualquier oferta, volver a verificar las reservas
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .eq('product_id', id);

        if (conversations && conversations.length > 0) {
          const conversationIds = conversations.map(c => c.id);
          const { data: offers } = await supabase
            .from('offers')
            .select('reserved, reserved_quantity, reserved_price')
            .in('conversation_id', conversationIds)
            .eq('reserved', true)
            .eq('status', 'accepted');

          if (offers && offers.length > 0) {
            // 🆕 SUMAR todas las cantidades reservadas
            const totalReserved = offers.reduce((sum, offer) => {
              return sum + (offer.reserved_quantity || 0);
            }, 0);

            const firstOfferPrice = offers[0]?.reserved_price;

            setReservedInfo({
              reserved: true,
              reserved_quantity: totalReserved,
              reserved_price: firstOfferPrice
            });
          } else {
            setReservedInfo({ reserved: false });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para contactar con el vendedor",
        variant: "destructive",
      });
      return;
    }
    navigate(`/messages?seller=${seller.id}&product=${id}`);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-border bg-card">
      <CardHeader className="p-0 relative">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 bg-background/80 hover:bg-background ${
              isFavorite ? 'text-red-500' : 'text-muted-foreground'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            {category}
          </Badge>
          {typeof seller.shippingAvailable !== "undefined" && (
            <Badge className="absolute top-10 left-2" variant="secondary">
              {seller.shippingAvailable ? "Envío" : "Sin envío"}
            </Badge>
          )}
          {/* 🆕 Badge de RESERVADO/AGOTADO en la imagen */}
          {reservedInfo.reserved && (
            <div className="absolute top-2 right-10">
              <Badge className={`${getReserveColor()} text-white`}>
                {getReserveText()}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Price and Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">{price}</span>
            <div className="flex items-center text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm text-muted-foreground ml-1">{seller.rating}</span>
            </div>
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>

        {/* 🆕 Información de reserva si está reservado */}
        {reservedInfo.reserved && (
          <div className={`border rounded-lg p-2 ${
            isSoldOut ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
          }`}>
            <div className={`text-xs font-medium ${
              isSoldOut ? "text-red-800" : "text-amber-800"
            }`}>
              {isSoldOut ? "🔴 AGOTADO" : "🟠 RESERVADO"}
            </div>
            {reservedInfo.reserved_quantity !== undefined && reservedInfo.reserved_quantity !== null && quantity !== null && (
              <div className={`text-xs ${isSoldOut ? "text-red-600" : "text-amber-600"}`}>
                {isSoldOut 
                  ? `Total reservado: ${reservedInfo.reserved_quantity} ${unit}`
                  : `Reservado: ${reservedInfo.reserved_quantity} de ${quantity} ${unit}`
                }
              </div>
            )}
            {reservedInfo.reserved_price && (
              <div className={`text-xs ${isSoldOut ? "text-red-600" : "text-amber-600"}`}>
                Precio: €{reservedInfo.reserved_price.toLocaleString("es-ES")}
              </div>
            )}
            {!isSoldOut && quantity !== null && reservedInfo.reserved_quantity !== undefined && reservedInfo.reserved_quantity !== null && (
              <div className="text-xs text-green-600 font-medium mt-1">
                Disponible: {quantity - reservedInfo.reserved_quantity} {unit}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Seller Info */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium text-foreground">{seller.name}</span>
              {seller.verified && (
                <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
                  Verificado
                </Badge>
              )}
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="text-xs">
                {location}
                <DistanceBadge
                  me={me}
                  item={latitude != null && longitude != null ? { latitude: Number(latitude), longitude: Number(longitude) } : null}
                  className="ml-1 opacity-70"
                />
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1" 
            onClick={handleContact}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contactar
          </Button>
          <Button 
            size="sm" 
            className="flex-1" 
            onClick={() => navigate(`/products/${id}`)}
          >
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;