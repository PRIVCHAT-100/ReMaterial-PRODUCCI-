// src/pages/Index.tsx
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import SectorMegaMenu from "@/components/SectorMegaMenu";
import HomeBanners from "@/components/HomeBanners";

const Index = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  // Filtro local
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  // Medir alturas reales de header + barra
  const headerWrapRef = useRef<HTMLDivElement | null>(null);
  const catsWrapRef = useRef<HTMLDivElement | null>(null);
  const [headerH, setHeaderH] = useState<number>(64);
  const [catsH, setCatsH] = useState<number>(56);

  useEffect(() => {
    const measure = () => {
      setHeaderH(headerWrapRef.current?.offsetHeight || 64);
      setCatsH(catsWrapRef.current?.offsetHeight || 56);
    };
    measure();
    window.addEventListener("resize", measure);

    const roHeader = headerWrapRef.current ? new ResizeObserver(measure) : null;
    const roCats = catsWrapRef.current ? new ResizeObserver(measure) : null;
    if (headerWrapRef.current && roHeader) roHeader.observe(headerWrapRef.current);
    if (catsWrapRef.current && roCats) roCats.observe(catsWrapRef.current);

    return () => {
      window.removeEventListener("resize", measure);
      roHeader?.disconnect();
      roCats?.disconnect();
    };
  }, []);

  // Para ProductGrid: prioriza subcategoría; si no hay, muestra todo.
  const selectedCategoryForGrid = selectedSubcategory || selectedSector || "all";

  return (
    <div className="min-h-screen bg-background">
      {/* Header fijo — fondo sólido (sin borde para evitar doble línea) */}
      <div ref={headerWrapRef} className="fixed top-0 inset-x-0 z-50 bg-white">
        <Header />
      </div>

      {/* Barra fija de categorías — fondo sólido; sin transparencia */}
      <div
        ref={catsWrapRef}
        className="fixed inset-x-0 z-40 bg-white border-b overflow-visible"
        style={{ top: headerH - 1 }} // -1px para matar micro-gap
      >
        <SectorMegaMenu
          selectedSector={selectedSector}
          selectedSubcategory={selectedSubcategory}
          onSectorChange={setSelectedSector}
          onSubcategoryChange={setSelectedSubcategory}
        />
      </div>

      {/* Spacer para no tapar contenido */}
      <div style={{ height: headerH + catsH - 1 }} />

      {/* Banners desde BD */}
      <div className="container mx-auto px-4 pt-6">
        <HomeBanners />
      </div>

      {/* Grid de productos */}
      <ProductGrid
        selectedCategory={selectedCategoryForGrid}
        searchQuery={searchQuery}
      />

      <Footer />
    </div>
  );
};

export default Index;
