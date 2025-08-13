// src/pages/Index.tsx
import { useLocation } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import BannerHero from "@/components/BannerHero";
import SectorCategoriesBar from "@/components/SectorCategoriesBar";

/**
 * Banners del Hero (fijos y seguros)
 */
const HERO_BANNERS = [
  {
    id: "b1",
    image:
      "https://images.unsplash.com/photo-1581091014534-6c6821cc0f51?q=80&w=1600&auto=format&fit=crop",
    href: "/explore?tag=metal",
    label: "Patrocinado: Metal reciclado",
    alt: "Bobinas de metal reciclado",
  },
  {
    id: "b2",
    image:
      "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=1600&auto=format&fit=crop",
    href: "/explore?tag=madera",
    label: "Madera recuperada",
    alt: "Tablas de madera apiladas",
  },
  {
    id: "b3",
    image:
      "https://images.unsplash.com/photo-1560179707-f14e90ef2d9a?q=80&w=1600&auto=format&fit=crop",
    href: "/explore?tag=plastico",
    label: "Plástico industrial",
    alt: "Granza plástica",
  },
];

/**
 * Portada/Explorar:
 *  - Sectores + subcategorías (encima del banner)
 *  - Banner rotatorio
 *  - Grid de productos
 * Mantiene el buscador del Header (?search=) como estaba.
 */
const Index = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  // Filtro local (sin tocar la URL → no hay “saltos”)
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  // Para ProductGrid: usamos SOLO subcategoría.
  // Si no hay subcategoría, pasamos "all" (así no rompemos nada).
  const selectedCategoryForGrid = selectedSubcategory || "all";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Sectores y subcategorías (encima del banner) */}
      <SectorCategoriesBar
        selectedSector={selectedSector}
        selectedSubcategory={selectedSubcategory}
        onSectorChange={setSelectedSector}
        onSubcategoryChange={setSelectedSubcategory}
      />

      {/* Banner rotatorio */}
      <div className="container mx-auto px-4 pt-6">
        <BannerHero
          items={HERO_BANNERS}
          heightClass="h-[200px] md:h-[280px] lg:h-[340px]"
        />
      </div>

      {/* Grid de productos (sin recargas) */}
      <ProductGrid
        selectedCategory={selectedCategoryForGrid}
        searchQuery={searchQuery}
      />

      <Footer />
    </div>
  );
};

export default Index;
