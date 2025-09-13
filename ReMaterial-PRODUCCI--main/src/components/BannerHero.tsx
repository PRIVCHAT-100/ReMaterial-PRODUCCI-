import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type BannerItem = {
  id: string;
  image: string;
  alt?: string;
  href?: string;
  label?: string;
  objectPosition?: string; // e.g. "center top"
};

type BannerHeroProps = {
  items: BannerItem[];
  className?: string;
  heightClass?: string;
  autoRotate?: boolean;   // ← NUEVO (por defecto true)
  intervalMs?: number;    // ← NUEVO (por defecto 5000)
  pauseOnHover?: boolean; // ← NUEVO (por defecto true)
  showArrows?: boolean;   // ← NUEVO (por defecto true)
  showDots?: boolean;     // ← NUEVO (por defecto true)
};

const BannerHero = ({
  items,
  className = "",
  heightClass = "h-[220px] md:h-[300px] lg:h-[360px]",
  autoRotate = true,
  intervalMs = 5000,
  pauseOnHover = true,
  showArrows = true,
  showDots = true,
}: BannerHeroProps) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const prefersReducedMotion = useRef<boolean>(false);

  const count = items?.length ?? 0;
  const hasItems = count > 0;

  const goTo = (i: number) => {
    if (!count) return;
    setIndex((i + count) % count);
  };
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Detecta prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = !!mq?.matches;
    const onChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  // Auto-rotación
  useEffect(() => {
    if (!hasItems || count < 2) return;
    if (!autoRotate || isPaused || prefersReducedMotion.current) return;

    timerRef.current = window.setInterval(next, intervalMs);
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, autoRotate, isPaused, intervalMs, count, hasItems]);

  // Pausar si la pestaña está oculta
  useEffect(() => {
    const onVisibility = () => setIsPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Precarga siguiente imagen
  useEffect(() => {
    if (!hasItems) return;
    const nextIndex = (index + 1) % count;
    const img = new Image();
    img.src = items[nextIndex].image;
  }, [index, hasItems, count, items]);

  // Gestos táctiles
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const t = 45;
    if (touchDeltaX.current > t) prev();
    if (touchDeltaX.current < -t) next();
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // Teclado
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  if (!hasItems) return null;

  return (
    <section
      className={`relative w-full overflow-hidden ${heightClass} ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      onFocus={() => pauseOnHover && setIsPaused(true)}
      onBlur={() => pauseOnHover && setIsPaused(false)}
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
                <a className="block w-full h-full relative" href={item.href} tabIndex={isActive ? 0 : -1}>
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
      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full p-2 bg-white/90 hover:bg-white shadow-md focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full p-2 bg-white/90 hover:bg-white shadow-md focus:outline-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && count > 1 && (
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
