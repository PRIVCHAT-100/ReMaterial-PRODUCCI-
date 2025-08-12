import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Building, User } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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
    { value: "construccion", label: "Construcción" },
    { value: "textil", label: "Textil" },
    { value: "madera", label: "Madera" },
    { value: "metalurgia", label: "Metalurgia" },
    { value: "piedra", label: "Piedra y Mármol" },
    { value: "otros", label: "Otros" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      navigate("/");
    } catch (error) {
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
      navigate("/");
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
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
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
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
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Tu contraseña"
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
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        placeholder="Tu nombre"
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
                      <Label htmlFor="register-password">Contraseña *</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={registerData.password}
                        onChange={(e) => updateRegisterData("password", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar *</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repetir contraseña"
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
                      <Building className="h-4 w-4" />
                      Quiero registrarme como empresa vendedora
                    </Label>
                  </div>

                  {registerData.isSeller && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Información de la Empresa
                      </h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                        <Input
                          id="companyName"
                          placeholder="Nombre de tu empresa"
                          value={registerData.companyName}
                          onChange={(e) => updateRegisterData("companyName", e.target.value)}
                          required={registerData.isSeller}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sector">Sector</Label>
                          <select
                            id="sector"
                            value={registerData.sector}
                            onChange={(e) => updateRegisterData("sector", e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="">Seleccionar sector</option>
                            {sectors.map((sector) => (
                              <option key={sector.value} value={sector.value}>
                                {sector.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Ubicación</Label>
                          <Input
                            id="location"
                            placeholder="Ciudad, País"
                            value={registerData.location}
                            onChange={(e) => updateRegisterData("location", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          placeholder="Teléfono de contacto"
                          value={registerData.phone}
                          onChange={(e) => updateRegisterData("phone", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <textarea
                          id="description"
                          placeholder="Describe tu empresa y los servicios que ofreces..."
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
          <p>Al registrarte, aceptas nuestros términos de servicio y política de privacidad</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;