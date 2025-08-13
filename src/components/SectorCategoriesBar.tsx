import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

/** Sectores → subcategorías */
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
  selectedSector: string;
  selectedSubcategory: string;
  onSectorChange: (sector: string) => void;
  onSubcategoryChange: (sub: string) => void;
};

export default function SectorCategoriesBar({
  selectedSector,
  selectedSubcategory,
  onSectorChange,
  onSubcategoryChange,
}: Props) {
  const [openSector, setOpenSector] = useState<string | null>(null);

  const handleSectorClick = (sectorKey: string) => {
    const next = sectorKey === selectedSector ? "" : sectorKey;
    onSectorChange(next);
    onSubcategoryChange("");
    setOpenSector((prev) => (prev === sectorKey ? null : sectorKey));
  };

  const handleSubClick = (subValue: string) => {
    const next = subValue === selectedSubcategory ? "" : subValue;
    onSubcategoryChange(next);
  };

  return (
    <div className="container mx-auto px-4">
      {/* Contenedor plano: sin borde, sin radios, padding mínimo */}
      <div className="px-2 py-1">
        <div className="overflow-x-auto">
          <div className="flex gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={selectedSector === "" ? "default" : "outline"}
              onClick={() => {
                onSectorChange("");
                onSubcategoryChange("");
                setOpenSector(null);
              }}
              className="h-8 px-3 text-xs whitespace-nowrap"
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
                    className="h-8 px-3 text-xs whitespace-nowrap inline-flex items-center gap-1"
                  >
                    {sector.label}
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  {isOpen && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {sector.subs.map((sub) => (
                          <Button
                            key={sub.value}
                            type="button"
                            size="sm"
                            variant={
                              selectedSubcategory === sub.value ? "default" : "outline"
                            }
                            onClick={() => handleSubClick(sub.value)}
                            className="h-7 px-2.5 text-xs whitespace-nowrap"
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
        {/* Sin texto ni espacio inferior */}
      </div>
    </div>
  );
}
