import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Package, Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          products (
            id,
            title,
            price,
            quantity,
            unit,
            category,
            images,
            location,
            description,
            created_at,
            profiles (
              first_name,
              last_name,
              company_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus favoritos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({
        title: "Eliminado de favoritos",
        description: "El producto ha sido eliminado de tus favoritos",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar de favoritos",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Favoritos</h1>
          <p className="text-muted-foreground">Productos que has guardado para más tarde</p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes favoritos</h3>
              <p className="text-muted-foreground mb-6">
                Explora productos y guarda los que más te interesen
              </p>
              <Button onClick={() => navigate('/')} type="button">
                Explorar Productos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const product = favorite.products;
              if (!product) return null;

              return (
                <Card key={favorite.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center relative">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-16 w-16 text-muted-foreground" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                      onClick={() => removeFavorite(favorite.id)}
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                    <Badge variant="secondary" className="w-fit">{product.category}</Badge>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-primary">
                        €{product.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {product.quantity} {product.unit}
                      </div>
                    </div>

                    {product.profiles && (
                      <div className="text-sm text-muted-foreground mb-2">
                        👤 {product.profiles.company_name || 
                             `${product.profiles.first_name || ''} ${product.profiles.last_name || ''}`.trim() || 
                             'Usuario'}
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground mb-4">
                      📍 {product.location}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        Ver Detalles
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Favorites;