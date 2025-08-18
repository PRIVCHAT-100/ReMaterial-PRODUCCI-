import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Globe, Phone, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();

  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    company_name: "",
    first_name: "",
    last_name: "",
    phone: "",
    sector: "",
    location: "",
    description: "",
    tax_id: "",
    website: "",
    logo_url: "",
    social_links: "",
    certifications: "",
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    rating: 0,
    reviews: 0,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          company_name: data.company_name || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          sector: data.sector || "",
          location: data.location || "",
          description: data.description || "",
          tax_id: data.tax_id || "",
          website: data.website || "",
          logo_url: data.logo_url || "",
          social_links: data.social_links || "",
          certifications: data.certifications || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch user statistics
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id);

      setStats(prev => ({
        ...prev,
        totalProducts: products?.length || 0,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profile);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
              <p className="text-muted-foreground">{t('ui.debes-iniciar-sesi-n-para-ver-tu-perfil')}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Statistics */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">
                      {profile.company_name?.charAt(0) || 'E'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profile.company_name || 'Mi Empresa'}</h3>
                    <Badge variant="secondary">{profile.sector || 'Sector'}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Miembro desde {new Date(user.created_at).toLocaleDateString()}
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{stats.totalProducts}</div>
                      <div className="text-sm text-muted-foreground">{t('ui.productos')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{stats.totalSales}</div>
                      <div className="text-sm text-muted-foreground">Ventas</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-4 gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= stats.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">({stats.reviews} reseñas)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('ui.informaci-n-de-la-empresa')}</CardTitle>
                <CardDescription>{t('ui.actualiza-la-informaci-n-de-tu-empresa-para-que-lo')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">{t('ui.nombre-de-la-empresa')}</Label>
                      <Input
                        id="company_name"
                        value={profile.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        placeholder={t('ui.mi-empresa-s-l')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="first_name">{t('ui.nombre')}</Label>
                      <Input
                        id="first_name"
                        value={profile.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="Juan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Apellido</Label>
                      <Input
                        id="last_name"
                        value={profile.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder={t('ui.p-rez')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('ui.tel-fono')}</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+34 666 777 888"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sector">{t('ui.sector')}</Label>
                      <Select value={profile.sector} onValueChange={(value) => handleInputChange('sector', value)}>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t('ui.ubicaci-n')}</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder={t('ui.madrid-espa-a')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_id">CIF/NIF</Label>
                    <Input
                      id="tax_id"
                      value={profile.tax_id}
                      onChange={(e) => handleInputChange('tax_id', e.target.value)}
                      placeholder="B12345678"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">{t('ui.p-gina-web')}</Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder={t('ui.www-miempresa-com')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo_url">URL del Logo</Label>
                      <Input
                        id="logo_url"
                        value={profile.logo_url}
                        onChange={(e) => handleInputChange('logo_url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social_links">Redes Sociales</Label>
                    <Input
                      id="social_links"
                      value={profile.social_links}
                      onChange={(e) => handleInputChange('social_links', e.target.value)}
                      placeholder="Facebook, Instagram, LinkedIn..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certificaciones</Label>
                    <textarea
                      id="certifications"
                      value={profile.certifications}
                      onChange={(e) => handleInputChange('certifications', e.target.value)}
                      placeholder="ISO 9001, CE, etc..."
                      className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('ui.descripci-n-de-la-empresa')}</Label>
                    <textarea
                      id="description"
                      value={profile.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder={t('ui.describe-tu-empresa-servicios-y-especialidades')}
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;