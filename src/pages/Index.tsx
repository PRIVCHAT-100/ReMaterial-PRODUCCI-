// src/pages/Index.tsx
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

/**
 * Home minimalista: productos primero (estilo Amazon/Wallapop).
 * El buscador del Header sincroniza con ?search=
 */
const Index = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Feed de productos directo */}
      <ProductGrid selectedCategory="all" searchQuery={searchQuery} />
      <Footer />
    </div>
  );
};

export default Index;



