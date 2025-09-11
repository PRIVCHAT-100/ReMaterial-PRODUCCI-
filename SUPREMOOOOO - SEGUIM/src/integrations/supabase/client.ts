import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window { __supabaseClient?: SupabaseClient }
}

const SUPABASE_URL = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!window.__supabaseClient) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[supabase] Falta SUPABASE_URL o ANON KEY. Define VITE_NEXT_PUBLIC_SUPABASE_URL y VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  window.__supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'rematerial_auth',
    }
  });
}

export const supabase = window.__supabaseClient!;
