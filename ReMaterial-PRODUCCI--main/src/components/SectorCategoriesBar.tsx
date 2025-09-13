import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Sectores → subcategorías */
const SECTORS: Record<
  string,
  { label: string; subs: { value: string; label: string }[] }
> = {
  construccion: {
    label: t('ui.construcci-n'),
    subs: [
      { value: "aridos", label: t('ui.ridos') },
      { value: "ladrillo-ceramica", label: t('ui.ladrillo-cer-mica') },
      { value: "cemento-mortero", label: "Cemento/Mortero" },
      { value: "aislamientos", label: "Aislamientos" },
      { value: "vidrio-obra", label: t('ui.vidrio') },
      { value: "metales-obra", label: "Metales de obra" },
    ],
  },
  textil: {
    label: "Textil",
    subs: [
      { value: "algodon", label: t('ui.algod-n') },
      { value: "poliester", label: t('ui.poli-ster') },
      { value: "mezclas", label: "Mezclas" },
      { value: "retales", label: "Retales" },
      { value: "hilo-bobinas", label: "Hilo/Bobinas" },
    ],
  },
  madera: {
    label: t('ui.madera'),
    subs: [
      { value: "tablones", label: "Tablones" },
      { value: "palets", label: t('ui.palets') },
      { value: "aglomerado", label: "Aglomerado" },
      { value: "contrachapado", label: "Contrachapado" },
      { value: "serrin", label: t('ui.serr-n') },
    ],
  },
  metalurgia: {
    label: "Metalurgia",
    subs: [
      { value: "acero", label: "Acero" },
      { value: "aluminio", label: "Aluminio" },
      { value: "cobre", label: "Cobre" },
      { value: "laton", label: t('ui.lat-n') },
      { value: "inox", label: "Inoxidable" },
    ],
  },
  piedra: {
    label: t('ui.piedra-y-m-rmol'),
    subs: [
      { value: "marmol", label: t('ui.m-rmol') },
      { value: "granito", label: "Granito" },
      { value: "pizarra", label: "Pizarra" },
      { value: "aridos-piedra", label: t('ui.ridos') },
    ],
  },
  otros: {
    label: t('ui.otros'),
    subs: [
      { value: "plastico", label: t('ui.pl-stico') },
      { value: "vidrio", label: t('ui.vidrio') },
      { value: "papel-carton", label: t('ui.papel-cart-n') },
      { value: "electronica", label: t('ui.electr-nica') },
      { value: "maquinaria", label: t('ui.maquinaria') },
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
  const { t } = useTranslation();

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