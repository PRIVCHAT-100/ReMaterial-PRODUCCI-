import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { requestBrowserLocation, saveCoords, saveDenied } from "@/utils/geo";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecide?: (result: "granted" | "denied" | "error") => void; // para auto-redirect inmediato
}

export default function GeoConsentAfterSignup({ open, onOpenChange, onDecide }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAllow = async () => {
    setError(null);
    setLoading(true);
    try {
      const coords = await requestBrowserLocation();
      saveCoords(coords);
      setLoading(false);
      onDecide?.("granted"); // redirección inmediata desde el padre
      onOpenChange(false);
    } catch (e: any) {
      setLoading(false);
      setError(e?.message ?? "No se pudo obtener tu ubicación");
      // si falla, lo tratamos como denegado suave
      saveDenied();
      onDecide?.("error");
      onOpenChange(false);
    }
  };

  const handleDeny = () => {
    saveDenied();
    onDecide?.("denied"); // redirección inmediata desde el padre
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ver productos cerca de ti
          </DialogTitle>
          <DialogDescription>
            ¿Quieres permitir tu ubicación para activar el filtro por distancia y ordenar productos cercanos?
          </DialogDescription>
        </DialogHeader>

        {error && <div className="text-sm text-destructive mb-2">{error}</div>}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" disabled={loading} onClick={handleDeny}>
            Ahora no
          </Button>
          <Button disabled={loading} onClick={handleAllow}>
            {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Obteniendo…</>) : "Permitir ubicación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
