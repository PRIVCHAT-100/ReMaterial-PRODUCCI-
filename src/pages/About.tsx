import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Recycle, 
  Users, 
  TrendingUp, 
  Shield,
  CheckCircle,
  Globe,
  Leaf,
  Building
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, label: "Empresas Registradas", value: "500+" },
    { icon: Recycle, label: "Toneladas Recicladas", value: "1,200" },
    { icon: TrendingUp, label: "Transacciones Completadas", value: "2,500+" },
    { icon: Globe, label: "Ciudades Cubiertas", value: "50+" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Transacciones Seguras",
      description: "Pagos protegidos y verificación de empresas para tu tranquilidad"
    },
    {
      icon: Leaf,
      title: "Impacto Ambiental",
      description: "Reducimos residuos industriales dando nueva vida a materiales excedentes"
    },
    {
      icon: Building,
      title: "Red Empresarial",
      description: "Conectamos empresas de diferentes sectores para crear sinergias"
    },
    {
      icon: CheckCircle,
      title: "Calidad Garantizada",
      description: "Verificamos la calidad de materiales y reputación de vendedores"
    }
  ];

  const timeline = [
    {
      year: "2023",
      title: "Fundación",
      description: "Nace ReMaterial con la visión de crear una economía circular en la industria"
    },
    {
      year: "2024",
      title: "Expansión",
      description: "Alcanzamos 500 empresas registradas y expandimos a nuevas ciudades"
    },
    {
      year: "2024",
      title: "Innovación",
      description: "Implementamos IA para optimizar matches entre compradores y vendedores"
    },
    {
      year: "2025",
      title: "Futuro",
      description: "Expansión internacional y nuevas funcionalidades sostenibles"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Sobre Nosotros</Badge>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Transformando Residuos en <span className="text-primary">Oportunidades</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              ReMaterial es la plataforma líder que conecta empresas para comprar y vender materiales excedentes, 
              promoviendo la economía circular y reduciendo el desperdicio industrial.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')} type="button">
                Únete Ahora
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/')} type="button">
                Explorar Productos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Nuestra Misión</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Creamos un marketplace donde los residuos de una empresa se convierten en la materia prima de otra, 
                construyendo un futuro más sostenible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center h-full">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Nuestro Camino</h2>
              <p className="text-lg text-muted-foreground">
                Desde nuestros inicios hasta nuestros planes futuros
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 transform md:-translate-x-1/2"></div>
              
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full transform md:-translate-x-1/2"></div>
                    
                    <div className="ml-12 md:ml-0 md:w-1/2 md:px-8">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.year}</Badge>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Nuestros Valores</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">🌱 Sostenibilidad</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Promovemos prácticas empresariales que respetan el medio ambiente y reducen el desperdicio.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">🤝 Colaboración</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Creemos en el poder de las alianzas empresariales para crear valor compartido.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">💡 Innovación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Utilizamos tecnología avanzada para facilitar conexiones eficientes y transparentes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para formar parte del cambio?
            </h2>
            <p className="text-white/90 mb-8">
              Únete a cientos de empresas que ya están transformando sus residuos en oportunidades
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/auth')}
            >
              Comenzar Ahora
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;