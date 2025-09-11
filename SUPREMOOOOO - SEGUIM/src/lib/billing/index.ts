export async function startCheckout(priceId: string) {
  const resp = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, mode: 'subscription' }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || 'No se pudo iniciar el pago');
  }
  const data = await resp.json();
  if (data?.url) {
    window.location.href = data.url;
  } else {
    throw new Error('URL de checkout no recibida');
  }
}