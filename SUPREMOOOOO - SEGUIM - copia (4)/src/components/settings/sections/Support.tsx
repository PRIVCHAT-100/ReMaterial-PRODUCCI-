import React from "react";
import { Link } from "react-router-dom";

export default function SupportSection() {
  return (
    <section id="support" className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Soporte</h2>
        <p className="text-sm">Encuentra ayuda y documentación.</p>
      </header>

      <div id="how-it-works" className="border rounded-lg p-4">
        <h3 className="font-medium">Cómo funciona</h3>
        <p className="text-sm">Guía oficial para entender la plataforma y buenas prácticas.</p>
        <div className="mt-2 flex gap-3">
          <Link to="/how-it-works" className="hover:underline focus:underline" target="_blank" rel="noopener">
            Abrir guía
          </Link>
          <Link to="/help" className="hover:underline focus:underline">
            Centro de ayuda / FAQ
          </Link>
        </div>
      </div>

      {/* Mantén aquí cualquier otro bloque existente de soporte */}
    </section>
  );
}
