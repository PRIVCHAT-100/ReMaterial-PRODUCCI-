import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Sectores → subcategorías (ajusta los valores a tu modelo) */
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

export type SectorCascadeValue = { sector: string; subcategory: string };

type Props = {
  value: SectorCascadeValue;                  // { sector, subcategory }
  onChange: (v: SectorCascadeValue) => void;  // callback al seleccionar
  required?: boolean;
  error?: string | null;
  label?: string;                             // "Sector / Subcategoría"
  placeholder?: string;                       // "Selecciona…"
  disabled?: boolean;
};

export default function SectorCascadeMenu({
  value,
  onChange,
  required,
  error,
  label = "Sector / Subcategoría",
  placeholder = "Selecciona sector y subcategoría",
  disabled,
}: Props) {
  const { sector, subcategory } = value;
  const [open, setOpen] = useState(false);
  const [hoverKey, setHoverKey] = useState<string | null>(sector || null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const sectorsList = useMemo(() => Object.entries(SECTORS), []);

  // Cerrar al hacer click fuera o ESC
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

  const selectedLabel =
    (sector && SECTORS[sector]?.label) || "" +
    (subcategory ? ` / ${Object.values(SECTORS).flatMap(s => s.subs).find(s => s.value === subcategory)?.label ?? ""}` : "");

  const clear = () => onChange({ sector: "", subcategory: "" });

  return (
    <div ref={rootRef} className="w-full">
      {/* Etiqueta + error */}
      <div className="flex items-center gap-2 mb-1">
        <label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      {/* Trigger como input */}
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
                  ? Object.values(SECTORS)
                      .flatMap((s) => s.subs)
                      .find((sub) => sub.value === subcategory)?.label
                  : ""}
              </>
            ) : (
              placeholder
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
                aria-label="Limpiar selección"
                title="Limpiar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
        </button>

        {/* PANEL desplegable */}
        {open && (
          <div
            className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg overflow-hidden"
            role="menu"
          >
            <div className="flex">
              {/* Columna izquierda: sectores (vertical) */}
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
                        // Solo marca sector; NO cierra ni selecciona subcat todavía
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

              {/* Columna derecha: subcategorías del sector activo (vertical) */}
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
                          setOpen(false); // cerrar al elegir
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
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Selecciona un sector…
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
