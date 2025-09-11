import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Mode = "producto" | "sector";

type ExploreCategoriesBarProps = {
  selectedCategory: string;
  mode: Mode;
  onCategoryChange: (value: string) => void;
  onModeChange: (value: Mode) => void;
};

// Sectores (los mismos que pueden escoger las empresas)
const SECTOR_OPTIONS = [
  { value: "construccion", label: t('ui.construcci-n') },
  { value: "textil", label: "Textil" },
  { value: "madera", label: t('ui.madera') },
  { value: "metalurgia", label: "Metalurgia" },
  { value: "piedra", label: t('ui.piedra-y-m-rmol') },
  { value: "otros", label: t('ui.otros') },
];

// Categorías de producto (ajústalas a las que usas al publicar productos)
const PRODUCT_CATEGORY_OPTIONS = [
  { value: "metal", label: "Metal" },
  { value: "madera", label: t('ui.madera') },
  { value: "plastico", label: t('ui.pl-stico') },
  { value: "piedra", label: t('ui.piedra') },
  { value: "textil", label: "Textil" },
  { value: "vidrio", label: t('ui.vidrio') },
  { value: "papel-carton", label: t('ui.papel-cart-n') },
  { value: "electronica", label: t('ui.electr-nica') },
  { value: "maquinaria", label: t('ui.maquinaria') },
  { value: "palets", label: t('ui.palets') },
  { value: "otros", label: t('ui.otros') },
];

export default function ExploreCategoriesBar({
  selectedCategory,
  mode,
  onCategoryChange,
  onModeChange,
}: ExploreCategoriesBarProps) {
  const { t } = useTranslation();

  const [localMode, setLocalMode] = useState<Mode>(mode);

  const options = localMode === "sector" ? SECTOR_OPTIONS : PRODUCT_CATEGORY_OPTIONS;

  // Evitamos navegar/recargar/scroll: solo cambiamos estado
  const handleCategory = (value: string) => {
    onCategoryChange(value);
  };

  const handleMode = (value: Mode) => {
    setLocalMode(value);
    onModeChange(value);
    // Al cambiar de modo, reseteamos categoría para no cruzar valores incoherentes
    onCategoryChange("");
  };

  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="rounded-2xl border border-input bg-background p-4 shadow-sm">
        {/* Toggle de modo (Producto / Sector) */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <span className="text-muted-foreground">Filtrar por:</span>
          <div className="inline-flex rounded-md border bg-muted/40 p-1">
            <Button
              type="button"
              size="sm"
              variant={localMode === "producto" ? "default" : "ghost"}
              className="rounded-md"
              onClick={() => handleMode("producto")}
            >
              Producto
            </Button>
            <Button
              type="button"
              size="sm"
              variant={localMode === "sector" ? "default" : "ghost"}
              className="rounded-md"
              onClick={() => handleMode("sector")}
            >
              Sector
            </Button>
          </div>
        </div>

        {/* Chips de categorías (scroll horizontal en mobile) */}
        <div className="overflow-x-auto">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => handleCategory("")}
              className="whitespace-nowrap"
            >
              Todo
            </Button>
            {options.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={selectedCategory === opt.value ? "default" : "outline"}
                onClick={() => handleCategory(opt.value)}
                className="whitespace-nowrap"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Nota pequeña */}
        <p className="mt-2 text-xs text-muted-foreground">
          Elige “Producto” para filtrar por tipo de material, o “Sector” para los sectores que las
          empresas declaran en su perfil. Sin recargas ni saltos.
        </p>
      </div>
    </div>
  );
}