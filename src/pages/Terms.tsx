import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Términos y Condiciones</h1>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Aceptación de los Términos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Al acceder y utilizar ReMaterial, aceptas estar sujeto a estos términos y condiciones de uso. Si no estás de acuerdo con algún aspecto de estos términos, no debes utilizar nuestro servicio.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Descripción del Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  ReMaterial es una plataforma digital que facilita la compra y venta de materiales excedentes entre empresas. Actuamos como intermediario para conectar compradores y vendedores.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Facilitar transacciones entre usuarios registrados</li>
                  <li>Proporcionar herramientas de comunicación</li>
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
                    <li>Proporcionar información precisa y actualizada</li>
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
                    <li>Proporcionar descripciones precisas de los productos</li>
                    <li>Garantizar la calidad y autenticidad de los materiales</li>
                    <li>Cumplir con los términos de entrega acordados</li>
                    <li>Mantener comunicación profesional con compradores</li>
                  </ul>
                  
                  <h4 className="font-semibold text-foreground mt-4">Compradores:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Realizar pagos según los términos acordados</li>
                    <li>Inspeccionar productos al momento de la entrega</li>
                    <li>Comunicar cualquier problema de manera oportuna</li>
                    <li>Utilizar los materiales de manera responsable</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Prohibiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Está estrictamente prohibido:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Publicar contenido falso, engañoso o fraudulento</li>
                  <li>Vender materiales peligrosos o ilegales</li>
                  <li>Utilizar la plataforma para actividades no relacionadas con la venta de materiales</li>
                  <li>Interferir con el funcionamiento normal de la plataforma</li>
                  <li>Violar derechos de propiedad intelectual</li>
                  <li>Acosar o amenazar a otros usuarios</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Pagos y Tarifas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>ReMaterial cobra una comisión por las transacciones exitosas:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Comisión del 3% sobre el valor de la transacción</li>
                    <li>Procesamiento de pagos seguro a través de Stripe</li>
                    <li>Los pagos se liberan una vez confirmada la entrega</li>
                    <li>Posibilidad de reembolsos según nuestra política</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Limitación de Responsabilidad</CardTitle>
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
                  <p className="mb-2">Para cualquier consulta sobre estos términos, contacta con nosotros:</p>
                  <ul className="space-y-1">
                    <li>Email: legal@rematerial.com</li>
                    <li>Teléfono: +34 900 123 456</li>
                    <li>Dirección: Calle Principal 123, 28001 Madrid, España</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground text-center mt-8">
              <p>Última actualización: 1 de enero de 2024</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;