import { supaGET } from './supa';
export const getMyConversations = (userId: string) => supaGET<any[]>('conversations', { select: '*', or: `(buyer_id.eq.${userId},seller_id.eq.${userId})` });
