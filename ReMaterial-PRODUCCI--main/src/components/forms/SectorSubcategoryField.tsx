import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Sectores → subcategorías (ajústalo cuando quieras) */
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

export type SectorSubcategoryValue = {
  sector: string;       // p.ej. "metalurgia"
  subcategory: string;  // p.ej. "aluminio"
};

type Props = {
  value: SectorSubcategoryValue;
  onChange: (next: SectorSubcategoryValue) => void;
  required?: boolean;
  error?: string | null;
};

export default function SectorSubcategoryField({
  value,
  onChange,
  required,
  error,
}: Props) {
  const { t } = useTranslation();

  const { sector, subcategory } = value;
  const [openKey, setOpenKey] = useState<string | null>(sector || null);
  const sectorsList = useMemo(() => Object.entries(SECTORS), []);

  const setSector = (s: string) => {
    const next = s === sector ? "" : s;
    onChange({ sector: next, subcategory: "" });
    setOpenKey(next || null);
  };

  const setSub = (sub: string) => {
    const next = sub === subcategory ? "" : sub;
    onChange({ sector, subcategory: next });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          Sector → Subcategoría {required && <span className="text-red-500">*</span>}
        </label>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setSector("")}
            className={`h-8 px-3 text-xs rounded-md border ${sector === "" ? "bg-primary text-primary-foreground" : "bg-background"}`}
          >
            Todo
          </button>

          {sectorsList.map(([key, s]) => {
            const isActive = sector === key;
            const isOpen = openKey === key;
            return (
              <div key={key} className="relative">
                <button
                  type="button"
                  onClick={() => setSector(key)}
                  className={`h-8 px-3 text-xs rounded-md border inline-flex items-center gap-1 ${isActive ? "bg-primary text-primary-foreground" : "bg-background"}`}
                >
                  {s.label}
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>

                {isOpen && s.subs.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {s.subs.map((sub) => (
                        <button
                          key={sub.value}
                          type="button"
                          onClick={() => setSub(sub.value)}
                          className={`h-7 px-2.5 text-xs rounded-md border ${subcategory === sub.value ? "bg-primary text-primary-foreground" : "bg-background"}`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}