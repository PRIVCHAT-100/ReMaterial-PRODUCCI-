import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export type FiltersState = {
  priceMin: string;
  priceMax: string;
  location: string;
  unit: string;
  quantityMin: string;
  quantityMax: string;
  listedWithin: "any" | "7" | "30" | "90";
  withImage: boolean;
  shippingAvailable: boolean;
};

interface FiltersSidebarProps {
  filters: FiltersState;
  onChange: (next: Partial<FiltersState>) => void;
  onClear: () => void;
  units?: string[];
  onApply?: () => void; // opcional, por si quieres “aplicar”
}

export default function FiltersSidebar({
  filters,
  onChange,
  onClear,
  units = [],
  onApply,
}: FiltersSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="bg-muted/30 border border-border rounded-xl p-4 lg:p-5 space-y-6 sticky top-24 h-fit">
      <div>
        <h3 className="text-base font-semibold">{t('ui.filtros')}</h3>
        <p className="text-xs text-muted-foreground">{t('ui.refina-tu-b-squeda')}</p>
      </div>{t('ui.precio')}<section className="space-y-3">
        <h4 className="text-sm font-medium">{t('ui.precio')}</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={t('ui.m-n')}
            value={filters.priceMin}
            onChange={(e) => onChange({ priceMin: e.target.value })}
            className="h-9 px-3 rounded-md border bg-background"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={t('ui.m-x')}
            value={filters.priceMax}
            onChange={(e) => onChange({ priceMax: e.target.value })}
            className="h-9 px-3 rounded-md border bg-background"
          />
        </div>
      </section>{t('ui.ubicaci-n')}<section className="space-y-3">
        <h4 className="text-sm font-medium">{t('ui.ubicaci-n')}</h4>
        <input
          type="text"
          placeholder={t('ui.provincia-ciudad')}
          value={filters.location}
          onChange={(e) => onChange({ location: e.target.value })}
          className="h-9 px-3 w-full rounded-md border bg-background"
        />
      </section>

      {/* Unidad */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium">Unidad</h4>
        <select
          value={filters.unit}
          onChange={(e) => onChange({ unit: e.target.value })}
          className="h-9 px-3 w-full rounded-md border bg-background"
        >
          <option value="">Cualquiera</option>
          {Array.from(new Set(units.filter(Boolean))).map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </section>

      {/* Cantidad */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium">Cantidad</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={t('ui.m-n')}
            value={filters.quantityMin}
            onChange={(e) => onChange({ quantityMin: e.target.value })}
            className="h-9 px-3 rounded-md border bg-background"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={t('ui.m-x')}
            value={filters.quantityMax}
            onChange={(e) => onChange({ quantityMax: e.target.value })}
            className="h-9 px-3 rounded-md border bg-background"
          />
        </div>
      </section>

      {/* Fecha de publicación */}
      <section className="space-y-3">
        <h4 className="text-sm font-medium">Fecha</h4>
        <select
          value={filters.listedWithin}
          onChange={(e) =>
            onChange({ listedWithin: e.target.value as FiltersState["listedWithin"] })
          }
          className="h-9 px-3 w-full rounded-md border bg-background"
        >
          <option value="any">Cualquiera</option>
          <option value="7">{t('ui.ltimos-7-d-as')}</option>
          <option value="30">{t('ui.ltimos-30-d-as')}</option>
          <option value="90">{t('ui.ltimos-90-d-as')}</option>
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
          Solo con imagen
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
          Disponible para envíos
        </label>
      </section>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClear}>{t('ui.limpiar')}</Button>
        <Button className="flex-1" onClick={onApply}>{t('ui.aplicar')}</Button>
      </div>
    </aside>
  );
}
