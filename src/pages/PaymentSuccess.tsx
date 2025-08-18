import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Calendar, MapPin, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const PaymentSuccess = () => {
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId },
      });

      if (error) throw error;
      setOrder(data.order);
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verificando pago...</h1>
            <p className="text-muted-foreground">Por favor espera mientras confirmamos tu compra</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">{t('ui.error-en-el-pago')}</h1>
              <p className="text-muted-foreground mb-6">
                No se pudo verificar tu pago. Si el problema persiste, contacta con soporte.
              </p>
              <Button onClick={() => navigate('/')} type="button">
                Volver al inicio
              </Button>
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
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">{t('ui.pago-exitoso')}</h1>
            <p className="text-muted-foreground">{t('ui.tu-compra-ha-sido-procesada-correctamente-recibir-')}</p>
          </div>

          {/* Order Details */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Detalles del Pedido</h2>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Pagado
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID del Pedido</p>
                    <p className="font-mono text-sm">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Producto</p>
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{order.product?.title || 'Producto'}</p>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {order.quantity} {order.product?.unit || 'unidades'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('ui.precio-por-unidad')}</p>
                    <p className="text-lg font-semibold">€{order.product?.price || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total pagado</p>
                    <p className="text-lg font-semibold text-green-600">€{order.total_price}</p>
                  </div>
                </div>

                {order.shipping_address && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t('ui.direcci-n-de-env-o')}</p>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="text-sm">
                          <p>{order.shipping_address.name}</p>
                          <p>{order.shipping_address.address}</p>
                          <p>{order.shipping_address.city} {order.shipping_address.postalCode}</p>
                          <p>{order.shipping_address.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />{t('ui.pr-ximos-pasos')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">{t('ui.confirmaci-n-del-vendedor')}</p>
                    <p className="text-muted-foreground">{t('ui.el-vendedor-confirmar-la-disponibilidad-del-produc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">{t('ui.preparaci-n-del-env-o')}</p>
                    <p className="text-muted-foreground">{t('ui.el-producto-ser-preparado-para-el-env-o')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Entrega</p>
                    <p className="text-muted-foreground">{t('ui.recibir-s-el-tracking-una-vez-enviado')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate('/dashboard')} className="flex-1" type="button">
              Ver Mis Pedidos
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Seguir Comprando
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;