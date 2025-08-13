import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BannerHero from "@/components/BannerHero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Package, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Company = {
  id: string;
  company_name: string | null;
  sector: string | null;
  location: string | null;
  logo_url?: string | null;
  description?: string | null;
  productCount?: number;
  rating?: number;
  reviews?: number;
};

// Banners para la página de Empresas (puedes cambiar URLs/enlaces cuando quieras)
const COMPANY_BANNERS = [
  {
    id: "s1",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop",
    href: "/messages", // por ejemplo, “contacta con vendedores”
    label: "Patrocinado: Envases retornables",
    alt: "Palets y cajas retornables",
    objectPosition: "center",
  },
  {
    id: "s2",
    image:
      "https://images.unsplash.com/photo-1518618021020-8ee98c65f7a0?q=80&w=1600&auto=format&fit=crop",
    href: "/explore?tag=metal",
    label: "Acuerdos con metalúrgicas",
    alt: "Bobinas metálicas",
    objectPosition: "center top",
  },
  {
    id: "s3",
    image:
      "https://images.unsplash.com/photo-1552871212-5d5c9086a0d2?q=80&w=1600&auto=format&fit=crop",
    href: "/explore?tag=madera",
    label: "Madera recuperada",
    alt: "Tablas de madera",
    objectPosition: "50% 40%",
  },
];

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [loading, setLoading] = useState(true);

  const sectors = [
    { value: "all", label: "Todos los sectores" },
    { value: "construccion", label: "Construcción" },
    { value: "textil", label: "Textil" },
    { value: "madera", label: "Madera" },
    { value: "metalurgia", label: "Metalurgia" },
    { value: "piedra", label: "Piedra y Mármol" },
    { value: "otros", label: "Otros" },
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, selectedSector]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, company_name, sector, location, logo_url, description")
        .not("company_name", "is", null)
        // Incluye tanto los perfiles con is_seller=true como los que lo tengan null
        .or("is_seller.eq.true,is_seller.is.null");

      if (error) throw error;

      const companiesWithStats: Company[] = await Promise.all(
        (data || []).map(async (company: Company) => {
          const { data: products } = await supabase
            .from("products")
            .select("id")
            .eq("seller_id", company.id)
            .eq("status", "active");

          return {
            ...company,
            productCount: products?.length || 0,
            rating: 4.5, // placeholder
            reviews: Math.floor(Math.random() * 50) + 5, // placeholder
          };
        })
      );

      setCompanies(companiesWithStats);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.company_name || "").toLowerCase().includes(q) ||
          (c.location || "").toLowerCase().includes(q)
      );
    }

    if (selectedSector !== "all") {
      filtered = filtered.filter((c) => c.sector === selectedSector);
    }

    setFilteredCompanies(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Banner rotatorio en Empresas */}
      <div className="container mx-auto px-4 pt-6">
        <BannerHero
          items={COMPANY_BANNERS}
          heightClass="h-[180px] md:h-[240px] lg:h-[280px]"
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Empresas Registradas
          </h1>
          <p className="text-muted-foreground">
            Descubre empresas que ofrecen materiales excedentes
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar empresas por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="lg:w-64">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {sectors.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-2/3 bg-muted rounded" />
                      <div className="h-3 w-1/3 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-24 bg-muted rounded mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {(company.company_name || "ER")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {company.company_name}
                        </h3>
                        {company.sector && (
                          <Badge variant="secondary">{company.sector}</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {company.rating?.toFixed(1)} ({company.reviews})
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {company.productCount} productos
                        </span>
                        {company.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {company.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {company.description && (
                    <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
                      {company.description}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/company/${company.id}`)}
                    >
                      Ver Perfil
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/messages?seller=${company.id}`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron empresas</h3>
            <p className="text-muted-foreground">
              Prueba a cambiar los filtros o buscar por otro término.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Companies;
