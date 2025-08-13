import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

/** Sectores → subcategorías (ajusta etiquetas/valores si lo necesitas) */
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

/**
 * Mega-menú por sectores:
 * - Hover o focus en un sector → muestra panel superpuesto con subcategorías.
 * - Click en subcategoría → selecciona y cierra.
 * - No toca la URL ni produce saltos.
 */
export default function SectorMegaMenu({
  selectedSector,
  selectedSubcategory,
  onSectorChange,
  onSubcategoryChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [panelLeft, setPanelLeft] = useState<number>(0);
  const [panelWidth, setPanelWidth] = useState<number>(320);

  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const sectorsList = useMemo(() => Object.entries(SECTORS), []);

  const clearTimers = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const onEnterSector = (key: string, target: HTMLElement) => {
    clearTimers();
    openTimer.current = window.setTimeout(() => {
      // Calcular posición del panel relativa al contenedor (centrado)
      const cont = containerRef.current?.getBoundingClientRect();
      const btn = target.getBoundingClientRect();
      if (cont) {
        const idealLeft = btn.left - cont.left; // alinear inicio con el botón
        const contWidth = cont.width;
        const clamped = Math.max(
          0,
          Math.min(idealLeft, contWidth - panelWidth)
        );
        setPanelLeft(clamped);
      } else {
        setPanelLeft(0);
      }
      setOpenKey(key);
      // opcional: actualizar sector seleccionado en estado (no filtra aún)
      onSectorChange(key);
    }, 120); // pequeña intención de hover
  };

  const onLeaveBar = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => {
      setOpenKey(null);
    }, 180);
  };

  const onEnterPanel = () => {
    clearTimers();
  };

  const onLeavePanel = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => {
      setOpenKey(null);
    }, 150);
  };

  // Medir ancho del panel para clamping (se recalcula onResize)
  const panelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const measure = () => {
      const w = panelRef.current?.offsetWidth || 320;
      setPanelWidth(w);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className="container mx-auto px-4 relative" ref={containerRef}>
      {/* Barra horizontal compacta */}
      <div
        className="overflow-x-auto"
        onMouseLeave={onLeaveBar}
      >
        <div className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={selectedSector === "" ? "default" : "outline"}
            onMouseEnter={(e) => onEnterSector("", e.currentTarget)}
            onFocus={(e) => onEnterSector("", e.currentTarget)}
            onClick={() => {
              onSectorChange("");
              onSubcategoryChange("");
              setOpenKey(null);
            }}
            className="h-8 px-3 text-xs whitespace-nowrap"
          >
            Todo
          </Button>

          {sectorsList.map(([key, s]) => {
            const isActive = selectedSector === key;
            return (
              <button
                key={key}
                type="button"
                onMouseEnter={(e) => onEnterSector(key, e.currentTarget)}
                onFocus={(e) => onEnterSector(key, e.currentTarget)}
                className={`h-8 px-3 text-xs rounded-md border whitespace-nowrap inline-flex items-center gap-1 ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-background"
                }`}
              >
                {s.label}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel flotante de subcategorías (overlay) */}
      {openKey && SECTORS[openKey]?.subs?.length > 0 && (
        <div
          ref={panelRef}
          onMouseEnter={onEnterPanel}
          onMouseLeave={onLeavePanel}
          className="absolute top-full mt-2 rounded-md border bg-white shadow-lg p-3"
          style={{ left: panelLeft, minWidth: 280 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {SECTORS[openKey].subs.map((sub) => (
              <Button
                key={sub.value}
                type="button"
                size="sm"
                variant={
                  selectedSubcategory === sub.value ? "default" : "outline"
                }
                className="h-8 px-3 text-xs justify-start"
                onClick={() => {
                  onSubcategoryChange(sub.value);
                  setOpenKey(null); // cerrar panel al seleccionar
                }}
              >
                {sub.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
