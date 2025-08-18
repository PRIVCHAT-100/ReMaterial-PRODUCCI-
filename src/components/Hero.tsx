import { useState, useEffect } from "react";
import { Search, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import heroImage from "@/assets/hero-marketplace.jpg";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");

  // Restablecer campo y navegación si se limpia búsqueda
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.get('search')) {
      setSearchValue("");
    }
  }, [location.search]);

  const handleSearch = () => {
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/5 to-accent/5 py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
              El marketplace para<span className="text-primary block">{t('ui.materiales-excedentes')}</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Conectamos empresas y profesionales para dar segunda vida a materiales sobrantes.
              Reduce costes, evita desperdicios y encuentra lo que necesitas.
            </p>

            <div className="bg-background p-6 rounded-lg shadow-lg border border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder={t('ui.qu-material-buscas-ej-m-rmol-acero-textil')}
                    className="pl-10 h-12"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button size="lg" className="h-12 px-8" onClick={handleSearch}>{t('ui.buscar-materiales')}<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {!user && (
                <div className="mt-4 text-center">
                  <Button size="sm" variant="outline" onClick={() => navigate('/auth')}>
                    <UserPlus className="mr-2 h-4 w-4" />{t('ui.reg-strate-para-m-s-opciones')}</Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">{t('ui.empresas-activas')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">2.5k+</div>
                <div className="text-sm text-muted-foreground">{t('ui.materiales-disponibles')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">95%</div>
                <div className="text-sm text-muted-foreground">{t('ui.satisfacci-n-cliente')}</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt={t('ui.materiales-industriales-y-excedentes')}
              className="rounded-lg shadow-2xl w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;