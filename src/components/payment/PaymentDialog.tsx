import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

export const PaymentDialog = ({ open, onOpenChange, product }: PaymentDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "España",
  });

  const totalPrice = product ? product.price * quantity : 0;
  const platformFee = totalPrice * 0.05; // 5% platform fee
  const finalTotal = totalPrice + platformFee;

  const handleInputChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para realizar una compra",
        variant: "destructive",
      });
      return;
    }

    if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa la dirección de envío",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productId: product.id,
          quantity,
          shippingAddress,
        },
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      window.open(data.url, '_blank');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Error en el pago",
        description: error.message || "No se pudo procesar el pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Comprar Producto
          </DialogTitle>
          <DialogDescription>
            Completa tu compra de {product.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">IMG</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{product.title}</h4>
                  <Badge variant="secondary" className="mt-1">{product.category}</Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Disponible: {product.quantity} {product.unit}
                  </p>
                  <p className="text-lg font-semibold mt-2">€{product.price} / {product.unit}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.quantity}
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity, parseFloat(e.target.value) || 1)))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">{product.unit}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <h3 className="font-medium">Dirección de Envío</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">Nombre Completo*</Label>
                <Input
                  id="name"
                  value={shippingAddress.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Dirección*</Label>
                <Input
                  id="address"
                  value={shippingAddress.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Calle Principal 123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad*</Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Madrid"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Código Postal</Label>
                <Input
                  id="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="28001"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={shippingAddress.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="España"
                />
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium mb-3">Resumen del Pedido</h3>
              <div className="flex justify-between text-sm">
                <span>{quantity} {product.unit} × €{product.price}</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Comisión de plataforma (5%)</span>
                <span>€{platformFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>€{finalTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pagar con Stripe
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            El pago se procesará de forma segura a través de Stripe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};