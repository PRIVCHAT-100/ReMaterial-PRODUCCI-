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

            <div className="space-y-3">
              <button
                className="w-full rounded-xl py-2 px-4 border hover:shadow transition"
                onClick={() => startCheckout(plan.monthly.priceId, { mode: 'subscription' })}
                disabled={!plan.monthly.priceId}
                title={!plan.monthly.priceId ? 'Configura el priceId mensual en src/lib/billing/plans.ts' : ''}
              >
                {plan.name} — {plan.monthly.amount} €/mes
              </button>
              <button
                className="w-full rounded-xl py-2 px-4 border hover:shadow transition"
                onClick={() => startCheckout(plan.yearly.priceId, { mode: 'subscription' })}
                disabled={!plan.yearly.priceId}
                title={!plan.yearly.priceId ? 'Configura el priceId anual en src/lib/billing/plans.ts' : ''}
              >
                {plan.name} — {plan.yearly.amount} €/año
              </button>
              {plan.includedKeywords > 0 && (
                <p className="text-xs text-muted-foreground">
                  Incluye {plan.includedKeywords} palabra(s) clave. Extra: {plan.extraKeywordMonthly} €/mes por keyword adicional.
                </p>
              )}
              {plan.includedKeywords === 0 && (
                <p className="text-xs text-muted-foreground">
                  Palabras clave: {plan.extraKeywordMonthly} €/mes por keyword (opcional).
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
