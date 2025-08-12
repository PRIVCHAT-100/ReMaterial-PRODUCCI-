import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidad</h1>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Información que Recopilamos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <h4 className="font-semibold text-foreground">Información Personal:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Nombre y apellidos</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Número de teléfono</li>
                    <li>Dirección de la empresa</li>
                    <li>Información de facturación</li>
                  </ul>
                  
                  <h4 className="font-semibold text-foreground">Información de Uso:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Páginas visitadas y tiempo de navegación</li>
                    <li>Productos visualizados y buscados</li>
                    <li>Interacciones con otros usuarios</li>
                    <li>Datos de localización (si se autoriza)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Cómo Utilizamos tu Información</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Facilitar transacciones entre compradores y vendedores</li>
                  <li>Procesar pagos y gestionar facturación</li>
                  <li>Mejorar nuestros servicios y experiencia de usuario</li>
                  <li>Comunicar actualizaciones importantes del servicio</li>
                  <li>Prevenir fraudes y garantizar la seguridad</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                  <li>Enviar comunicaciones de marketing (con tu consentimiento)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Compartir Información con Terceros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Compartimos información limitada en las siguientes circunstancias:</p>
                  
                  <h4 className="font-semibold text-foreground">Proveedores de Servicios:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Procesadores de pago (Stripe)</li>
                    <li>Servicios de alojamiento (Supabase)</li>
                    <li>Servicios de email y comunicación</li>
                    <li>Herramientas de análisis y estadísticas</li>
                  </ul>
                  
                  <h4 className="font-semibold text-foreground">Entre Usuarios:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Información de perfil público (nombre de empresa, ubicación)</li>
                    <li>Historial de productos vendidos</li>
                    <li>Valoraciones y comentarios</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Cookies y Tecnologías Similares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Utilizamos cookies para:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Mantener tu sesión activa</li>
                    <li>Recordar tus preferencias</li>
                    <li>Analizar el uso de la plataforma</li>
                    <li>Personalizar contenido y anuncios</li>
                    <li>Mejorar la seguridad</li>
                  </ul>
                  <p className="mt-4">
                    Puedes controlar las cookies desde la configuración de tu navegador, aunque esto puede afectar la funcionalidad del sitio.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Seguridad de los Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-muted-foreground">
                  <p>Implementamos medidas de seguridad para proteger tu información:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Cifrado SSL/TLS para todas las transmisiones</li>
                    <li>Autenticación de dos factores disponible</li>
                    <li>Monitoreo continuo de actividades sospechosas</li>
                    <li>Acceso limitado a datos personales por parte del personal</li>
                    <li>Respaldos regulares y seguros</li>
                    <li>Cumplimiento con estándares de seguridad industriales</li>
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
                    <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                    <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos</li>
                    <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                    <li><strong>Limitación:</strong> Restringir el procesamiento de tus datos</li>
                    <li><strong>Oposición:</strong> Oponerte al procesamiento para marketing directo</li>
                  </ul>
                  <p className="mt-4">
                    Para ejercer estos derechos, contacta con nosotros en privacy@rematerial.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Retención de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground space-y-4">
                  <p>Conservamos tu información personal durante:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Cuentas activas: Mientras mantengas tu cuenta</li>
                    <li>Datos de transacciones: 7 años (requisito legal)</li>
                    <li>Comunicaciones: 3 años después del último contacto</li>
                    <li>Datos de marketing: Hasta que retires el consentimiento</li>
                  </ul>
                  <p>
                    Después de estos períodos, eliminamos o anonimizamos la información de manera segura.
                  </p>
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
                <CardTitle>10. Cambios en esta Política</CardTitle>
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
                  <p className="mb-4">Para consultas sobre privacidad o ejercer tus derechos:</p>
                  <div className="space-y-2">
                    <p><strong>Delegado de Protección de Datos:</strong></p>
                    <p>Email: privacy@rematerial.com</p>
                    <p>Teléfono: +34 900 123 456</p>
                    <p>Dirección: Calle Principal 123, 28001 Madrid, España</p>
                  </div>
                  <p className="mt-4">
                    También puedes presentar una queja ante la Agencia Española de Protección de Datos (AEPD) si consideras que hemos incumplido la normativa de protección de datos.
                  </p>
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

export default Privacy;