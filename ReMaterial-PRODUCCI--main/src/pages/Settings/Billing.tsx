import React from 'react';
import BillingPlansInline from '../../components/billing/BillingPlansInline';

// Nota: Este archivo añade un bloque de selección de plan dentro de Settings → Billing.
// Si ya tenías una UI propia en esta página, este bloque es 100% adicional y no rompe lo existente.

const BillingPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Facturación</h1>

      {/* Aquí se mantiene cualquier contenido existente de tu página (si lo hubiera) */}
      {/* Bloque adicional: selección rápida de plan */}
      <BillingPlansInline />
    </div>
  );
};

export default BillingPage;