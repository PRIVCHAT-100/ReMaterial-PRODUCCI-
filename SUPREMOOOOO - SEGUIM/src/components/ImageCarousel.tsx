import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageItem = File | string;

export function ImageCarousel({
  images,
  getSrc,
  className,
  showThumbs = false,
  index: controlledIndex,
  onIndexChange,
}: {
  images: ImageItem[];
  getSrc?: (item: ImageItem, idx: number) => string;
  className?: string;
  showThumbs?: boolean;
  index?: number;
  onIndexChange?: (idx: number) => void;
}) {
  const [internalIndex, setInternalIndex] = React.useState(0);
  const isControlled = typeof controlledIndex === "number";
  const index = isControlled ? controlledIndex! : internalIndex;

  const setIndex = (i: number) => {
    if (onIndexChange) onIndexChange(i);
    if (!isControlled) setInternalIndex(i);
  };

  const getURL = (item: ImageItem, i: number) =>
    getSrc ? getSrc(item, i) : (typeof item === "string" ? item : URL.createObjectURL(item));

  const go = (dir: 1 | -1) => {
    const len = images?.length || 0;
    if (!len) return;
    const next = (index + dir + len) % len;
    setIndex(next);
  };

  React.useEffect(() => {
    if (!images || images.length === 0) return;
    if (index >= images.length) setIndex(Math.max(0, images.length - 1));
  }, [images?.length]);

  const startX = React.useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1);
    startX.current = null;
  };

  if (!images || images.length === 0) return null;

  return (
    <div className={cn("relative w-full select-none", className)}>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={getURL(images[index], index)}
          alt={`Imagen ${index + 1}`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {images.length > 1 && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur"
              onClick={() => go(-1)}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur"
              onClick={() => go(1)}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn("h-1.5 w-1.5 rounded-full bg-white/50", i === index && "bg-white")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showThumbs && images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-md border",
                i === index ? "ring-2 ring-primary" : ""
              )}
              aria-label={`Ir a imagen ${i + 1}`}
            >
              <img
                src={getURL(img, i)}
                alt={`Miniatura ${i + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
