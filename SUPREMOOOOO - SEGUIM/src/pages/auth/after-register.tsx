
// src/pages/auth/after-register.tsx
import * as React from 'react';
import { useRouter } from 'next/router';
import { postJSON, go } from '@/lib/stripeClient';
import { getPlanIdsFromEnv, plansMeta } from '@/config/plans';

type Price = { id: string; unit_amount: number|null; currency: string; recurring?: { interval: string, interval_count: number } };

export default function AfterRegister() {
  const router = useRouter();
  const { type, userId, accountId: qAccountId } = router.query as { type?: string; userId?: string; accountId?: string };

  const [buyerId, setBuyerId] = React.useState('');
  const [accountId, setAccountId] = React.useState('');
  const [prices, setPrices] = React.useState<Price[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (userId) setBuyerId(userId);
    if (qAccountId) setAccountId(qAccountId);
  }, [userId, qAccountId]);

  React.useEffect(() => {
    fetch('/api/stripe/prices').then(r => r.json()).then(({data}) => setPrices(data || [])).catch(()=>setPrices([]));
  }, []);

  const ids = getPlanIdsFromEnv();
  const byId: Record<string, Price|undefined> = {
    [ids.BASIC]: prices.find(p => p.id === ids.BASIC),
    [ids.PRO]: prices.find(p => p.id === ids.PRO),
    [ids.BUSINESS]: prices.find(p => p.id === ids.BUSINESS),
  };

  async function subscribe(priceId: string) {
    try {
      setLoading(true);
      const body: any = { mode: 'subscription', priceId, metadata: { buyer_id: buyerId || 'demo-buyer' } };
      // Si ya creamos cuenta del vendedor, también podemos pasar sellerAccountId (opcional)
      if (accountId) body.sellerAccountId = accountId;
      const { url } = await postJSON('/api/stripe/create-checkout-session', body);
      go(url);
    } catch (e:any) { alert(e.message); } finally { setLoading(false); }
  }

  async function activarPagos() {
    try {
      setBusy('activar');
      if (!buyerId) throw new Error('Falta userId');
      const { accountId } = await postJSON('/api/stripe/create-connected-account', { userId: buyerId });
      setAccountId(accountId);
      const { url } = await postJSON('/api/stripe/onboarding-link', { accountId });
      go(url);
    } catch (e:any) { alert(e.message); } finally { setBusy(null); }
  }

  const planCards = Object.entries(plansMeta).map(([key, meta]) => {
    const pid = (ids as any)[key];
    const pr = byId[pid];
    const priceText = pr?.unit_amount ? `${(pr.unit_amount/100).toFixed(2)} ${pr.currency?.toUpperCase()}/${pr?.recurring?.interval || 'period'}` : '—';
    return (
      <div key={key} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <h3 style={{ margin: 0 }}>{meta.label}</h3>
        <p>{meta.blurb}</p>
        <ul style={{ paddingLeft: 18 }}>{meta.features.map((f,i)=><li key={i}>{f}</li>)}</ul>
        <p style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>{priceText}</p>
        <button onClick={()=> subscribe(pid)} disabled={!pid || loading}>Elegir {meta.label}</button>
      </div>
    );
  });

  const isCompany = (type || '').toLowerCase() === 'empresa';

  return (
    <div style={{ maxWidth: 980, margin: '40px auto', padding: 16 }}>
      <h1>¡Bienvenido!</h1>
      <p>Tu registro se ha completado correctamente.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label>userId</label>
          <input value={buyerId} onChange={(e)=>setBuyerId(e.target.value)} style={{ width:'100%', marginTop: 6 }}/>
        </div>
        <div>
          <label>seller accountId (acct_..., se crea al activar pagos)</label>
          <input value={accountId} onChange={(e)=>setAccountId(e.target.value)} style={{ width:'100%', marginTop: 6 }}/>
        </div>
      </div>

      {isCompany ? (
        <>
          <h2>1) Elige tu plan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            {planCards}
          </div>
          <h2>2) Activa cobros para tu empresa</h2>
          <p>Conecta tu cuenta Stripe para empezar a cobrar y recibir tus payouts.</p>
          <button onClick={activarPagos} disabled={!buyerId || busy==='activar'}>Activar pagos ahora</button>
        </>
      ) : (
        <>
          <h2>Elige tu plan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {planCards}
          </div>
        </>
      )}
    </div>
  );
}
