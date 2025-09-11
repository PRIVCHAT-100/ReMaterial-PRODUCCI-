import { useEffect, useState } from 'react';
import { getHomeHeroBanners } from '@/api/banners';

export default function HomeBannersExample() {
  const [banners, setBanners] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getHomeHeroBanners();
        setBanners(data);
      } catch (e: any) {
        console.error('[banners] error:', e?.message, e);
        setError(e?.message ?? 'Error cargando banners');
      }
    })();
  }, []);

  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h3>Home Hero Banners</h3>
      <pre>{JSON.stringify(banners, null, 2)}</pre>
    </div>
  );
}
