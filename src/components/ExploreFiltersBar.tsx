import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

type Mode = "producto" | "sector";

type ExploreFiltersBarProps = {
  searchQuery: string;
  selectedCategory: string;      // único valor que mandamos a ProductGrid
  mode: Mode;                    // decide si mostramos categorías de producto o sectores
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onModeChange: (value: Mode) => void;
};

const SECTOR_OPTIONS = [
  { value: "construccion", label: "Construcción" },
  { value: "textil", label: "Textil" },
  { value: "madera", label: "Madera" },
  { value: "metalurgia", label: "Metalurgia" },
  { value: "piedra", label: "Piedra y Mármol" },
  { value: "otros", label: "Otros" },
];

// Nota: estas categorías de producto son un punto de partida seguro.
// Si tus productos usan otros nombres internos, no pasa nada:
// ProductGrid solo recibe "selectedCategory" como antes.
const PRODUCT_CATEGORY_OPTIONS = [
  { value: "metal", label: "Metal" },
  { value: "madera", label: "Madera" },
  { value: "plastico", label: "Plástico" },
  { value: "piedra", label: "Piedra" },
  { value: "textil", label: "Textil" },
  { value: "vidrio", label: "Vidrio" },
  { value: "papel-carton", label: "Papel/Cartón" },
  { value: "electronica", label: "Electrónica" },
  { value: "maquinaria", label: "Maquinaria" },
  { value: "palets", label: "Palets" },
  { value: "otros", label: "Otros" },
];

export default function ExploreFiltersBar({
  searchQuery,
  selectedCategory,
  mode,
  onSearchChange,
  onCategoryChange,
  onModeChange,
}: ExploreFiltersBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Sin recarga: sincronizamos URL con el estado (shareable, back/forward funcionan)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (searchQuery) params.set("search", searchQuery);
    else params.delete("search");

    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");

    params.set("mode", mode);

    // Evita navegación adicional si no hay cambios
    const newSearch = params.toString();
    const currentSearch = location.search.startsWith("?")
      ? location.search.slice(1)
      : location.search;

    if (newSearch !== currentSearch) {
      navigate({ search: `?${newSearch}` }, { replace: true });
    }
  }, [searchQuery, selectedCategory, mode, navigate, location.search]);

  const options = useMemo(
    () => (mode === "sector" ? SECTOR_OPTIONS : PRODUCT_CATEGORY_OPTIONS),
    [mode]
  );

  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="rounded-2xl border border-input bg-background p-4 shadow-sm">
        {/* Modo de categorías */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <span className="text-muted-foreground">Filtrar por:</span>
          <div className="inline-flex rounded-md border bg-muted/40 p-1">
            <Button
              size="sm"
              variant={mode === "producto" ? "default" : "ghost"}
              className="rounded-md"
              onClick={() => onModeChange("producto")}
            >
              Producto
            </Button>
            <Button
              size="sm"
              variant={mode === "sector" ? "default" : "ghost"}
              className="rounded-md"
              onClick={() => onModeChange("sector")}
            >
              Sector
            </Button>
          </div>
        </div>

        {/* Buscador */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, material, ubicación..."
              className="pl-10"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Chips de categorías (scroll horizontal en mobile) */}
          <div className="overflow-x-auto">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => onCategoryChange("")}
                className="whitespace-nowrap"
              >
                Todo
              </Button>
              {options.map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={selectedCategory === opt.value ? "default" : "outline"}
                  onClick={() => onCategoryChange(opt.value)}
                  className="whitespace-nowrap"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Hint pequeño */}
        <p className="mt-2 text-xs text-muted-foreground">
          Selecciona “Producto” para filtrar por tipo de material; “Sector” usa los sectores que las
          empresas declaran en su perfil.
        </p>
      </div>
    </div>
  );
}
