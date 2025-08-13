import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type BannerItem = {
  id: string;
  image: string;              // URL completa (Supabase Storage o externa)
  alt?: string;
  href?: string;              // Si lo pones, el banner será clicable
  label?: string;             // Texto opcional para accesibilidad/overlay
  objectPosition?: string;    // Ej: "center top", "left center", "50% 30%"
};

type BannerHeroProps = {
  items: BannerItem[];
  intervalMs?: number;        // tiempo entre slides (auto-rotación)
  className?: string;         // estilos extra si quieres
  heightClass?: string;       // alto fijo para evitar "saltos" (LCP estable)
};

const BannerHero = ({
  items,
  intervalMs = 4500,
  className = "",
  heightClass = "h-[220px] md:h-[300px] lg:h-[360px]",
}: BannerHeroProps) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const hasItems = items && items.length > 0;
  const count = hasItems ? items.length : 0;

  // Navegación segura
  const goTo = (i: number) => {
    if (!count) return;
    const next = (i + count) % count;
    setIndex(next);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Auto-rotación con pausa
  useEffect(() => {
    if (!count) return;
    if (isPaused || count < 2) return;

    timerRef.current = window.setInterval(() => {
      next();
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isPaused, intervalMs, count]);

  // Pausar si la pestaña está oculta
  useEffect(() => {
    const onVisibility = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Navegación con teclado
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  // Deslizar en pantallas táctiles
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const onTouchEnd = () => {
    const threshold = 45; // px
    if (touchDeltaX.current > threshold) prev();
    if (touchDeltaX.current < -threshold) next();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // Pre-cargar siguiente imagen
  useEffect(() => {
    if (!count) return;
    const nextIndex = (index + 1) % count;
    const img = new Image();
    img.src = items[nextIndex].image;
  }, [index, count, items]);

  if (!hasItems) return null;

  return (
    <section
      className={`relative w-full overflow-hidden rounded-2xl bg-muted ${heightClass} ${className}`}
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="Banners promocionales"
    >
      {/* Slides */}
      <div
        className="absolute inset-0"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((item, i) => {
          const isActive = i === index;
          const commonImgProps = {
            alt: item.alt || item.label || "banner",
            loading: i === 0 ? ("eager" as const) : ("lazy" as const),
            decoding: "async" as const,
            className: "w-full h-full object-cover",
            draggable: false,
            style: { objectPosition: item.objectPosition || "center" } as React.CSSProperties,
          };

          const content = (
            <>
              <img src={item.image} {...commonImgProps} />
              {item.label && (
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 text-white text-xs md:text-sm">
                  {item.label}
                </div>
              )}
            </>
          );

          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 will-change-[opacity] ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!isActive}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${count}${item.label ? `: ${item.label}` : ""}`}
            >
              {item.href ? (
                <a href={item.href} className="block w-full h-full relative" tabIndex={isActive ? 0 : -1}>
                  {content}
                </a>
              ) : (
                <div className="w-full h-full relative">{content}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flechas */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full p-2 bg-white/80 hover:bg-white shadow-md focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full p-2 bg-white/80 hover:bg-white shadow-md focus:outline-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir al banner ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white"
              }`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BannerHero;
