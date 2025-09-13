import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  PLAN_FEATURES,
  startSubscription,
  startOneTimePurchase,
  VITE_PRICE_BASIC_MONTHLY,
  VITE_PRICE_PREMIUM_MONTHLY,
  VITE_PRICE_PRO_PLUS_MONTHLY,
  VITE_PRICE_BASIC_YEARLY,
  VITE_PRICE_PREMIUM_YEARLY,
  VITE_PRICE_PRO_PLUS_YEARLY,
  VITE_PRICE_KEYWORD_EXTRA,
} from '../lib/billing';

type CardProps = {
  title: string;
  price: string;
  features: string[];
  onSelect: () => void;
  disabled?: boolean;
  sublabel?: string;
};

function PlanCard({ title, price, features, onSelect, disabled, sublabel }: CardProps) {
  return (
    <div className="rounded-2xl shadow p-6 border bg-white flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-3xl font-bold mt-2">
          {price}
          {sublabel ? <span className="text-sm font-medium ml-2 opacity-70">{sublabel}</span> : <span className="text-base font-medium">/mes</span>}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {features?.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span>•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onSelect}
        disabled={!!disabled}
        className={`mt-6 rounded-xl px-4 py-2 ${disabled ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:opacity-90'}`}
        title={disabled ? 'Configura los price IDs en .env (VITE_PRICE_*)' : undefined}
      >
        {disabled ? 'No disponible' : 'Elegir'}
      </button>
    </div>
  );
}


export default function Plans() {
  const navigate = useNavigate && typeof useNavigate === 'function' ? useNavigate() : undefined as any;

  const monthly = [
    { title: 'Basic',   price: '29,99€', id: VITE_PRICE_BASIC_MONTHLY,   features: PLAN_FEATURES.basic },
    { title: 'Premium', price: '44,99€', id: VITE_PRICE_PREMIUM_MONTHLY, features: PLAN_FEATURES.premium },
    { title: 'Pro+',    price: '69,99€', id: VITE_PRICE_PRO_PLUS_MONTHLY,features: PLAN_FEATURES.pro_plus },
  ] as const;

  const yearly = [
    { title: 'Basic (Anual)',   price: '299,90€', id: VITE_PRICE_BASIC_YEARLY,   features: PLAN_FEATURES.basic },
    { title: 'Premium (Anual)', price: '449,90€', id: VITE_PRICE_PREMIUM_YEARLY, features: PLAN_FEATURES.premium },
    { title: 'Pro+ (Anual)',    price: '699,90€', id: VITE_PRICE_PRO_PLUS_YEARLY,features: PLAN_FEATURES.pro_plus },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Elige tu plan</h1>

      {/* Mensuales */}
      <div className="grid md:grid-cols-3 gap-6">
        {monthly.map((p) => (
          <PlanCard
            key={p.title}
            title={p.title}
            price={p.price}
            features={p.features}
            disabled={!p.id}
            onSelect={() => p.id && startSubscription(p.id, { successPath: '/settings/billing', cancelPath: '/settings/billing' })}
          />
        ))}
      </div>

      {/* Anuales */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Planes anuales</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {yearly.map((p) => (
          <PlanCard
            key={p.title}
            title={p.title}
            price={p.price}
            features={p.features}
            sublabel="(equiv. 10 meses)"
            disabled={!p.id}
            onSelect={() => p.id && startSubscription(p.id, { successPath: '/settings/billing', cancelPath: '/settings/billing' })}
          />
        ))}
      </div>

      {/* Add-on: Palabra clave extra */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Extras</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <PlanCard
          title="Keyword extra"
          price="9,99€"
          features={['Añade 1 palabra clave destacada extra a tu plan']}
          disabled={!VITE_PRICE_KEYWORD_EXTRA}
          onSelect={() => VITE_PRICE_KEYWORD_EXTRA && startOneTimePurchase(VITE_PRICE_KEYWORD_EXTRA, {
            successPath: '/settings/billing',
            cancelPath: '/settings/billing',
            metadata: { addon: 'keyword_extra' },
          })}
          sublabel="(pago único)"
        />
      </div>
    </div>
  );
}
