import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface CounterOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    title: string;
    unit?: string;
    price?: number | string | null;
    seller_id: string;
  };
}

export default function CounterOfferDialog({ open, onOpenChange, product }: CounterOfferDialogProps) {
  const { t } = useTranslation();

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (product?.price != null && price === "") {
        const n = Number(product.price);
        if (!Number.isNaN(n) && Number.isFinite(n)) {
          setPrice((n * 0.9).toFixed(2)); // sugerencia
        }
      }
    } else {
      setSubmitting(false);
      setMessage("");
      setQuantity("");
      setPrice("");
    }
  }, [open, product?.price]);

  const getOrCreateConversation = async () => {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("buyer_id", user!.id)
      .eq("seller_id", product.seller_id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) return existing.id;

    const { data: created, error: insErr } = await supabase
      .from("conversations")
      .insert({ buyer_id: user!.id, seller_id: product.seller_id, product_id: product.id })
      .select("id")
      .single();

    if (insErr) throw insErr;
    return created!.id;
  };

  const handleSubmit = async () => {
    try {
      if (!user) {
        toast({ title: "Inicia sesión", description: "Debes iniciar sesión para hacer una contraoferta", variant: "destructive" });
        return;
      }
      const p = Number(price);
      if (!Number.isFinite(p) || p <= 0) {
        toast({ title: "Precio inválido", description: "Introduce un precio válido", variant: "destructive" });
        return;
      }
      const q = quantity ? Number(quantity) : null;
      if (quantity && (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0)) {
        toast({ title: "Cantidad inválida", description: "Introduce una cantidad válida o deja vacío", variant: "destructive" });
        return;
      }

      setSubmitting(true);
      const conversationId = await getOrCreateConversation();

      // 1) Crear oferta
      const { data: offer, error: offerErr } = await supabase
        .from("offers")
        .insert({
          product_id: product.id,
          conversation_id: conversationId,
          buyer_id: user.id,
          seller_id: product.seller_id,
          offered_price: p,
          quantity: q,
          message: message || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (offerErr) throw offerErr;

      // ❌ Sin mensaje de sistema en el chat
      // ❌ Sin toast de éxito
      onOpenChange(false);

      // 2) Ir al chat (ahora con query param, no con ruta /:id)
      navigate(`/messages?conversation=${conversationId}`);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err?.message || "No se pudo enviar la contraoferta", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('ui.hacer-contraoferta')}</DialogTitle>
          <DialogDescription>
            Producto: <b>{product.title}</b>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label className="text-sm">{t('ui.precio-ofrecido')}</label>
            <Input inputMode="decimal" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Cantidad ({product.unit ?? "unidades"}) (opcional)</label>
            <Input inputMode="decimal" placeholder="Ej: 100" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">{t('ui.mensaje-para-el-vendedor-opcional')}</label>
            <Textarea placeholder="Detalles, condiciones, recogida, etc." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{t('ui.enviar-contraoferta')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}