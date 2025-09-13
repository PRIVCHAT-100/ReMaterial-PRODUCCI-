import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/ProductCard";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Globe, Star, ExternalLink, Award, Building2, Package } from "lucide-react";

type Company = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  description?: string | null;
  sector?: string | null;
  logo_url?: string | null;
  social_links?: string | null;
  tax_id?: string | null;
  certifications?: string | null;
  address_line1?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  verification_status?: string | null;
};

export default function CompanyProfile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const locationNav = useLocation() as { state?: { from?: string } };
  const backToProduct = locationNav.state?.from;
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, rating: 0, reviews: 0 });

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id, email, first_name, last_name, company_name, phone, location, website, description,
            sector, logo_url, social_links, tax_id, certifications,
            address_line1, city, province, postal_code, country, verification_status
          `)
          .eq("id", id)
          .single();
        if (profileError) throw profileError;

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(`
            id, title, price, images, category, shipping_available, location, quantity, unit,
            seller:profiles!products_seller_id_fkey ( id, first_name, last_name, company_name )
          `)
          .eq("seller_id", id)
          .order("created_at", { ascending: false });
        if (productsError) throw productsError;

        if (!ignore) {
          setCompany(profileData as Company);
          setProducts(productsData || []);
          setStats({
            totalProducts: productsData?.length || 0,
            rating: 4.5,
            reviews: 0,
          });
        }
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Error",
          description: error?.message || "No se pudo cargar la información de la empresa",
          variant: "destructive",
        });
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1"><div className="h-96 bg-muted rounded" /></div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-48 bg-muted rounded" />
                <div className="h-32 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">{t('ui.empresa-no-encontrada') || "Empresa no encontrada"}</h2>
              <p className="text-muted-foreground mb-4">{t('ui.la-empresa-que-buscas-no-existe-o-no-est-disponibl') || "La empresa no existe o no está disponible."}</p>
              <Button asChild>
                <Link to="/companies">{t('ui.ver-todas-las-empresas') || "Ver todas las empresas"}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-muted-foreground hover:text-foreground">Inicio</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <span className="text-foreground">{company.company_name || `${company.first_name || ""} ${company.last_name || ""}`.trim()}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info principal empresa */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <ProfileAvatar className="h-24 w-24 mx-auto mb-4" src={company.logo_url || undefined} name={company.company_name || undefined} />
                <CardTitle className="text-xl">{company.company_name || "Empresa"}</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">{company.sector || "Sector no especificado"}</Badge>
                {company.verification_status && (
                  <div className="mt-2">
                    <Badge variant={company.verification_status === 'verified' ? 'default' : 'secondary'} className="w-fit mx-auto">
                      {company.verification_status === 'verified' ? 'Empresa verificada' : company.verification_status === 'pending' ? 'Verificación pendiente' : 'No verificada'}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-center mt-2 gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= Math.round(stats.rating) ? "text-yellow-500" : "text-muted-foreground"}`} />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{company.description}</p>
                )}

                <Separator />

                <div className="space-y-2">
                  {company.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{company.phone}</span>
                    </div>
                  )}

                  {company.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{company.location}</span>
                    </div>
                  )}

                  {company.address_line1 && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{company.address_line1}</span>
                    </div>
                  )}

                  {(company.postal_code || company.city || company.province || company.country) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{[company.postal_code, company.city, company.province, company.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank" rel="noopener"
                        className="hover:underline"
                      >
                        {company.website}
                        <ExternalLink className="h-3 w-3 inline ml-1" />
                      </a>
                    </div>
                  )}

                  {company.tax_id && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>CIF/NIF: {company.tax_id}</span>
                    </div>
                  )}

                  {company.social_links && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {/^https?:\/\//.test(company.social_links) ? (
                        <a href={company.social_links} target="_blank" rel="noopener" className="hover:underline">
                          {company.social_links}
                        </a>
                      ) : (
                        <span>{company.social_links}</span>
                      )}
                    </div>
                  )}

                  {company.certifications && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{company.certifications}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Productos */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos disponibles ({stats.totalProducts})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={`€${product.price}`}
                        location={product.location || "No especificada"}
                        image={product.images?.[0] || "/placeholder.svg"}
                        category={product.category}
                        shippingAvailable={!!product.shipping_available}
                        seller={{
                          id: product.seller?.id || "",
                          name: product.seller?.company_name || `${product.seller?.first_name || ""} ${product.seller?.last_name || ""}`.trim() || "Vendedor",
                          rating: 4.5,
                          verified: true
                        }}
                        quantity={product.quantity} // 🆕
                        unit={product.unit} // 🆕
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">{t('ui.esta-empresa-a-n-no-ha-publicado-productos') || "Esta empresa aún no ha publicado productos."}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {backToProduct && (
              <div className="flex justify-end">
                <Button onClick={() => navigate(backToProduct)}>Volver al producto</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}