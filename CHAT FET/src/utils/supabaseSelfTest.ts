import { supaGET } from '@/api/supa';

export async function supabaseSelfTest() {
  try {
    const ping = await supaGET<any>('products', { select: 'id', limit: 1 });
    console.info('[supabaseSelfTest] OK products ->', ping);
  } catch (e:any) {
    console.error('[supabaseSelfTest] ERROR products:', e?.message || e);
  }
  try {
    const ping2 = await supaGET<any>('banners', { select: 'id', limit: 1 });
    console.info('[supabaseSelfTest] OK banners ->', ping2);
  } catch (e:any) {
    console.error('[supabaseSelfTest] ERROR banners:', e?.message || e);
  }
}
