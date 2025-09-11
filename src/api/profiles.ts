import { supaGET } from './supa';
export const getLogoUrl = (id: string) => supaGET<any[]>('profiles', { select: 'logo_url', id: `eq.${id}`, limit: 1 });
