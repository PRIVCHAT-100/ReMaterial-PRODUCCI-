// src/pages/Settings/Billing.tsx
import React from "react";
import { getMySubscription, openCustomerPortal, PLAN_FEATURES } from "@/lib/billing";
import { useEffect, useState } from "react";

type Sub = {
  plan_tier: "free" | "basic" | "pro";
  status: string | null;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id: string | null;
};

export default function BillingSettings() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Sub | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await getMySubscription();
        setSub(s as any);
      } catch (e: any) {
        setError(e?.message || "No se pudo cargar tu suscripción");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Facturación</h1>
      {loading && <p className="mt-4">Cargando...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 space-y-8">
          <section className="rounded-2xl border p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold">Tu plan actual</h2>
            <p className="mt-1 text-slate-600">Plan: <strong className="uppercase">{sub?.plan_tier || "free"}</strong></p>
            <p className="mt-1 text-slate-600">Estado: {sub?.status || "inactive"}</p>
            {sub?.current_period_end && (
              <p className="mt-1 text-slate-600">
                Renueva el: {new Date(sub.current_period_end).toLocaleDateString()}
                {sub?.cancel_at_period_end ? " (cancelación al final del periodo)" : ""}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                className="rounded-xl border px-3 py-2 hover:shadow"
                onClick={() => openCustomerPortal()}
              >
                Cambiar de plan / métodos de pago
              </button>
              <a
                className="rounded-xl border px-3 py-2 hover:shadow"
                href="/onboarding/plan"
              >
                Ver otros planes
              </a>
            </div>
          </section>

          <section className="rounded-2xl border p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold">Características por plan</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              {(["free","basic","pro"] as const).map(tier => (
                <div key={tier} className="rounded-xl border p-4">
                  <h3 className="font-semibold uppercase">{tier}</h3>
                  <ul className="mt-2 text-sm space-y-1">
                    {PLAN_FEATURES[tier].map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1">•</span><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}