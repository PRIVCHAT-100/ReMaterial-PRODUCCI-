import { supaGET } from './supa';
export const getFavoritesProductIds = async (userId: string) => (await supaGET<{product_id:string}[]>('favorites', { select: 'product_id', user_id: `eq.${userId}` })).map(r=>r.product_id);
