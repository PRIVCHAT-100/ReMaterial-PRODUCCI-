import { useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { TAXONOMY } from "@/data/taxonomy";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function Category() {
  const { cat, sub } = useParams<{ cat: string; sub?: string }>();

  // Validación rápida: si cat no existe en la taxonomía, mandamos a home (puedo hacer 404 si prefieres)
  const catNode = useMemo(() => TAXONOMY.find((c) => c.slug === cat), [cat]);
  if (!catNode) return <Navigate to="/" replace />;

  const subNode = useMemo(
    () => (sub ? (catNode.children || []).find((s) => s.slug === sub) : undefined),
    [catNode, sub]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/c/${catNode.slug}`}>{catNode.label}</BreadcrumbLink>
            </BreadcrumbItem>
            {subNode && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/c/${catNode.slug}/${subNode.slug}`}>
                    {subNode.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          {subNode ? subNode.label : catNode.label}
        </h1>
      </div>

      {/* Rejilla reutilizada con filtros por slug */}
      <ProductGrid
        selectedCategory="all"
        categorySlug={catNode.slug}
        subSlug={subNode?.slug}
      />

      <Footer />
    </div>
  );
}
