import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">{t('ui.t-rminos-y-condiciones')}</h1>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('ui.1-aceptaci-n-de-los-t-rminos')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Al acceder y utilizar ReMaterial, aceptas estar sujeto a estos términos y condiciones de uso. Si no estás de acuerdo con algún aspecto de estos términos, no debes utilizar nuestro servicio.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ui.2-descripci-n-del-servicio')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  ReMaterial es una plataforma digital que facilita la compra y venta de materiales excedentes entre empresas. Actuamos como intermediario para conectar compradores y vendedores.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Facilitar transacciones entre usuarios registrados</li>
                  <li>{t('ui.proporcionar-herramientas-de-comunicaci-n')}</li>
                  <li>Ofrecer servicios de pago seguros</li>
                  <li>Mantener un marketplace organizado y confiable</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Registro y Cuentas de Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Para utilizar nuestros servicios, debes:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>{t('ui.proporcionar-informaci-n-precisa-y-actualizada')}</li>
                    <li>Mantener la confidencialidad de tu cuenta</li>
                    <li>Ser responsable de todas las actividades bajo tu cuenta</li>
                    <li>Notificar inmediatamente cualquier uso no autorizado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Responsabilidades del Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <h4 className="font-semibold text-foreground">Vendedores:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('ui.proporcionar-descripciones-precisas-de-los-product')}</li>
                    <li>{t('ui.garantizar-la-calidad-y-autenticidad-de-los-materi')}</li>
                    <li>{t('ui.cumplir-con-los-t-rminos-de-entrega-acordados')}</li>
                    <li>{t('ui.mantener-comunicaci-n-profesional-con-compradores')}</li>
                  </ul>
                  
                  <h4 className="font-semibold text-foreground mt-4">Compradores:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{t('ui.realizar-pagos-seg-n-los-t-rminos-acordados')}</li>
                    <li>{t('ui.inspeccionar-productos-al-momento-de-la-entrega')}</li>
                    <li>Comunicar cualquier problema de manera oportuna</li>
                    <li>{t('ui.utilizar-los-materiales-de-manera-responsable')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Prohibiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{t('ui.est-estrictamente-prohibido')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('ui.publicar-contenido-falso-enga-oso-o-fraudulento')}</li>
                  <li>{t('ui.vender-materiales-peligrosos-o-ilegales')}</li>
                  <li>{t('ui.utilizar-la-plataforma-para-actividades-no-relacio')}</li>
                  <li>Interferir con el funcionamiento normal de la plataforma</li>
                  <li>Violar derechos de propiedad intelectual</li>
                  <li>{t('ui.acosar-o-amenazar-a-otros-usuarios')}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Pagos y Tarifas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>{t('ui.rematerial-cobra-una-comisi-n-por-las-transaccione')}</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>{t('ui.comisi-n-del-3-sobre-el-valor-de-la-transacci-n')}</li>
                    <li>{t('ui.procesamiento-de-pagos-seguro-a-trav-s-de-stripe')}</li>
                    <li>Los pagos se liberan una vez confirmada la entrega</li>
                    <li>{t('ui.posibilidad-de-reembolsos-seg-n-nuestra-pol-tica')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ui.7-limitaci-n-de-responsabilidad')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ReMaterial actúa como intermediario y no es responsable de la calidad, seguridad, legalidad o exactitud de los productos listados. Los usuarios son responsables de verificar la información y realizar sus propias evaluaciones antes de cualquier transacción.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Modificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma. El uso continuado del servicio constituye la aceptación de los términos modificados.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Contacto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  <p className="mb-2">{t('ui.para-cualquier-consulta-sobre-estos-t-rminos-conta')}</p>
                  <ul className="space-y-1">
                    <li>Email: legal@rematerial.com</li>
                    <li>{t('ui.tel-fono-34-900-123-456')}</li>
                    <li>{t('ui.direcci-n-calle-principal-123-28001-madrid-espa-a')}</li>
                  </ul>
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

export default Terms;