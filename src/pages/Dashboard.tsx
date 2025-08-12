import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Package, MessageSquare, Euro, TrendingUp, Eye, Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    totalMessages: 0,
    totalSales: 0,
    totalRevenue: 0,
    favorites: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch products stats
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id);

      const activeProducts = products?.filter(p => p.status === 'active').length || 0;

      // Fetch recent products
      const { data: recent } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats(prev => ({
        ...prev,
        totalProducts: products?.length || 0,
        activeProducts,
        totalViews: products?.reduce((sum, p) => sum + (p.views || 0), 0) || 0,
        favorites: products?.reduce((sum, p) => sum + (p.favorites || 0), 0) || 0,
      }));

      setRecentProducts(recent || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
              <p className="text-muted-foreground">Debes iniciar sesión para ver tu dashboard.</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Ventas</h1>
          <p className="text-muted-foreground">Gestiona tus productos y monitorea tu rendimiento</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
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
              <p className="text-xs text-muted-foreground">
                Total de vistas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favorites}</div>
              <p className="text-xs text-muted-foreground">
                Productos guardados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                Conversaciones
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Productos Recientes
                <Button variant="outline" size="sm" onClick={() => navigate('/my-products')} type="button">
                  Ver todos
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentProducts.length > 0 ? (
                <div className="space-y-4">
                  {recentProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{product.title}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                          <span className="text-sm font-medium">€{product.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No tienes productos aún</p>
                  <Button onClick={() => navigate('/sell')} type="button">
                    Crear primer producto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Button onClick={() => navigate('/sell')} className="justify-start h-auto p-4" type="button">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Publicar Producto</div>
                      <div className="text-sm text-muted-foreground">Añade un nuevo material a tu catálogo</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" onClick={() => navigate('/messages')} className="justify-start h-auto p-4" type="button">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Ver Mensajes</div>
                      <div className="text-sm text-muted-foreground">Responde a consultas de compradores</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" onClick={() => navigate('/profile')} className="justify-start h-auto p-4" type="button">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Editar Perfil</div>
                      <div className="text-sm text-muted-foreground">Actualiza la información de tu empresa</div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" onClick={() => navigate('/analytics')} className="justify-start h-auto p-4" type="button">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Ver Estadísticas</div>
                      <div className="text-sm text-muted-foreground">Analiza el rendimiento de tus productos</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;