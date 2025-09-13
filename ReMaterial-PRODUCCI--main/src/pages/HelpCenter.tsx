import React from "react";
import { Link } from "react-router-dom";

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-muted">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Centro de ayuda / FAQ</h1>
          <p className="mt-2">
            Respuestas rápidas a las dudas más comunes. Si no encuentras lo que buscas, contáctanos en{" "}
            <a href="mailto:soporte@rematerial.es" className="hover:underline focus:underline">
              soporte@rematerial.es
            </a>.
          </p>
        </header>

        <section className="mb-10">
          <label className="block text-sm font-medium mb-2">Busca en las preguntas</label>
          <input
            type="search"
            placeholder="Ej. verificar empresa, subir producto, comisiones..."
            className="w-full border rounded-md p-2"
            onChange={() => {}}
          />
          <p className="text-xs mt-2">(La búsqueda local se añadirá más adelante.)</p>
        </section>

        <section className="space-y-6">
          <details className="group border rounded-lg p-4 bg-background/70 backdrop-blur">
            <summary className="cursor-pointer font-medium">¿Qué es ReMaterial y para qué sirve?</summary>
            <div className="mt-3 text-sm">
              ReMaterial conecta generadores de residuos/recursos con compradores interesados, facilitando acuerdos y revalorizando materiales.
            </div>
          </details>

          <details className="group border rounded-lg p-4 bg-background/70 backdrop-blur">
            <summary className="cursor-pointer font-medium">¿Cómo me registro y verifico mi empresa?</summary>
            <div className="mt-3 text-sm space-y-2">
              <p>
                Regístrate con tu email corporativo. En{" "}
                <Link className="hover:underline focus:underline" to="/settings?tab=account">
                  Configuración &gt; Cuenta
                </Link>{" "}
                podrás completar y verificar los datos de tu empresa.
              </p>
              <p>Los campos recomendados: CIF/NIF, sector, web, teléfono, logo y certificaciones.</p>
            </div>
          </details>

          <details className="group border rounded-lg p-4 bg-background/70 backdrop-blur" id="publicar">
            <summary className="cursor-pointer font-medium">¿Cómo publico un material?</summary>
            <div className="mt-3 text-sm list-disc pl-4 space-y-2">
              <p>
                Ve a{" "}
                <Link className="hover:underline focus:underline" to="/sell">
                  Publicar
                </Link>{" "}
                y completa: título, categoría, fotos, localización, cantidad y precio.
              </p>
              <p>Describe el estado, normativa aplicable y condiciones de recogida/entrega.</p>
            </div>
          </details>

          <details className="group border rounded-lg p-4 bg-background/70 backdrop-blur">
            <summary className="cursor-pointer font-medium">¿Cómo contacto con una empresa vendedora?</summary>
            <div className="mt-3 text-sm">
              Desde la ficha del material, pulsa <b>Contactar</b> para abrir un chat seguro. No compartas datos sensibles hasta cerrar un acuerdo.
            </div>
          </details>

          <details className="group border rounded-lg p-4 bg-background/70 backdrop-blur">
            <summary className="cursor-pointer font-medium">¿Cuáles son los precios y comisiones?</summary>
            <div className="mt-3 text-sm">
              Consulta{" "}
              <Link className="hover:underline focus:underline" to="/terms">
                Términos y condiciones
              </Link>
              . Las comisiones pueden actualizarse; siempre verás el detalle antes de confirmar.
            </div>
          </details>

          <details className="group border rounded-lg p-4 bg-background/70 backdrop-blur">
            <summary className="cursor-pointer font-medium">Privacidad y seguridad</summary>
            <div className="mt-3 text-sm">
              Cuidamos tus datos. Revisa la{" "}
              <Link className="hover:underline focus:underline" to="/privacy">
                Política de privacidad
              </Link>{" "}
              y usa contraseñas robustas. Activa notificaciones de login y revisa sesiones activas en{" "}
              <Link className="hover:underline focus:underline" to="/settings?tab=security">
                Configuración &gt; Seguridad
              </Link>
              .
            </div>
          </details>

          <details className="group border rounded-lg p-4 bg-background/70 backdrop-blur">
            <summary className="cursor-pointer font-medium">Necesito ayuda</summary>
            <div className="mt-3 text-sm">
              Escríbenos a{" "}
              <a className="hover:underline focus:underline" href="mailto:soporte@rematerial.es">
                soporte@rematerial.es
              </a>{" "}
              o visita la guía{" "}
              <Link className="hover:underline focus:underline" to="/how-it-works">
                Cómo funciona
              </Link>
              .
            </div>
          </details>
        </section>
      </main>
    </div>
  );
}
