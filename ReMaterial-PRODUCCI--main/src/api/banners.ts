import { supaGET } from './supa';
export type Banner = { id: string; title?: string; subtitle?: string|null; image_url?: string|null; link_url?: string|null; position?: number|null; active?: boolean; placement?: string; };
export const getHomeHeroBanners = () => supaGET<Banner[]>('banners', { select: '*', placement: 'eq.home_hero', order: 'position.asc' });
