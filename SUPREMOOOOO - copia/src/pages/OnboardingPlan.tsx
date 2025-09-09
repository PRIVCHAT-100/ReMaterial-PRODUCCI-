// src/pages/OnboardingPlan.tsx
import React from "react";
import { startSubscription, PLAN_FEATURES } from "@/lib/billing";

const PRICE_BASIC = import.meta.env.VITE_STRIPE_PRICE_BASIC as string;
const PRICE_PRO = import.meta.env.VITE_STRIPE_PRICE_PRO as string;

function PlanCard({
  title,
  priceMonthly,
  features,
  cta,
  onSelect,
}: {
  title: string;
  priceMonthly: string;
  features: string[];
  cta: string;
  onSelect: () => void;
}) {
  return (
    <div className="rounded-2xl shadow p-6 border bg-white flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-3xl font-bold mt-2">{priceMonthly}<span className="text-base font-medium">/mes</span></p>
        <ul className="mt-4 space-y-2 text-sm">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onSelect}
        className="mt-6 w-full rounded-xl py-2 px-3 border hover:shadow font-medium"
      >
        {cta}
      </button>
    </div>
  );
}

export default function OnboardingPlan() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Elige tu plan</h1>
      <p className="text-slate-600 mt-2">Podrás cambiar de plan en cualquier momento desde Configuración → Facturación.</p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <PlanCard
          title="Free"
          priceMonthly="0€"
          features={PLAN_FEATURES.free}
          cta="Seguir con Free"
          onSelect={() => {
            // Free: redirige a explorar (sin Stripe)
            window.location.href = "/explorar";
          }}
        />

        <PlanCard
          title="Basic"
          priceMonthly={import.meta.env.VITE_PLAN_BASIC_PRICE || "9€"}
          features={PLAN_FEATURES.basic}
          cta="Empezar Basic"
          onSelect={() => startSubscription(PRICE_BASIC, { successPath: "/settings/billing" })}
        />

        <PlanCard
          title="Pro"
          priceMonthly={import.meta.env.VITE_PLAN_PRO_PRICE || "29€"}
          features={PLAN_FEATURES.pro}
          cta="Empezar Pro"
          onSelect={() => startSubscription(PRICE_PRO, { successPath: "/settings/billing" })}
        />
      </div>
    </div>
  );
}