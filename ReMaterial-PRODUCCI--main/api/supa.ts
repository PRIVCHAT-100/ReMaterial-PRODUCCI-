type Query = Record<string, string | number | boolean | null | undefined>;

function buildUrl(path: string, query: Query = {}) {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL!;
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/rest/v1/${path.replace(/^\//, '')}`);
  Object.entries(query).forEach(([k, v]) => {
    if (v == null) return;
    url.searchParams.set(k, String(v));
  });
  return url.toString();
}

function getBearer(): string {
  // Optional: allow injecting a session access_token if you have it
  // @ts-ignore
  const injected = typeof window !== 'undefined' ? (window as any).__SUPABASE_ACCESS_TOKEN__ : null;
  return injected || import.meta.env.VITE_SUPABASE_ANON_KEY!;
}

export async function supaGET<T = any>(path: string, query: Query) {
  const url = buildUrl(path, query);
  const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

  const res = await fetch(url, {
    headers: {
      apikey,
      Authorization: `Bearer ${getBearer()}`,
      Accept: 'application/json',
    },
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) throw new Error(`[supaGET] ${res.status} ${res.statusText} :: ${text}`);
  try { return JSON.parse(text) as T; } catch { return undefined as unknown as T; }
}
