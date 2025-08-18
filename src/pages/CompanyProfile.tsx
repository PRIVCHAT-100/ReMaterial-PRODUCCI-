import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Package, 
  ExternalLink,
  MessageSquare,
  Award,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { useTranslation } from "react-i18next";

const CompanyProfile = () => {
  const { t } = useTranslation();

  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // 👇 para “Volver al producto”
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const backToProduct = location.state?.from; // ej. "/product/xxxxx"

  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    rating: 0,
    reviews: 0,
  });

  useEffect(() => {
    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      
      // Perfil de empresa
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      
      // Productos de la empresa (desambiguando la relación con profiles)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles!products_seller_id_fkey (
            id,
            first_name,
            last_name,
            company_name
          )
        `)
        .eq('seller_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      setCompany(profileData);
      setProducts(productsData || []);
      setStats({
        totalProducts: productsData?.length || 0,
        rating: 4.5, // Mock rating
        reviews: Math.floor(Math.random() * 50) + 5, // Mock reviews
      });
    } catch (error: any) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo cargar la información de la empresa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-96 bg-muted rounded"></div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
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
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">{t('ui.empresa-no-encontrada')}</h2>
              <p className="text-muted-foreground mb-4">{t('ui.la-empresa-que-buscas-no-existe-o-no-est-disponibl')}</p>
              <Button asChild>
                <Link to="/companies">{t('ui.ver-todas-las-empresas')}</Link>
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
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-muted-foreground hover:text-foreground">
                Inicio
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <Link to="/companies" className="text-muted-foreground hover:text-foreground">{t('ui.empresas')}</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-muted-foreground">/</span>
                <span className="text-foreground">{company.company_name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  {company.logo_url ? (
                    <AvatarImage src={company.logo_url} alt={company.company_name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {company.company_name?.charAt(0) || 'E'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="text-xl">{company.company_name}</CardTitle>
                <Badge variant="secondary" className="w-fit mx-auto">
                  {company.sector || 'Sector no especificado'}
                </Badge>
                <div className="flex items-center justify-center mt-2 gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= stats.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({stats.reviews} reseñas)
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{company.email}</span>
                  </div>
                  
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
                  
                  {company.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {company.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {company.tax_id && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>CIF/NIF: {company.tax_id}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.totalProducts}</div>
                    <div className="text-sm text-muted-foreground">{t('ui.productos-activos')}</div>
                  </div>
                </div>

                {company.certifications && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Certificaciones</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{company.certifications}</p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Aparece solo si venías desde una ficha de producto */}
                  {backToProduct && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(backToProduct)}
                    >
                      ← Volver al producto
                    </Button>
                  )}

                  <Button 
                    className="w-full"
                    onClick={() => window.location.href = `/messages?seller=${company.id}`}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />{t('ui.contactar-empresa')}</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Details and Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Description */}
            {company.description && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('ui.sobre-la-empresa')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {company.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {company.social_links && (
              <Card>
                <CardHeader>
                  <CardTitle>Redes sociales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {company.social_links}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Products Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos disponibles ({stats.totalProducts})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        id={product.id}
                        title={product.title}
                        price={`€${product.price}`}
                        location={product.location || 'No especificada'}
                        image={product.images?.[0] || '/placeholder.svg'}
                        category={product.category}
                        shippingAvailable={!!product.shipping_available}
                        seller={{
                          id: product.seller?.id || '',
                          name:
                            product.seller?.company_name ||
                            `${product.seller?.first_name || ""} ${product.seller?.last_name || ""}`.trim() ||
                            'Vendedor',
                          rating: 4.5,
                          verified: true
                        }}
                        description={product.description || ''}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('ui.no-hay-productos-disponibles')}</h3>
                    <p className="text-muted-foreground">{t('ui.esta-empresa-a-n-no-ha-publicado-productos')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CompanyProfile;