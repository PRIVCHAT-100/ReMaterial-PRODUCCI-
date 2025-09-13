// Common utilities for CORS and origin detection
export function detectOrigin(req: any): string {
  const headersObj: any = req?.headers || {};
  const hasGet = headersObj && typeof headersObj.get === 'function';
  const get = (k: string) => hasGet ? headersObj.get(k) : (headersObj[k.toLowerCase()] ?? headersObj[k]);

  let origin = (get?.('origin') || get?.('referer') || '') as string;

  if (origin) {
    try { origin = new URL(origin).origin; } catch { /* ignore bad referers */ }
  }
  if (!origin) {
    origin =
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173');
  }
  return origin;
}

export function setCors(res: any, origin: string) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}
