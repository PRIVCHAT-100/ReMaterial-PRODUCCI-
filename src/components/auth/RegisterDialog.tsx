import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

export const RegisterDialog = ({ open, onOpenChange, onSwitchToLogin }: RegisterDialogProps) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactName: "",
    phone: "",
    sector: "",
    location: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = {
        company_name: formData.companyName,
        contact_name: formData.contactName,
        phone: formData.phone,
        sector: formData.sector,
        location: formData.location,
        website: formData.website,
        user_type: 'business',
      };
      
      await signUp(formData.email, formData.password, userData);
      onOpenChange(false);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        contactName: "",
        phone: "",
        sector: "",
        location: "",
        website: "",
      });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('ui.registro-de-empresa')}</DialogTitle>
          <DialogDescription>{t('ui.crea-tu-cuenta-para-empezar-a-vender-materiales-ex')}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('ui.contacto-empresa-com')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">{t('ui.nombre-de-la-empresa')}</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder={t('ui.mi-empresa-s-l')}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('ui.contrase-a')}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('ui.confirmar-contrase-a')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Persona de Contacto*</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder={t('ui.juan-p-rez')}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">{t('ui.tel-fono')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+34 666 777 888"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">{t('ui.sector')}</Label>
              <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('ui.selecciona-tu-sector')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="construccion">{t('ui.construcci-n')}</SelectItem>
                  <SelectItem value="textil">Textil</SelectItem>
                  <SelectItem value="madera">{t('ui.madera')}</SelectItem>
                  <SelectItem value="metalurgia">Metalurgia</SelectItem>
                  <SelectItem value="piedra">{t('ui.piedra-y-m-rmol')}</SelectItem>
                  <SelectItem value="otros">{t('ui.otros')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">{t('ui.ubicaci-n')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={t('ui.madrid-espa-a')}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder={t('ui.https-www-miempresa-com')}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Cuenta
          </Button>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{t('ui.ya-tienes-cuenta')}</span>
            <Button 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => {
                onOpenChange(false);
                onSwitchToLogin();
              }}
            >
              Inicia sesión aquí
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};