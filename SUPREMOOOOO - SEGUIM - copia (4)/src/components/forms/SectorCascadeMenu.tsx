import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

/** Generador de sectores traducidos */
const getSectors = (t: (key: string) => string) => ({
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
});

export type SectorCascadeValue = { sector: string; subcategory: string };

type Props = {
  value: SectorCascadeValue;
  onChange: (v: SectorCascadeValue) => void;
  required?: boolean;
  error?: string | null;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

export default function SectorCascadeMenu({
  value,
  onChange,
  required,
  error,
  label,
  placeholder,
  disabled,
}: Props) {
  const { t } = useTranslation();
  const SECTORS = useMemo(() => getSectors(t), [t]);

  const labelText = label ?? t('ui.sector-subcategor-a');
  const placeholderText = placeholder ?? t('ui.selecciona-sector-y-subcategor-a');

  const { sector, subcategory } = value;
  const [open, setOpen] = useState(false);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const sectorsList = useMemo(() => Object.entries(SECTORS), [SECTORS]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const clear = () => onChange({ sector: "", subcategory: "" });

  return (
    <div ref={rootRef} className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <label className="text-sm font-medium">
          {labelText} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className="w-full h-10 px-3 rounded-md border bg-background text-left flex items-center justify-between"
        >
          <span className={sector || subcategory ? "" : "text-muted-foreground"}>
            {sector || subcategory ? (
              <>
                {SECTORS[sector]?.label || "—"}{subcategory ? " / " : ""}
                {subcategory
                  ? Object.values(SECTORS).flatMap((s) => s.subs).find((sub) => sub.value === subcategory)?.label
                  : ""}
              </>
            ) : (
              placeholderText
            )}
          </span>
          <div className="flex items-center gap-2">
            {(sector || subcategory) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clear();
                }}
                className="p-1 rounded hover:bg-muted"
                title={t('ui.limpiar')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg overflow-hidden" role="menu">
            <div className="flex">
              <div className="w-1/2 max-h-72 overflow-auto border-r">
                {sectorsList.map(([key, s]) => {
                  const active = key === hoverKey;
                  const selected = key === sector;
                  return (
                    <button
                      key={key}
                      type="button"
                      onMouseEnter={() => setHoverKey(key)}
                      onFocus={() => setHoverKey(key)}
                      onClick={() => {
                        if (key !== sector) onChange({ sector: key, subcategory: "" });
                        setHoverKey(key);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted/70 ${
                        selected ? "bg-muted" : ""
                      }`}
                    >
                      <span>{s.label}</span>
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    </button>
                  );
                })}
              </div>

              <div className="w-1/2 max-h-72 overflow-auto">
                {hoverKey && SECTORS[hoverKey]?.subs?.length ? (
                  SECTORS[hoverKey].subs.map((sub) => {
                    const selected = subcategory === sub.value;
                    return (
                      <button
                        key={sub.value}
                        type="button"
                        onClick={() => {
                          onChange({ sector: hoverKey, subcategory: sub.value });
                          setOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/70 ${
                          selected ? "bg-muted font-medium" : ""
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">{t('ui.selecciona-un-sector')}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
