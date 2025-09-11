export function fixSupabaseAuthUrl() {
  try {
    if (location.hash.includes('error=')) {
      history.replaceState({}, document.title, location.pathname + location.search);
    }
    Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
  } catch {}
}
