import React, { useEffect, useState } from 'react';
import { getMySubscription } from '@/lib/billing';

export default function CompanyPlanGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sub = await getMySubscription();
        const tier = (sub?.plan_tier || 'free').toLowerCase();
        setAllowed(tier === 'premium' || tier === 'pro_plus' || tier === 'basic'); // permite todos menos 'free' si quieres
      } catch (e: any) {
        setError(e?.message || 'No se pudo validar el plan');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="rounded-xl border p-4">Comprobando tu plan…</div>;
  if (error) return <div className="rounded-xl border p-4 text-red-600">{error}</div>;
  if (!allowed) {
    window.location.href = '/onboarding/plan';
    return null;
  }
  return <>{children}</>;
}
