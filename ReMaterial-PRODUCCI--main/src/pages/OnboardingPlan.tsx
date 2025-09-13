import React from 'react';
import { PLAN_FEATURES, startSubscription, VITE_PRICE_BASIC_MONTHLY, VITE_PRICE_PREMIUM_MONTHLY, VITE_PRICE_PRO_PLUS_MONTHLY } from '@/lib/billing';

function PlanCard({ title, price, features, onSelect }: { title: string; price: string; features: string[]; onSelect: () => void; }) {
  return (
    <div className="rounded-2xl shadow p-6 border bg-white flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-3xl font-bold mt-2">{price}<span className="text-base font-medium">/mes</span></p>
        <ul className="mt-4 space-y-2 text-sm">
          {features.map((f, i) => <li key={i} className="flex gap-2"><span>•</span><span>{f}</span></li>)}
        </ul>
      </div>
      <button onClick={onSelect} className="mt-6 rounded-xl bg-black text-white px-4 py-2 hover:opacity-90">Elegir</button>
    </div>
  );
}

export default function OnboardingPlan() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Elige tu plan</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <PlanCard
          title="Basic"
          price="29,99€"
          features={PLAN_FEATURES.basic}
          onSelect={() => startSubscription(VITE_PRICE_BASIC_MONTHLY, { successPath: '/settings/billing' })}
        />
        <PlanCard
          title="Premium"
          price="44,99€"
          features={PLAN_FEATURES.premium}
          onSelect={() => startSubscription(VITE_PRICE_PREMIUM_MONTHLY, { successPath: '/settings/billing' })}
        />
        <PlanCard
          title="Pro+"
          price="69,99€"
          features={PLAN_FEATURES.pro_plus}
          onSelect={() => startSubscription(VITE_PRICE_PRO_PLUS_MONTHLY, { successPath: '/settings/billing' })}
        />
      </div>
    </div>
  );
}
