import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ReserveOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReserve: (quantity: number, price?: number) => void;
  availableQuantity: number;
  agreedPrice?: number; // Hacerlo opcional
}

export default function ReserveOfferModal({
  isOpen,
  onClose,
  onReserve,
  availableQuantity,
  agreedPrice
}: ReserveOfferModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | "">(agreedPrice || "");

  const handleReserve = () => {
    onReserve(quantity, price === "" ? undefined : price);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>📦 Reservar Producto</DialogTitle>
          <DialogDescription>
            Confirma la reserva de este producto. El comprador verá que está reservado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Cantidad a reservar</label>
            <Input
              type="number"
              min="1"
              max={availableQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(availableQuantity, Number(e.target.value))))}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Disponible: {availableQuantity} unidades
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium">Precio de reserva (opcional)</label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1"
              placeholder={agreedPrice ? agreedPrice.toFixed(2) : "0.00"}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {agreedPrice ? `Precio acordado: ${agreedPrice.toFixed(2)} €` : "Sin precio acordado"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleReserve}>
            Confirmar Reserva
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}