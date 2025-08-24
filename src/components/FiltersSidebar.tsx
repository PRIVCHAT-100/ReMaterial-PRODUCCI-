import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

/**
 * Filtro lateral con fallbacks con acentos.
 * Evita mostrar claves o placeholders sin acentos cuando falte la traducción.
 */
export type FiltersState = {
  priceMin: string;
  priceMax: string;
  location: string;
  unit: string;
  quantityMin: string;
  quantityMax: string;
  distanceKm?: string; // filtro por distancia (km). "" o undefined = sin límite
  listedWithin: "any" | "7" | "30" | "90";
  withImage: boolean;
  shippingAvailable: boolean;
};

interface FiltersSidebarProps {
  filters: FiltersState;
  onChange: (next: Partial<FiltersState>) => void;
  onClear: () => void;
  units?: string[];
  onApply?: () => void; // opcional
}

export default function FiltersSidebar({
  filters,
  onChange,
  onClear,
  units = [],
  onApply,
}: FiltersSidebarProps) {
  const { t } = useTranslation();

  // Helper local: usa t(key), pero si devuelve la key o el placeholder "bonito" sin acentos, usa el fallback.
  const tx = (key: string, fallback: string) => {
    const v = t(key) as string;
    if (!v) return fallback;
    if (v === key) return fallback;
    const last = key.split('.').pop() || key;
    const cleaned = last.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    if (v === cleaned) return fallback;
    return v;
  };

  return (
    <aside className="bg-muted/30 border border-border rounded-xl p-4 lg:p-5 space-y-6 sticky top-24 h-fit">
      <div>
        <h3 className="text-base font-semibold">{tx('ui.filtros', 'Filtros')}</h3>
        <p className="text-xs text-muted-foreground">{tx('ui.refina-tu-busqueda', 'Refina tu búsqueda')}</p>
      </div>

      {/* Precio */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium">{tx('ui.precio', 'Precio')}</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={tx('ui.min', 'Mín')}
            value={filters.priceMin}
            onChange={(e) => onChange({ priceMin: e.target.value })}
            className="h-9 px-3 rounded-md border bg-background"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={tx('ui.max', 'Máx')}
            value={filters.priceMax}
            onChange={(e) => onChange({ priceMax: e.target.value })}
            className="h-9 px-3 rounded-md border bg-background"
          />
        </div>
      </section>

      {/* Ubicación */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium">{tx('ui.ubicacion', 'Ubicación')}</h4>
        <input
          type="text"
          placeholder={tx('ui.provincia-ciudad', 'Provincia / Ciudad')}
          value={filters.location}
          onChange={(e) => onChange({ location: e.target.value })}
          className="h-9 px-3 w-full rounded-md border bg-background"
        />
      </section>

      {/* Unidad */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium">{tx('ui.unidad', 'Unidad')}</h4>
        <select
          value={filters.unit}
          onChange={(e) => onChange({ unit: e.target.value })}
          className="h-9 px-3 w-full rounded-md border bg-background"
        >
          <option value="">{tx('ui.cualquiera', 'Cualquiera')}</option>
          {Array.from(new Set(units.filter(Boolean))).map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </section>

      {/* Cantidad */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium">{tx('ui.cantidad', 'Cantidad')}</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={tx('ui.min', 'Mín')}
            value={filters.quantityMin}
            onChange={(e) => onChange({ quantityMin: e.target.value })}
            className="h-9 px-3 rounded-md border bg-background"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={tx('ui.max', 'Máx')}
            value={filters.quantityMax}
            onChange={(e) => onChange({ quantityMax: e.target.value })}
            className="h-9 px-3 rounded-md border bg-background"
          />
        </div>
      </section>

      {/* Distancia (intervalos predefinidos) */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium">{tx('ui.distancia', 'Distancia')}</h4>
        <select
          value={filters.distanceKm ?? ""}
          onChange={(e) => onChange({ distanceKm: e.target.value })}
          className="h-9 px-3 w-full rounded-md border bg-background"
          aria-label={tx('ui.filtrar-por-distancia', 'Filtrar por distancia en kilómetros')}
          title={tx('ui.distancia-maxima', 'Distancia máxima desde tu ubicación (km)')}
        >
          <option value="">{tx('ui.sin_limite', 'Sin límite')}</option>
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="25">25 km</option>
          <option value="50">50 km</option>
          <option value="100">100 km</option>
          <option value="200">200 km</option>
        </select>
        <p className="text-xs text-muted-foreground">
          {tx('ui.usamos-tu-ubicacion', 'Usamos tu ubicación si diste permiso tras registrarte.')}
        </p>
      </section>

      {/* Fecha de publicación */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium">{tx('ui.fecha', 'Fecha')}</h4>
        <select
          value={filters.listedWithin}
          onChange={(e) =>
            onChange({ listedWithin: e.target.value as FiltersState["listedWithin"] })
          }
          className="h-9 px-3 w-full rounded-md border bg-background"
        >
          <option value="any">{tx('ui.cualquiera', 'Cualquiera')}</option>
          <option value="7">{tx('ui.ultimos_7_dias', 'Últimos 7 días')}</option>
          <option value="30">{tx('ui.ultimos_30_dias', 'Últimos 30 días')}</option>
          <option value="90">{tx('ui.ultimos_90_dias', 'Últimos 90 días')}</option>
        </select>
      </section>

      {/* Extras */}
      <section className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.withImage}
            onChange={(e) => onChange({ withImage: e.target.checked })}
            className="h-4 w-4"
          />
          {tx('ui.solo-con-imagen', 'Solo con imagen')}
        </label>
      </section>

      {/* Disponible para envíos */}
      <section className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.shippingAvailable}
            onChange={(e) => onChange({ shippingAvailable: e.target.checked })}
            className="h-4 w-4"
          />
          {tx('ui.disponible-para-envios', 'Disponible para envíos')}
        </label>
      </section>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClear}>{tx('ui.limpiar', 'Limpiar')}</Button>
        <Button className="flex-1" onClick={onApply}>{tx('ui.aplicar', 'Aplicar')}</Button>
      </div>
    </aside>
  );
}
