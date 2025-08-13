import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Sectores → subcategorías (ajusta etiquetas/valores a los que usas al publicar productos)
 */
const SECTORS: Record<
  string,
  { label: string; subs: { value: string; label: string }[] }
> = {
  construccion: {
    label: "Construcción",
    subs: [
      { value: "aridos", label: "Áridos" },
      { value: "ladrillo-ceramica", label: "Ladrillo/Cerámica" },
      { value: "cemento-mortero", label: "Cemento/Mortero" },
      { value: "aislamientos", label: "Aislamientos" },
      { value: "vidrio-obra", label: "Vidrio" },
      { value: "metales-obra", label: "Metales de obra" },
    ],
  },
  textil: {
    label: "Textil",
    subs: [
      { value: "algodon", label: "Algodón" },
      { value: "poliester", label: "Poliéster" },
      { value: "mezclas", label: "Mezclas" },
      { value: "retales", label: "Retales" },
      { value: "hilo-bobinas", label: "Hilo/Bobinas" },
    ],
  },
  madera: {
    label: "Madera",
    subs: [
      { value: "tablones", label: "Tablones" },
      { value: "palets", label: "Palets" },
      { value: "aglomerado", label: "Aglomerado" },
      { value: "contrachapado", label: "Contrachapado" },
      { value: "serrin", label: "Serrín" },
    ],
  },
  metalurgia: {
    label: "Metalurgia",
    subs: [
      { value: "acero", label: "Acero" },
      { value: "aluminio", label: "Aluminio" },
      { value: "cobre", label: "Cobre" },
      { value: "laton", label: "Latón" },
      { value: "inox", label: "Inoxidable" },
    ],
  },
  piedra: {
    label: "Piedra y Mármol",
    subs: [
      { value: "marmol", label: "Mármol" },
      { value: "granito", label: "Granito" },
      { value: "pizarra", label: "Pizarra" },
      { value: "aridos-piedra", label: "Áridos" },
    ],
  },
  otros: {
    label: "Otros",
    subs: [
      { value: "plastico", label: "Plástico" },
      { value: "vidrio", label: "Vidrio" },
      { value: "papel-carton", label: "Papel/Cartón" },
      { value: "electronica", label: "Electrónica" },
      { value: "maquinaria", label: "Maquinaria" },
    ],
  },
};

type Props = {
  selectedSector: string;              // p.ej. "metalurgia" o ""
  selectedSubcategory: string;         // p.ej. "aluminio" o ""
  onSectorChange: (sector: string) => void;
  onSubcategoryChange: (sub: string) => void;
};

export default function SectorCategoriesBar({
  selectedSector,
  selectedSubcategory,
  onSectorChange,
  onSubcategoryChange,
}: Props) {
  // qué sector está abierto (accordion)
  const [openSector, setOpenSector] = useState<string | null>(null);

  const handleSectorClick = (sectorKey: string) => {
    // Selecciona sector (o limpia si repites) y resetea subcategoría
    const next = sectorKey === selectedSector ? "" : sectorKey;
    onSectorChange(next);
    onSubcategoryChange("");
    setOpenSector((prev) => (prev === sectorKey ? null : sectorKey));
  };

  const handleSubClick = (subValue: string) => {
    // Solo cambia estado local (sin URL) → sin “saltos”
    const next = subValue === selectedSubcategory ? "" : subValue;
    onSubcategoryChange(next);
  };

  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="rounded-2xl border border-input bg-background p-4 shadow-sm">
        {/* Fila de sectores (scroll horizontal en móvil) */}
        <div className="overflow-x-auto">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={selectedSector === "" ? "default" : "outline"}
              onClick={() => {
                onSectorChange("");
                onSubcategoryChange("");
                setOpenSector(null);
              }}
              className="whitespace-nowrap"
            >
              Todo
            </Button>

            {Object.entries(SECTORS).map(([key, sector]) => {
              const isActive = selectedSector === key;
              const isOpen = openSector === key;
              return (
                <div key={key} className="relative">
                  <Button
                    type="button"
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => handleSectorClick(key)}
                    className="whitespace-nowrap inline-flex items-center gap-1"
                  >
                    {sector.label}
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Subcategorías del sector abierto */}
                  {isOpen && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {sector.subs.map((sub) => (
                          <Button
                            key={sub.value}
                            type="button"
                            size="sm"
                            variant={
                              selectedSubcategory === sub.value ? "default" : "outline"
                            }
                            onClick={() => handleSubClick(sub.value)}
                            className="whitespace-nowrap"
                          >
                            {sub.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Elige un sector para ver sus subcategorías. Sin recargas ni movimiento del scroll.
        </p>
      </div>
    </div>
  );
}
