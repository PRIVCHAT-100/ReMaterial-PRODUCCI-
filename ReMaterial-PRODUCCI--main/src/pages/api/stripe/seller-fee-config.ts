import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const bps = Number(process.env.PLATFORM_FEE_BPS || '200');
  res.status(200).json({ platform_fee_bps: bps });
}
