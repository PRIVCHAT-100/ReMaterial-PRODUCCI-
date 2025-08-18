import { MapPin, Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
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
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-background/70 hover:text-background">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t('ui.enlaces-r-pidos')}</h4>
            <nav className="space-y-2">
              <a href="#" className="block text-background/70 hover:text-background transition-colors">{t('ui.c-mo-funciona')}</a>
              <a href="#" className="block text-background/70 hover:text-background transition-colors">{t('ui.vender-materiales')}</a>
              <a href="#" className="block text-background/70 hover:text-background transition-colors">{t('ui.para-empresas')}</a>
              <a href="#" className="block text-background/70 hover:text-background transition-colors">{t('ui.categor-as')}</a>
              <a href="#" className="block text-background/70 hover:text-background transition-colors">{t('ui.precios-y-comisiones')}</a>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Soporte</h4>
            <nav className="space-y-2">
              <a href="#" className="block text-background/70 hover:text-background transition-colors">
                Centro de ayuda
              </a>
              <a href="#" className="block text-background/70 hover:text-background transition-colors">
                Contacto
              </a>
              <a href="/privacy" className="block text-background/70 hover:text-background transition-colors">{t('ui.pol-tica-de-privacidad')}</a>
              <a href="/terms" className="block text-background/70 hover:text-background transition-colors">{t('ui.t-rminos-de-uso')}</a>
              <a href="#" className="block text-background/70 hover:text-background transition-colors">{t('ui.verificaci-n-de-empresas')}</a>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Newsletter</h4>
            <p className="text-background/70 text-sm">{t('ui.recibe-las-mejores-ofertas-y-materiales-disponible')}</p>
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="tu@email.com"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
              />
              <Button className="w-full bg-primary hover:bg-primary/90">
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