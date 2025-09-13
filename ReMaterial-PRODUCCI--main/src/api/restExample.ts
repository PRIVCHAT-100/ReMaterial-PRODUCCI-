// Example of PostgREST direct call with proper headers and encoded params (optional).
export async function getHomeHeroBannersREST() {
  const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/banners`);
  url.searchParams.set('select', '*');
  url.searchParams.set('placement', 'eq.home_hero');
  url.searchParams.set('order', 'position.asc');

  const apikey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
  const res = await fetch(url.toString(), {
    headers: {
      apikey,
      Authorization: `Bearer ${apikey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'return=representation',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`REST error ${res.status} - ${text}`);
  }
  return res.json();
}
