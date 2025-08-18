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
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            seller:profiles!products_seller_id_fkey (
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
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardHeader className="pb-3">
                  <CardTitle className="h-6 bg-muted rounded animate-pulse w-2/3" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  </div>
                </CardContent>
              </Card>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Tus Favoritos</h1>
          <p className="text-muted-foreground">
            Aquí encontrarás los productos que has guardado para ver más tarde.
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No tienes favoritos aún</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Cuando marques un producto con <Heart className="inline h-4 w-4 mx-1" /> aparecerá aquí.
              </p>
              <Button onClick={() => navigate('/explore')}>
                Explorar productos
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
                    <CardTitle className="text-xl line-clamp-1">{product.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-semibold">€{product.price}</div>
                      <Badge variant="secondary" className="uppercase">{product.category}</Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {product.location || "Ubicación no especificada"}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      🧮 {product.quantity} {product.unit}
                    </div>

                    {product.seller && (
                      <div className="text-sm text-muted-foreground mb-2">
                        👤 {product.seller.company_name || 
                             `${product.seller.first_name || ''} ${product.seller.last_name || ''}`.trim() || 
                             'Usuario'}
                      </div>
                    )}

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
