import React, { useEffect, useState } from 'react';
import { getMySubscription, openCustomerPortal, getIncludedKeywordsForPlan } from '@/lib/billing';

type Sub = {
  plan_tier: 'free' | 'basic' | 'premium' | 'pro' | 'pro_plus' | string | null;
  status: string | null;
  current_period_end: string | null;
};

export default function SettingsBilling(){
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sub, setSub] = useState<Sub | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMySubscription();
        setSub(data as any);
      } catch (e:any) {
        setError(e?.message || 'No se pudo cargar tu suscripción');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Facturación y suscripción</h1>

      {loading && <p className="text-sm">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="rounded-2xl border p-4 mb-6 bg-white">
            <p className="text-sm text-muted-foreground">Gestiona tu plan, método de pago y facturas.</p>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 rounded-lg border hover:shadow" onClick={() => openCustomerPortal()}>
                Gestionar suscripción
              </button>
              <a href="/plans" className="px-4 py-2 rounded-lg border hover:shadow">Ver planes</a>
            </div>
          </div>

          <div className="rounded-2xl border p-4 bg-white">
            <h2 className="font-medium mb-2">Tu plan actual</h2>
            <p className="text-sm text-muted-foreground">Plan: <strong className="uppercase">{sub?.plan_tier || 'free'}</strong></p>
            <p className="text-sm text-muted-foreground">Estado: {sub?.status || 'inactive'}</p>
            {sub?.current_period_end && (
              <p className="text-sm text-muted-foreground">
                Próxima renovación: {new Date(sub.current_period_end).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Palabras clave incluidas gratis: <strong>{getIncludedKeywordsForPlan(sub?.plan_tier)}</strong>
            </p>
          </div>
        </>
      )}
    </div>
  );
}