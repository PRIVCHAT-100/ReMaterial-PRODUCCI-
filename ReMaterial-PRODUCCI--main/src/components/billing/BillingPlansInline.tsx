import React, { useMemo, useState } from 'react';

type Plan = {
  key: string;
  title: string;
  monthlyEnv: string;
  yearlyEnv: string;
  perks: string[];
};

const plans: Plan[] = [
  {
    key: 'basic',
    title: 'Básico',
    monthlyEnv: 'VITE_PRICE_BASIC_MONTHLY',
    yearlyEnv: 'VITE_PRICE_BASIC_YEARLY',
    perks: ['Hasta 20 productos', 'Soporte estándar'],
  },
  {
    key: 'premium',
    title: 'Premium',
    monthlyEnv: 'VITE_PRICE_PREMIUM_MONTHLY',
    yearlyEnv: 'VITE_PRICE_PREMIUM_YEARLY',
    perks: ['Hasta 40 productos', 'Gestión de inventario', '1 palabra clave'],
  },
  {
    key: 'pro_plus',
    title: 'Pro+',
    monthlyEnv: 'VITE_PRICE_PRO_PLUS_MONTHLY',
    yearlyEnv: 'VITE_PRICE_PRO_PLUS_YEARLY',
    perks: ['Productos ilimitados', '3 palabras clave'],
  },
];

async function createCheckout(priceId: string) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error creando la sesión de pago');
  }
  const json = await res.json();
  if (json?.url) {
    window.location.href = json.url;
  } else {
    // Fallback por si el servidor devuelve sessionId
    if (json?.sessionId) {
      window.location.href = `/stripe/success?session_id=${json.sessionId}`;
    } else {
      throw new Error('Respuesta inesperada del servidor');
    }
  }
}

const BillingPlansInline: React.FC = () => {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const env = useMemo(() => ({
    BASIC_M: import.meta.env.VITE_PRICE_BASIC_MONTHLY,
    BASIC_Y: import.meta.env.VITE_PRICE_BASIC_YEARLY,
    PREM_M:  import.meta.env.VITE_PRICE_PREMIUM_MONTHLY,
    PREM_Y:  import.meta.env.VITE_PRICE_PREMIUM_YEARLY,
    PRO_M:   import.meta.env.VITE_PRICE_PRO_PLUS_MONTHLY,
    PRO_Y:   import.meta.env.VITE_PRICE_PRO_PLUS_YEARLY,
  }), []);

  const getEnvValue = (name: string): string | undefined => {
    // @ts-ignore
    return import.meta.env?.[name];
  };

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Planes</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => {
          const monthlyId = getEnvValue(p.monthlyEnv);
          const yearlyId = getEnvValue(p.yearlyEnv);
          const unavailable = !monthlyId && !yearlyId;
          return (
            <div key={p.key} className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
              <h3 className="text-lg font-medium">{p.title}</h3>
              <ul className="text-sm text-slate-600 list-disc ml-5 mt-2">
                {p.perks.map((perk) => <li key={perk}>{perk}</li>)}
              </ul>
              <div className="flex gap-2 mt-4">
                <button
                  className="px-3 py-2 rounded-xl border border-slate-200 shadow hover:bg-slate-50 disabled:opacity-50"
                  disabled={!monthlyId || loadingKey === `${p.key}:m`}
                  onClick={async () => {
                    if (!monthlyId) return;
                    try {
                      setLoadingKey(`${p.key}:m`);
                      await createCheckout(monthlyId);
                    } finally {
                      setLoadingKey(null);
                    }
                  }}
                >
                  {loadingKey === `${p.key}:m` ? 'Abriendo…' : 'Mensual'}
                </button>
                <button
                  className="px-3 py-2 rounded-xl border border-slate-200 shadow hover:bg-slate-50 disabled:opacity-50"
                  disabled={!yearlyId || loadingKey === `${p.key}:y`}
                  onClick={async () => {
                    if (!yearlyId) return;
                    try {
                      setLoadingKey(`${p.key}:y`);
                      await createCheckout(yearlyId);
                    } finally {
                      setLoadingKey(null);
                    }
                  }}
                >
                  {loadingKey === `${p.key}:y` ? 'Abriendo…' : 'Anual'}
                </button>
              </div>
              {unavailable && (
                <p className="text-xs text-amber-600 mt-2">
                  Configura los price IDs en variables de entorno para habilitar este plan.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BillingPlansInline;