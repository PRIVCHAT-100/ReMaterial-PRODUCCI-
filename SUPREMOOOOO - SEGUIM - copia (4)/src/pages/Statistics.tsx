import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Eye, Heart, MessageSquare, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const Statistics = () => {
  const { t } = useTranslation();

  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalMessages: 0,
    activeProducts: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user]);

  const fetchStatistics = async () => {
    try {
      // Fetch product statistics
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id);

      // Fetch favorites count
      const { data: favorites } = await supabase
        .from('favorites')
        .select('*')
        .in('product_id', products?.map(p => p.id) || []);

      // Fetch messages count
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('seller_id', user?.id);

      const totalViews = products?.reduce((sum, product) => sum + (product.views || 0), 0) || 0;
      const activeProducts = products?.filter(p => p.status === 'active').length || 0;

      setStats({
        totalProducts: products?.length || 0,
        totalViews,
        totalFavorites: favorites?.length || 0,
        totalMessages: conversations?.length || 0,
        activeProducts,
        avgRating: 4.5, // Mock rating
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
              <p className="text-muted-foreground">{t('ui.debes-iniciar-sesi-n-para-ver-las-estad-sticas')}</p>
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('ui.estad-sticas')}</h1>
          <p className="text-muted-foreground">{t('ui.analiza-el-rendimiento-de-tus-productos-y-ventas')}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ui.total-productos')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeProducts} activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visualizaciones</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground">{t('ui.total-de-vistas-de-productos')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ui.favoritos')}</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFavorites}</div>
                <p className="text-xs text-muted-foreground">{t('ui.productos-marcados-como-favoritos')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversaciones</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Conversaciones iniciadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ui.valoraci-n')}</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgRating}</div>
                <p className="text-xs text-muted-foreground">{t('ui.valoraci-n-promedio')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12%</div>
                <p className="text-xs text-muted-foreground">
                  Crecimiento este mes
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Rendimiento</CardTitle>
              <CardDescription>{t('ui.an-lisis-general-de-tu-actividad-en-la-plataforma')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t('ui.productos-activos')}</span>
                <Badge variant="secondary">{stats.activeProducts} de {stats.totalProducts}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Promedio de Vistas por Producto</span>
                <Badge variant="outline">
                  {stats.totalProducts > 0 ? Math.round(stats.totalViews / stats.totalProducts) : 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('ui.tasa-de-favoritos')}</span>
                <Badge variant="outline">
                  {stats.totalViews > 0 ? Math.round((stats.totalFavorites / stats.totalViews) * 100) : 0}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Statistics;