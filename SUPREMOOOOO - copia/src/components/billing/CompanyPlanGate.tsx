// src/components/billing/CompanyPlanGate.tsx
import React, { useEffect, useState } from "react";
import { getMySubscription, openCustomerPortal, PLAN_FEATURES } from "@/lib/billing";
import { supabase } from "@/lib/supabase/client";

type Sub = {
  plan_tier: "free" | "basic" | "pro";
  status: string | null;
};

export default function CompanyPlanGate({
  children,
  onSwitchToBuyer,
}: {
  children: React.ReactNode;
  onSwitchToBuyer?: () => Promise<void> | void;
}) {
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

  if (loading) return <div className="rounded-xl border p-4">Comprobando tu plan...</div>;
  if (error) return <div className="rounded-xl border p-4 text-red-600">{error}</div>;

  const tier = sub?.plan_tier || "free";
  const ok = tier === "basic" || tier === "pro";

  if (ok) return <>{children}</>;

  return (
    <div className="rounded-2xl border p-6 bg-white shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">Necesitas un plan activo para gestionar la empresa</h2>
      <p className="text-slate-600">
        Para crear y mantener el perfil de empresa se requiere <strong>Basic</strong> o <strong>Pro</strong>.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {(["free","basic","pro"] as const).map(t => (
          <div key={t} className="rounded-xl border p-4">
            <h3 className="font-semibold uppercase">{t}</h3>
            <ul className="mt-2 text-sm space-y-1">
              {PLAN_FEATURES[t].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1">•</span><span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => openCustomerPortal()}
          className="rounded-xl border px-3 py-2 hover:shadow"
        >
          Cambiar / activar plan
        </button>

        <a
          className="rounded-xl border px-3 py-2 hover:shadow"
          href="/onboarding/plan?context=company"
        >
          Elegir plan ahora
        </a>

        <button
          onClick={async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error("No autenticado");
              // Cambiar a comprador: is_seller = false
              const { error } = await supabase
                .from("profiles")
                .update({ is_seller: false })
                .eq("id", user.id);
              if (error) throw error;
              if (onSwitchToBuyer) await onSwitchToBuyer();
              // Envía al área de compradores (ajusta ruta si es distinta)
              window.location.href = "/explorar";
            } catch (e: any) {
              alert(e?.message || "No se pudo cambiar a comprador");
            }
          }}
          className="rounded-xl border px-3 py-2 hover:shadow"
        >
          Cambiar a comprador
        </button>
      </div>
    </div>
  );
}