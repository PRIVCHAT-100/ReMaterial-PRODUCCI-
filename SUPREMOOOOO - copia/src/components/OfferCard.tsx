import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export interface Offer {
  id: string;
  product_id: string;
  conversation_id: string | null;
  buyer_id: string;
  seller_id: string;
  offered_price: number;
  quantity: number | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  created_at: string;
}

export default function OfferCard({ offer }: { offer: Offer }) {
  const { t } = useTranslation();

  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState<false | 'accepted' | 'rejected' | 'canceled' | 'reserve'>(false);

  const isSeller = user?.id === offer.seller_id;
  const isBuyer  = user?.id === offer.buyer_id;

  const fmtEUR = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(n || 0));

  const statusBadge = (s: Offer["status"]) => {
    switch (s) {
      case "accepted": return <Badge className="bg-emerald-600 hover:bg-emerald-600">Aceptada</Badge>;
      case "rejected": return <Badge variant="destructive">Rechazada</Badge>;
      case "canceled": return <Badge variant="outline">Cancelada</Badge>;
      default:         return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  const updateStatus = async (next: 'accepted' | 'rejected' | 'canceled') => {
    if (next === "rejected" && !confirm("¿Seguro que quieres rechazar esta contraoferta?")) return;
    if (next === "canceled" && !confirm("¿Seguro que quieres cancelar tu contraoferta?")) return;

    try {
      setSubmitting(next);
      // Optimistic UI: update immediately
      window.dispatchEvent(new CustomEvent('offer-status-updated', { detail: { id: offer.id, status: next } }));
      const { error } = await supabase
        .from('offers')
        .update({ status: next })
        .eq('id', offer.id);
      if (error) {
        // rollback optimistic
        window.dispatchEvent(new CustomEvent('offer-status-updated', { detail: { id: offer.id, status: offer.status } }));
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }

            window.dispatchEvent(new CustomEvent('offer-status-updated', { detail: { id: offer.id, status: next } }));
      toast({ title: 'Actualizado', description: `Estado: ${next}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || "No se pudo actualizar la oferta", variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // 🆕 Reservar producto para este comprador con el precio acordado
  const reserveProduct = async () => {
    if (!isSeller) return;
    if (!confirm("¿Marcar este producto como RESERVADO para este comprador?")) return;

    try {
      setSubmitting('reserve');

      // Permitir decidir si guardar el precio ofrecido como precio reservado
      const keepPrice = confirm('¿Quieres guardar el precio ofrecido como PRECIO RESERVADO en el producto? (Aceptar = sí, Cancelar = no)');

      const updatePayload: any = {
          reserved: true,
          reserved_by: offer.buyer_id,
          updated_at: new Date().toISOString(),
      };
      if (keepPrice) {
          updatePayload.reserved_price = offer.offered_price;
      } else {
          updatePayload.reserved_price = null; // deja el campo vacío
      }

      const { error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', offer.product_id);

      if (error) {
        // rollback optimistic
        window.dispatchEvent(new CustomEvent('offer-status-updated', { detail: { id: offer.id, status: offer.status } }));
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }

            toast({ title: 'Reservado', description: 'El producto ha sido marcado como RESERVADO.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || "No se pudo reservar el producto", variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">Contraoferta #{offer.id.slice(0,8)}</CardTitle>
        {statusBadge(offer.status)}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div><b>{t('ui.precio-ofrecido')}</b> {fmtEUR(offer.offered_price)}</div>
        {offer.quantity != null && <div><b>Cantidad:</b> {offer.quantity}</div>}
        {offer.message && <div className="whitespace-pre-line"><b>Mensaje:</b> {offer.message}</div>}
        <div className="text-xs text-muted-foreground">{new Date(offer.created_at).toLocaleString()}</div>

        {offer.status === 'pending' && (
          <div className="pt-2 flex gap-2">
            {isSeller && (
              <>
                <Button size="sm" onClick={() => updateStatus('accepted')} disabled={!!submitting}>
                  {submitting === 'accepted' ? 'Aceptando…' : 'Aceptar'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatus('rejected')} disabled={!!submitting}>
                  {submitting === 'rejected' ? 'Rechazando…' : 'Rechazar'}
                </Button>
              </>
            )}
            {isBuyer && (
              <Button size="sm" variant="outline" onClick={() => updateStatus('canceled')} disabled={!!submitting}>
                {submitting === 'canceled' ? 'Cancelando…' : 'Cancelar'}
              </Button>
            )}
          </div>
        )}

        {/* 🆕 Cuando la oferta está aceptada, el vendedor puede “Reservar” el producto para este comprador */}
        {offer.status === 'accepted' && isSeller && (
          <div className="pt-2">
            <Button size="sm" variant="secondary" onClick={reserveProduct} disabled={!!submitting}>
              {submitting === 'reserve' ? 'Reservando…' : 'Reservar este producto para el comprador'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}