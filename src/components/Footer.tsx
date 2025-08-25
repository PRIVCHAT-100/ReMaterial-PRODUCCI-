
import { MapPin, Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useProfileRole } from "@/hooks/useProfileRole";

const Footer = () => {
  const { data } = useProfileRole();
  const isSeller = !!data?.isSeller;

  const { t } = useTranslation();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info (LOGO + descripción) */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">RM</span>
              </div>
              <span className="font-bold text-xl">ReMaterial</span>
            </div>
            <p className="text-background/70 text-sm">
              El marketplace líder para materiales excedentes y sobrantes industriales. 
              Conectamos empresas para dar segunda vida a los recursos.
            </p>

            {/* Botones de redes sociales (CLICABLES) */}
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background" asChild>
                <a href="https://www.facebook.com/rematerial" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background" asChild>
                <a href="https://x.com/rematerial" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background" asChild>
                <a href="https://www.linkedin.com/company/rematerial" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background" asChild>
                <a href="https://www.instagram.com/rematerial_es" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Enlaces rápidos (SIN CAMBIAR DESTINOS) */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t('ui.enlaces-r-pidos')}</h4>
            <nav className="space-y-2">
              <a href="/settings?tab=support#how-it-works" className="block text-background/70 hover:text-background transition-colors">
                {t('ui.c-mo-funciona')}
              </a>
              {isSeller && <a href="/sell" className="block text-background/70 hover:text-background transition-colors">{t('ui.vender-materiales')}</a>}
              <a href="/companies" className="block text-background/70 hover:text-background transition-colors">{t('ui.para-empresas')}</a>
              <a href="/explore" className="block text-background/70 hover:text-background transition-colors">{t('ui.categor-as')}</a>
              <a href="/terms" className="block text-background/70 hover:text-background transition-colors">{t('ui.precios-y-comisiones')}</a>
            </nav>
          </div>

          {/* Soporte (SIN CAMBIAR DESTINOS) */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Soporte</h4>
            <nav className="space-y-2">
              <a href="/help" className="block text-background/70 hover:text-background transition-colors">
                Centro de ayuda
              </a>
              <a href="mailto:info@rematerial.es" className="block text-background/70 hover:text-background transition-colors">
                Contacto
              </a>
              <a href="/privacy" className="block text-background/70 hover:text-background transition-colors">{t('ui.pol-tica-de-privacidad')}</a>
              <a href="/terms" className="block text-background/70 hover:text-background transition-colors">{t('ui.t-rminos-de-uso')}</a>
              <a href="/settings?tab=account" className="block text-background/70 hover:text-background transition-colors">{t('ui.verificaci-n-de-empresas')}</a>
            </nav>
          </div>

          {/* Newsletter (DESACTIVADA/OCULTA) */}
          <div className="space-y-4 hidden" aria-hidden="true">
            <h4 className="font-semibold text-lg">Newsletter</h4>
            <p className="text-background/70 text-sm">{t('ui.recibe-las-mejores-ofertas-y-materiales-disponible')}</p>
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="tu@email.com"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                disabled
              />
              <Button className="w-full bg-primary/40" disabled>
                Suscribirse
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">{t('ui.2024-rematerial-todos-los-derechos-reservados')}</p>
            <div className="flex items-center space-x-6 text-sm text-background/60">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                info@rematerial.es
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                +34 900 123 456
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;