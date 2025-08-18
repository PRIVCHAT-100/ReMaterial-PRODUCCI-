import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">{t('ui.pol-tica-de-privacidad')}</h1>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('ui.1-informaci-n-que-recopilamos')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <h4 className="font-semibold text-foreground">{t('ui.informaci-n-personal')}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('ui.nombre-y-apellidos')}</li>
                    <li>{t('ui.direcci-n-de-correo-electr-nico')}</li>
                    <li>{t('ui.n-mero-de-tel-fono')}</li>
                    <li>{t('ui.direcci-n-de-la-empresa')}</li>
                    <li>{t('ui.informaci-n-de-facturaci-n')}</li>
                  </ul>
                  
                  <h4 className="font-semibold text-foreground">{t('ui.informaci-n-de-uso')}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('ui.p-ginas-visitadas-y-tiempo-de-navegaci-n')}</li>
                    <li>{t('ui.productos-visualizados-y-buscados')}</li>
                    <li>{t('ui.interacciones-con-otros-usuarios')}</li>
                    <li>{t('ui.datos-de-localizaci-n-si-se-autoriza')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ui.2-c-mo-utilizamos-tu-informaci-n')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Facilitar transacciones entre compradores y vendedores</li>
                  <li>{t('ui.procesar-pagos-y-gestionar-facturaci-n')}</li>
                  <li>Mejorar nuestros servicios y experiencia de usuario</li>
                  <li>Comunicar actualizaciones importantes del servicio</li>
                  <li>Prevenir fraudes y garantizar la seguridad</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                  <li>{t('ui.enviar-comunicaciones-de-marketing-con-tu-consenti')}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ui.3-compartir-informaci-n-con-terceros')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>{t('ui.compartimos-informaci-n-limitada-en-las-siguientes')}</p>
                  
                  <h4 className="font-semibold text-foreground">Proveedores de Servicios:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Procesadores de pago (Stripe)</li>
                    <li>Servicios de alojamiento (Supabase)</li>
                    <li>{t('ui.servicios-de-email-y-comunicaci-n')}</li>
                    <li>{t('ui.herramientas-de-an-lisis-y-estad-sticas')}</li>
                  </ul>
                  
                  <h4 className="font-semibold text-foreground">Entre Usuarios:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('ui.informaci-n-de-perfil-p-blico-nombre-de-empresa-ub')}</li>
                    <li>{t('ui.historial-de-productos-vendidos')}</li>
                    <li>Valoraciones y comentarios</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ui.4-cookies-y-tecnolog-as-similares')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Utilizamos cookies para:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>{t('ui.mantener-tu-sesi-n-activa')}</li>
                    <li>Recordar tus preferencias</li>
                    <li>Analizar el uso de la plataforma</li>
                    <li>Personalizar contenido y anuncios</li>
                    <li>Mejorar la seguridad</li>
                  </ul>
                  <p className="mt-4">{t('ui.puedes-controlar-las-cookies-desde-la-configuraci-')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Seguridad de los Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>{t('ui.implementamos-medidas-de-seguridad-para-proteger-t')}</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Cifrado SSL/TLS para todas las transmisiones</li>
                    <li>{t('ui.autenticaci-n-de-dos-factores-disponible')}</li>
                    <li>Monitoreo continuo de actividades sospechosas</li>
                    <li>Acceso limitado a datos personales por parte del personal</li>
                    <li>Respaldos regulares y seguros</li>
                    <li>{t('ui.cumplimiento-con-est-ndares-de-seguridad-industria')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Tus Derechos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Bajo el RGPD, tienes derecho a:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Acceso:</strong> Solicitar una copia de tus datos personales</li>
                    <li><strong>{t('ui.rectificaci-n')}</strong>{t('ui.corregir-informaci-n-inexacta-o-incompleta')}</li>
                    <li><strong>{t('ui.supresi-n')}</strong>{t('ui.solicitar-la-eliminaci-n-de-tus-datos')}</li>
                    <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                    <li><strong>{t('ui.limitaci-n')}</strong> Restringir el procesamiento de tus datos</li>
                    <li><strong>{t('ui.oposici-n')}</strong> Oponerte al procesamiento para marketing directo</li>
                  </ul>
                  <p className="mt-4">{t('ui.para-ejercer-estos-derechos-contacta-con-nosotros-')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ui.7-retenci-n-de-datos')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground space-y-4">
                  <p>{t('ui.conservamos-tu-informaci-n-personal-durante')}</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Cuentas activas: Mientras mantengas tu cuenta</li>
                    <li>{t('ui.datos-de-transacciones-7-a-os-requisito-legal')}</li>
                    <li>{t('ui.comunicaciones-3-a-os-despu-s-del-ltimo-contacto')}</li>
                    <li>Datos de marketing: Hasta que retires el consentimiento</li>
                  </ul>
                  <p>{t('ui.despu-s-de-estos-per-odos-eliminamos-o-anonimizamo')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Transferencias Internacionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico Europeo. Cuando transferimos datos internacionalmente, implementamos salvaguardias apropiadas como cláusulas contractuales estándar aprobadas por la Comisión Europea.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Menores de Edad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nuestros servicios están dirigidos a empresas y no recopilamos intencionalmente información personal de menores de 16 años. Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ui.10-cambios-en-esta-pol-tica')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios significativos por email o mediante un aviso prominente en nuestro sitio web. Te recomendamos revisar esta política periódicamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  <p className="mb-4">{t('ui.para-consultas-sobre-privacidad-o-ejercer-tus-dere')}</p>
                  <div className="space-y-2">
                    <p><strong>{t('ui.delegado-de-protecci-n-de-datos')}</strong></p>
                    <p>Email: privacy@rematerial.com</p>
                    <p>{t('ui.tel-fono-34-900-123-456')}</p>
                    <p>{t('ui.direcci-n-calle-principal-123-28001-madrid-espa-a')}</p>
                  </div>
                  <p className="mt-4">
                    También puedes presentar una queja ante la Agencia Española de Protección de Datos (AEPD) si consideras que hemos incumplido la normativa de protección de datos.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground text-center mt-8">
              <p>{t('ui.ltima-actualizaci-n-1-de-enero-de-2024')}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;