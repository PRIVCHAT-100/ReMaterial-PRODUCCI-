// src/lib/stripeClient.ts
export async function postJSON<T = any>(url: string, body: any): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Error en la petición");
  return data;
}
export function go(url: string) { window.location.href = url; }
export function toCents(amount: number) { return Math.round(amount * 100); }
