import { supaGET } from './supa';
export const getActiveProducts = () => supaGET<any[]>('products', { select: '*,seller:profiles!products_seller_id_fkey(id,first_name,last_name,company_name)', status: 'eq.active', order: 'created_at.desc' });
