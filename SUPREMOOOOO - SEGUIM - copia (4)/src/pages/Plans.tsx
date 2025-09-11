// src/pages/Plans.tsx
import React from 'react';
import { PLANS } from '@/lib/billing/plans';
import { startCheckout } from '@/lib/billing';

export default function Plans() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-8">Planes de suscripción</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} className="border rounded-2xl p-6 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-medium">{plan.name}</h2>
              <span className="text-sm text-muted-foreground">
                {plan.limits.products === 'unlimited' ? 'Ilimitados' : `Hasta ${plan.limits.products}`}
              </span>
            </div>

            <ul className="text-sm space-y-2 mb-4">
              {plan.features.map((f, i) => (
                <li key={i} className="leading-snug">• {f}</li>
              ))}
            </ul>

            <div className="space-y-2">
              <button
                className="w-full h-10 rounded-lg bg-black text-white hover:opacity-90 transition"
                onClick={() => startCheckout(plan.monthly.priceId)}
                disabled={!plan.monthly.priceId}
                title={!plan.monthly.priceId ? 'Configura VITE_PRICE_* en .env.local / Vercel' : ''}
              >
                {plan.monthly.amount.toFixed(2)} €/mes
              </button>
              <button
                className="w-full h-10 rounded-lg border hover:bg-gray-50 transition"
                onClick={() => startCheckout(plan.yearly.priceId)}
                disabled={!plan.yearly.priceId}
                title={!plan.yearly.priceId ? 'Configura VITE_PRICE_* en .env.local / Vercel' : ''}
              >
                {plan.yearly.amount.toFixed(2)} €/año
              </button>

              {plan.includedKeywords > 0 && (
                <p className="text-xs text-muted-foreground">
                  Incluye {plan.includedKeywords} palabra(s) clave destacada(s).
                </p>
              )}
              {plan.keywordExtraPriceId && (
                <button
                  className="w-full h-10 rounded-lg border-dashed border hover:bg-gray-50 transition"
                  onClick={() => startCheckout(plan.keywordExtraPriceId!)}
                  title="Añadir una palabra clave extra (9,99€/mes)"
                >
                  + Keyword extra ({plan.extraKeywordMonthly.toFixed(2)} €/mes)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
