import { MapPin, Star, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  
  shippingAvailable?: boolean;};
  description: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
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
  onToggleFavorite
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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
          {typeof shippingAvailable !== "undefined" && (
            <Badge className="absolute top-10 left-2" variant="secondary">
              {shippingAvailable ? "Envío" : "Sin envío"}
            </Badge>
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
              <span className="text-xs">{location}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleContact}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contactar
          </Button>
          <Button size="sm" className="flex-1" onClick={() => navigate(`/product/${id}`)}>
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;