import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Grid, List, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUpDown, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import FiltersSidebar, { FiltersState } from "./FiltersSidebar";

interface ProductGridProps {
  selectedCategory: string;
  searchQuery?: string;
  categorySlug?: string; // /c/:cat
  subSlug?: string;      // /c/:cat/:sub
}

interface SellerProfile {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
}

interface Product {
  id: string;
  title: string;
  price: number | string;
  quantity: number;
  unit: string;
  category: string;
  category_slug?: string;
  subcategory_slug?: string;
  subcategory?: string;
  images: string[];
  location: string;
  description: string;
  seller_id: string;
  created_at: string;
  // 🔁 Antes era `profiles`, ahora embebemos como `seller` usando la FK exacta
  seller?: SellerProfile | null;

  // Reserva
  reserved?: boolean;
  reserved_price?: number | null;
}

const SECTOR_TO_CATEGORIES: Record<string, string[]> = {
  construccion: ["aridos", "ladrillo-ceramica", "cemento-mortero", "aislamientos", "vidrio-obra", "metales-obra"],
  textil: ["algodon", "poliester", "mezclas", "retales", "hilo-bobinas"],
  madera: ["tablones", "palets", "aglomerado", "contrachapado", "serrin"],
  metalurgia: ["acero", "aluminio", "cobre", "laton", "inox"],
  piedra: ["marmol", "granito", "pizarra", "aridos-piedra"],
  otros: ["plastico", "vidrio", "papel-carton", "electronica", "maquinaria"],
};

const ProductGrid = ({
  selectedCategory,
  searchQuery = "",
  categorySlug,
  subSlug,
}: ProductGridProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "price-low" | "price-high">("recent");
  const [sortOpen, setSortOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Paginación
  const [pageSize, setPageSize] = useState<number>(12);
  const [page, setPage] = useState<number>(1);

  const [filters, setFilters] = useState<FiltersState>({
    priceMin: "",
    priceMax: "",
    location: "",
    unit: "",
    quantityMin: "",
    quantityMax: "",
    listedWithin: "any",
    withImage: false,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    if (user) fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchQuery]);

  const fetchProducts = async () => {
    try {
      // ⚠️ Desambiguamos el embed de perfiles usando el nombre de la FK por defecto:
      // products_seller_id_fkey (si tu FK tiene otro nombre, cámbialo aquí)
      let query = supabase
        .from("products")
        .select(`
          *,
          seller:profiles!products_seller_id_fkey (
            id,
            first_name,
            last_name,
            company_name
          )
        `)
        .eq("status", "active");

      if (searchQuery && searchQuery.trim()) {
        query = query.textSearch("search_vector", searchQuery.trim(), {
          type: "websearch",
          config: "spanish",
        });
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      toast({
        title: "Error",
        description:
          err?.message?.includes("relationship")
            ? "Hay varias relaciones entre products y profiles. Ya lo hemos desambiguado para el vendedor. Si tu FK tiene otro nombre, avísame y lo ajusto."
            : "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);
      if (error) throw error;
      setFavorites(data?.map((f: any) => f.product_id) || []);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive",
      });
      return;
    }
    const isFav = favorites.includes(productId);
    try {
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) throw error;
        setFavorites((prev) => prev.filter((id) => id !== productId));
        toast({ title: "Eliminado de favoritos", description: "Se quitó de tus favoritos" });
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        setFavorites((prev) => [...prev, productId]);
        toast({ title: "Añadido a favoritos", description: "Se guardó en tus favoritos" });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast({ title: "Error", description: "No se pudo actualizar favoritos", variant: "destructive" });
    }
  };

  const units = useMemo(() => Array.from(new Set(products.map((p) => p.unit).filter(Boolean))), [products]);

  const nPrice = (p: Product) => {
    const v = p.price as any;
    const num = typeof v === "number" ? v : Number(v);
    return Number.isFinite(num) ? num : 0;
  };

  const sortLabel = useMemo(() => {
    switch (sortBy) {
      case "price-low":
        return "Precio: menor a mayor";
      case "price-high":
        return "Precio: mayor a menor";
      default:
        return "Más recientes";
    }
  }, [sortBy]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      const legacyMap: Record<string, string> = {
        construction: "construccion",
        textile: "textil",
        metal: "metalurgia",
        wood: "madera",
        decoration: "decoracion",
        plastic: "plastico",
        electronics: "electronica",
      };

      const normalized = (legacyMap[selectedCategory] || selectedCategory || "")
        .toLowerCase()
        .trim();

      if (normalized) {
        const sectorSubcats = SECTOR_TO_CATEGORIES[normalized];
        if (sectorSubcats && sectorSubcats.length) {
          filtered = filtered.filter((p) => {
            const cat = (p.category || "").toLowerCase();
            const sslug = (p.subcategory_slug || "").toLowerCase();
            return sectorSubcats.includes(cat) || sectorSubcats.includes(sslug);
          });
        } else {
          filtered = filtered.filter((p) => {
            const cat = (p.category || "").toLowerCase();
            const sslug = (p.subcategory_slug || "").toLowerCase();
            return cat === normalized || sslug === normalized;
          });
        }
      }
    }

    if (categorySlug) {
      const catSlug = categorySlug.toLowerCase();
      filtered = filtered.filter(
        (p) => (p.category_slug || p.category || "").toLowerCase() === catSlug
      );
    }
    if (subSlug) {
      const sSlug = subSlug.toLowerCase();
      filtered = filtered.filter(
        (p) => (p.subcategory_slug || p.subcategory || "").toLowerCase() === sSlug
      );
    }

    const priceMin = filters.priceMin ? Number(filters.priceMin) : null;
    const priceMax = filters.priceMax ? Number(filters.priceMax) : null;
    const qtyMin = filters.quantityMin ? Number(filters.quantityMin) : null;
    const qtyMax = filters.quantityMax ? Number(filters.quantityMax) : null;
    const now = new Date();

    filtered = filtered.filter((p) => {
      const price = nPrice(p);
      if (priceMin !== null && price < priceMin) return false;
      if (priceMax !== null && price > priceMax) return false;
      if (filters.location.trim() && !p.location?.toLowerCase().includes(filters.location.toLowerCase()))
        return false;
      if (filters.unit && p.unit !== filters.unit) return false;
      if (qtyMin !== null && (p.quantity ?? 0) < qtyMin) return false;
      if (qtyMax !== null && (p.quantity ?? 0) > qtyMax) return false;

      if (filters.listedWithin !== "any") {
        const days = Number(filters.listedWithin);
        const since = new Date(now);
        since.setDate(since.getDate() - days);
        const created = new Date(p.created_at);
        if (created < since) return false;
      }

      if (filters.withImage && !p.images?.[0]) return false;

      return true;
    });

    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => nPrice(a) - nPrice(b));
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => nPrice(b) - nPrice(a));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy, filters, categorySlug, subSlug]);

  useEffect(() => setPage(1), [selectedCategory, searchQuery, sortBy, filters, categorySlug, subSlug]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const pageItems = filteredProducts.slice(startIndex, endIndex);

  const resultsText = loading
    ? "Cargando..."
    : `Mostrando ${filteredProducts.length === 0 ? 0 : startIndex + 1}–${endIndex} de ${filteredProducts.length}`;

  const clearFilters = () =>
    setFilters({
      priceMin: "",
      priceMax: "",
      location: "",
      unit: "",
      quantityMin: "",
      quantityMax: "",
      listedWithin: "any",
      withImage: false,
    });

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Cabecera sección */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Materiales disponibles</h2>
            <p className="text-muted-foreground">{resultsText}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtros móvil */}
            <Button variant="outline" className="sm:hidden" onClick={() => setShowFiltersMobile((s) => !s)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>

            {/* Mostrar 12 / 18 / 24 */}
            <div className="hidden sm:inline-flex border border-border rounded-md overflow-hidden">
              {[12, 18, 24].map((n) => (
                <Button
                  key={n}
                  variant={pageSize === n ? "default" : "ghost"}
                  size="sm"
                  className={n === 12 ? "rounded-r-none" : n === 18 ? "rounded-none" : "rounded-l-none"}
                  onClick={() => {
                    setPageSize(n);
                    setPage(1);
                  }}
                  aria-pressed={pageSize === n}
                >
                  {n}
                </Button>
              ))}
            </div>

            {/* Orden */}
            <div className="relative">
              <Button
                variant="outline"
                className="min-w-[200px] justify-between"
                onClick={() => setSortOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={sortOpen}
              >
                Ordenar: {sortLabel}
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
              </Button>

              {sortOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-md z-50"
                >
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center"
                    onClick={() => {
                      setSortBy("recent");
                      setSortOpen(false);
                    }}
                  >
                    {sortBy === "recent" && <Check className="mr-2 h-4 w-4" />} Más recientes
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center"
                    onClick={() => {
                      setSortBy("price-low");
                      setSortOpen(false);
                    }}
                  >
                    {sortBy === "price-low" && <Check className="mr-2 h-4 w-4" />} Precio: menor a mayor
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-muted flex items-center"
                    onClick={() => {
                      setSortBy("price-high");
                      setSortOpen(false);
                    }}
                  >
                    {sortBy === "price-high" && <Check className="mr-2 h-4 w-4" />} Precio: mayor a menor
                  </button>
                </div>
              )}
            </div>

            {/* Vista grid/list */}
            <div className="hidden sm:flex border border-border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Layout con sidebar */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar en desktop / toggle en móvil */}
          <div className={`${showFiltersMobile ? "" : "hidden"} sm:block`}>
            <FiltersSidebar
              filters={filters}
              onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
              onClear={clearFilters}
              units={units}
              onApply={() => setShowFiltersMobile(false)}
            />
          </div>

          {/* Contenido */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-36 bg-muted rounded-lg mb-3"></div>
                    <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : pageItems.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground text-lg">
                  {searchQuery ? "No se encontraron productos con esa búsqueda" : "No hay productos disponibles"}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => navigate({ pathname: "/", search: "" })}>
                    Ver todos los productos
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" : "space-y-3"}>
                  {pageItems.map((product) => (
                    <div key={product.id} className="relative">
                      {/* 🟧 Overlay RESERVADO bien visible */}
                      {product.reserved && (
                        <div className="absolute left-0 top-0 z-10">
                          <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-br-xl">
                            RESERVADO
                          </div>
                        </div>
                      )}

                      <ProductCard
                        id={product.id}
                        title={product.title}
                        price={`€${nPrice(product)}`}
                        location={product.location || "No especificada"}
                        image={product.images?.[0] || ""}
                        category={product.category}
                        seller={{
                          id: product.seller?.id || "",
                          name:
                            product.seller?.company_name ||
                            `${product.seller?.first_name || ""} ${product.seller?.last_name || ""}`.trim() ||
                            "Usuario",
                          rating: 4.5,
                          verified: true,
                        }}
                        description={product.description || ""}
                        isFavorite={favorites.includes(product.id)}
                        onToggleFavorite={() => toggleFavorite(product.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
                  <div className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <Button
                        key={n}
                        variant={n === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(n)}
                        className="min-w-9"
                      >
                        {n}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
