import { useEffect, useState } from 'react';
import { getActiveProducts } from '@/api/products';
import { getFavoritesProductIds } from '@/api/favorites';

export default function ProductGridExample({ userId }: { userId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, fav] = await Promise.all([
          getActiveProducts(),
          getFavoritesProductIds(userId),
        ]);
        setProducts(p);
        setFavIds(fav);
      } catch (e: any) {
        console.error('[products] error:', e?.message, e);
        setError(e?.message ?? 'Error cargando productos');
      }
    })();
  }, [userId]);

  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <h3>Products</h3>
      <pre>{JSON.stringify({ products, favIds }, null, 2)}</pre>
    </div>
  );
}
