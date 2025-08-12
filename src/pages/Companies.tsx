import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Package, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
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
    { value: "plastico", label: "Plástico" },
    { value: "papel", label: "Papel" },
    { value: "electronica", label: "Electrónica" },
    { value: "comida", label: "Comida" },
    { value: "bebidas", label: "Bebidas" },
    { value: "otros", label: "Otros" },
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, selectedSector]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('company_name', 'is', null)
        .eq('is_seller', true);

      if (error) throw error;
      
      // Get product counts and ratings for each company
      const companiesWithStats = await Promise.all(
        (data || []).map(async (company) => {
          const { data: products } = await supabase
            .from('products')
            .select('id')
            .eq('seller_id', company.id)
            .eq('status', 'active');

          return {
            ...company,
            productCount: products?.length || 0,
            rating: 4.5, // Mock rating for now
            reviews: Math.floor(Math.random() * 50) + 5, // Mock reviews
          };
        })
      );

      setCompanies(companiesWithStats);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSector !== "all") {
      filtered = filtered.filter(company => company.sector === selectedSector);
    }

    setFilteredCompanies(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Empresas Registradas</h1>
          <p className="text-muted-foreground">Descubre empresas que ofrecen materiales excedentes</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
                {sectors.map((sector) => (
                  <option key={sector.value} value={sector.value}>
                    {sector.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mostrando {filteredCompanies.length} empresas</span>
          </div>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company: any) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {company.company_name?.charAt(0) || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{company.company_name}</h3>
                      <Badge variant="secondary" className="mb-2">
                        {company.sector}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="mr-1">{company.rating}</span>
                        <span>({company.reviews} reseñas)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {company.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {company.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Package className="h-4 w-4 mr-2" />
                      {company.productCount} productos activos
                    </div>
                  </div>

                  {company.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {company.description}
                    </p>
                  )}

                  <div className="flex gap-2">
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
        )}

        {filteredCompanies.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No se encontraron empresas</h3>
            <p className="text-muted-foreground">
              Intenta cambiar los filtros de búsqueda o explora diferentes sectores
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Companies;