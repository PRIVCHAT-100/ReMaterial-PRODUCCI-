import React from "react";
import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-muted">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Cómo funciona ReMaterial</h1>
          <p className="mt-2">Guía rápida para entender el flujo de la plataforma y las mejores prácticas.</p>
        </header>

        <nav className="mb-10 border rounded-lg p-4 bg-background/70 backdrop-blur">
          <h2 className="font-semibold mb-2">Índice</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li><a className="hover:underline focus:underline" href="#que-es">¿Qué es ReMaterial?</a></li>
            <li><a className="hover:underline focus:underline" href="#registro">Registro y verificación</a></li>
            <li><a className="hover:underline focus:underline" href="#publicar">Publicar materiales</a></li>
            <li><a className="hover:underline focus:underline" href="#buscar-contactar">Buscar y contactar</a></li>
            <li><a className="hover:underline focus:underline" href="#transacciones">Transacciones y comisiones</a></li>
            <li><a className="hover:underline focus:underline" href="#normativa">Normativa y buenas prácticas</a></li>
            <li><a className="hover:underline focus:underline" href="#privacidad">Privacidad y seguridad</a></li>
            <li><a className="hover:underline focus:underline" href="#faq">FAQ y soporte</a></li>
          </ol>
        </nav>

        <section id="que-es" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">¿Qué es ReMaterial?</h2>
          <p className="text-sm">
            ReMaterial es un marketplace B2B para dar salida a materiales residuales o secundarios,
            conectando generadores con compradores y fomentando la economía circular.
          </p>
        </section>

        <section id="registro" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Registro y verificación</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Regístrate con email corporativo.</li>
            <li>Completa tu perfil de empresa en{" "}
              <Link className="hover:underline focus:underline" to="/settings?tab=account">Configuración &gt; Cuenta</Link>.
            </li>
            <li>Aporta CIF/NIF, sector, web, teléfono, logo y certificaciones para generar confianza.</li>
          </ul>
        </section>

        <section id="publicar" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Publicar materiales</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Ve a <Link className="hover:underline focus:underline" to="/sell">Publicar</Link> y completa la ficha: título, categoría, fotos, localización, cantidad, precio y condiciones.</li>
            <li>Añade información de normativa aplicable (gestión de residuos, permisos, etc.).</li>
          </ul>
        </section>

        <section id="buscar-contactar" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Buscar y contactar</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Explora <Link className="hover:underline focus:underline" to="/explore">categorías</Link> o usa la búsqueda.</li>
            <li>Desde la ficha del material, usa <b>Contactar</b> para abrir un chat seguro.</li>
          </ul>
        </section>

        <section id="transacciones" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Transacciones y comisiones</h2>
          <p className="text-sm">
            Antes de cerrar un acuerdo verás los costes estimados. Consulta siempre los{" "}
            <Link className="hover:underline focus:underline" to="/terms">Términos y condiciones</Link> para el detalle de comisiones y políticas.
          </p>
        </section>

        <section id="normativa" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Normativa y buenas prácticas</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Describe con precisión el material y su estado.</li>
            <li>Cumple la normativa local/estatal aplicable para transporte y gestión.</li>
            <li>Usa contratos claros y conserva justificantes.</li>
          </ul>
        </section>

        <section id="privacidad" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Privacidad y seguridad</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Activa controles de seguridad en{" "}
              <Link className="hover:underline focus:underline" to="/settings?tab=security">Configuración &gt; Seguridad</Link>.
            </li>
            <li>No compartas datos sensibles hasta que exista acuerdo.</li>
          </ul>
        </section>

        <section id="faq" className="mb-8">
          <h2 className="text-xl font-semibold mb-2">FAQ y soporte</h2>
          <p className="text-sm">
            Consulta el{" "}
            <Link className="hover:underline focus:underline" to="/help">Centro de ayuda</Link> o escribe a{" "}
            <a className="hover:underline focus:underline" href="mailto:soporte@rematerial.es">soporte@rematerial.es</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
