// src/components/HomeBanners.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link_url?: string | null;
  position?: number | null;
  active: boolean;
  placement: "home_hero" | "companies_hero" | "explore_hero" | "product_detail" | "messages_top";
};

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

export default function HomeBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [i, setI] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("placement", "home_hero")
        .order("position", { ascending: true });

      if (error) {
        console.error("[banners]", error);
        setBanners([]);
        return;
      }

      setBanners((data || []).filter((b) => b.active !== false));
    })();
  }, []);

  // autoplay básico
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setI((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners]);

  if (!banners.length) return null;

  const current = banners[i];

  const Card = (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm bg-muted">
      <img
        src={current.image_url}
        alt={current.title}
        className="w-full h-[220px] sm:h-[320px] object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 sm:p-6 text-white">
        <h3 className="text-xl sm:text-2xl font-semibold drop-shadow">{current.title}</h3>
        {current.subtitle ? (
          <p className="text-sm sm:text-base opacity-90 drop-shadow">{current.subtitle}</p>
        ) : null}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-2">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              aria-label={`Ir al banner ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 w-2 rounded-full ${idx === i ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Si hay link_url: hacemos todo el banner clicable (interna = <Link/>, externa = <a/>)
  if (current.link_url && current.link_url.trim()) {
    const href = current.link_url.trim();
    return (
      <div className="relative">
        {isExternal(href) ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={current.title}
            className="block group"
          >
            {Card}
            {/* overlay invisible para asegurar que TODO el área es clicable */}
            <span className="absolute inset-0" />
          </a>
        ) : (
          <Link to={href} aria-label={current.title} className="block group">
            {Card}
            <span className="absolute inset-0" />
          </Link>
        )}

        {/* Controles izquierda/derecha (solo si hay varios) */}
        {banners.length > 1 && (
          <>
            <button
              aria-label="Anterior"
              onClick={() => setI((p) => (p - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full px-2 py-1"
            >
              ‹
            </button>
            <button
              aria-label="Siguiente"
              onClick={() => setI((p) => (p + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full px-2 py-1"
            >
              ›
            </button>
          </>
        )}
      </div>
    );
  }

  // Sin link_url: solo mostramos el banner
  return (
    <div className="relative">
      {Card}
      {banners.length > 1 && (
        <>
          <button
            aria-label="Anterior"
            onClick={() => setI((p) => (p - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full px-2 py-1"
          >
            ‹
          </button>
          <button
            aria-label="Siguiente"
            onClick={() => setI((p) => (p + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full px-2 py-1"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
