import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { upsertProfileIsSeller } from "@/lib/roles/upsertProfileIsSeller";
import { ArrowLeft, Building, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import GeoConsentAfterSignup from "@/components/auth/GeoConsentAfterSignup";
import { SellerToggle } from "@/components/auth/SellerToggle";

const Auth = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [geoOpen, setGeoOpen] = useState(false);
  const { signUp, signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    isSeller: false,
    companyName: "",
    sector: "",
    location: "",
    phone: "",
    description: "",
  });

  const sectors = [
    { value: "construccion", label: t('ui.construcci-n') },
    { value: "textil", label: "Textil" },
    { value: "madera", label: t('ui.madera') },
    { value: "metalurgia", label: "Metalurgia" },
    { value: "piedra", label: t('ui.piedra-y-m-rmol') },
    { value: "otros", label: t('ui.otros') },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setLoginError(null);
    setLoading(true);
    try {
      await signIn(loginEmail.trim(), loginPassword.trim());
      navigate("/");
    } catch (error: any) {
      const msg = (error?.message || "").toLowerCase();
      let friendly = "No se pudo iniciar sesión. Revisa email y contraseña.";
      if (msg.includes("invalid login credentials")) {
        friendly = "Email o contraseña incorrectos. Asegúrate de no tener espacios y que el email esté confirmado.";
      } else if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        friendly = "Tu email no está confirmado. Revisa tu bandeja de entrada y confirma tu cuenta.";
      }
      setLoginError(friendly);
      console.error("Error signing in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (!registerData.email || !registerData.password || !registerData.firstName) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    if (registerData.isSeller && !registerData.companyName) {
      alert("El nombre de la empresa es obligatorio para vendedores");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        is_seller: registerData.isSeller,
        ...(registerData.isSeller && {
          company_name: registerData.companyName,
          sector: registerData.sector,
          location: registerData.location,
          phone: registerData.phone,
          description: registerData.description,
        }),
      };

      await signUp(registerData.email, registerData.password, userData);
      
      try {
        const userDataResp = await supabase.auth.getUser();
        const user = userDataResp.data?.user ?? null;
        if (user) { await upsertProfileIsSeller(user.id, user.email ?? null, registerData.isSeller); }
      } catch {}
setGeoOpen(true);
    } catch (error) {
      console.error("Error signing up:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRegisterData = (field: string, value: any) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />{t('ui.volver-al-inicio')}</Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Bienvenido</CardTitle>
            <CardDescription>
              Accede a tu cuenta o crea una nueva para empezar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('ui.iniciar-sesi-n')}</TabsTrigger>
                <TabsTrigger value="register">{t('ui.registrarse')}</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('ui.contrase-a')}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t('ui.tu-contrase-a')}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('ui.nombre')}</Label>
                      <Input
                        id="firstName"
                        placeholder={t('ui.tu-nombre')}
                        value={registerData.firstName}
                        onChange={(e) => updateRegisterData("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        placeholder="Tu apellido"
                        value={registerData.lastName}
                        onChange={(e) => updateRegisterData("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={registerData.email}
                      onChange={(e) => updateRegisterData("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t('ui.contrase-a')}</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder={t('ui.m-nimo-6-caracteres')}
                        value={registerData.password}
                        onChange={(e) => updateRegisterData("password", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t('ui.confirmar')}</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder={t('ui.repetir-contrase-a')}
                        value={registerData.confirmPassword}
                        onChange={(e) => updateRegisterData("confirmPassword", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSeller"
                      checked={registerData.isSeller}
                      onCheckedChange={(checked) => updateRegisterData("isSeller", checked)}
                    />
                    <Label htmlFor="isSeller" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />{t('ui.quiero-registrarme-como-empresa-vendedora')}</Label>
                  </div>

                  {registerData.isSeller && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />{t('ui.informaci-n-de-la-empresa')}</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyName">{t('ui.nombre-de-la-empresa')}</Label>
                        <Input
                          id="companyName"
                          placeholder={t('ui.nombre-de-tu-empresa')}
                          value={registerData.companyName}
                          onChange={(e) => updateRegisterData("companyName", e.target.value)}
                          required={registerData.isSeller}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sector">{t('ui.sector')}</Label>
                          <select
                            id="sector"
                            value={registerData.sector}
                            onChange={(e) => updateRegisterData("sector", e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="">{t('ui.seleccionar-sector')}</option>
                            {sectors.map((sector) => (
                              <option key={sector.value} value={sector.value}>
                                {sector.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">{t('ui.ubicaci-n')}</Label>
                          <Input
                            id="location"
                            placeholder={t('ui.ciudad-pa-s')}
                            value={registerData.location}
                            onChange={(e) => updateRegisterData("location", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('ui.tel-fono')}</Label>
                        <Input
                          id="phone"
                          placeholder={t('ui.tel-fono-de-contacto')}
                          value={registerData.phone}
                          onChange={(e) => updateRegisterData("phone", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">{t('ui.descripci-n')}</Label>
                        <textarea
                          id="description"
                          placeholder={t('ui.describe-tu-empresa-y-los-servicios-que-ofreces')}
                          value={registerData.description}
                          onChange={(e) => updateRegisterData("description", e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>{t('ui.al-registrarte-aceptas-nuestros-t-rminos-de-servic')}</p>
        </div>
      </div>
      <GeoConsentAfterSignup open={geoOpen} onOpenChange={setGeoOpen} onDecide={() => { setGeoOpen(false); navigate("/"); }} />
    </div>
  );
};

export default Auth;