// Global fetch interceptor for Supabase REST calls.
// Adds apikey/Authorization automatically and logs real error messages.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (typeof window !== 'undefined' && SUPABASE_URL && ANON) {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as Request).url;

    // Only touch Supabase REST calls
    if (url && SUPABASE_URL && url.startsWith(SUPABASE_URL)) {
      const headers = new Headers(init?.headers ?? {});
      if (!headers.has('apikey')) headers.set('apikey', ANON as string);
      if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${ANON}`);
      if (!headers.has('Accept')) headers.set('Accept', 'application/json');

      init = { ...init, headers };
    }

    const res = await originalFetch(input as any, init);

    // Surface real PostgREST error to console (instead of the generic "CORS")
    try {
      if (!res.ok && url?.includes('/rest/v1/')) {
        const clone = res.clone();
        const text = await clone.text().catch(() => '');
        console.error('[Supabase REST error]', res.status, res.statusText, text);
      }
    } catch {}
    return res;
  };
}
