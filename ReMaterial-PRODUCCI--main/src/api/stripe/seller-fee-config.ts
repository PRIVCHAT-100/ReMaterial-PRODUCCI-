
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const bps = Number(process.env.PLATFORM_FEE_BPS || '200');
  res.status(200).json({ platform_fee_bps: bps });
}
