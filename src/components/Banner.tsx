import { useTranslation } from "react-i18next";
import BannerHero from "@/components/BannerHero";

/**
 * Banner ancho a mismo layout que Explorar.
 */
export default function Banner() {
  const { t } = useTranslation();

  const ITEMS = [
    {
      id: "s1",
      image:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=2000&auto=format&fit=crop",
      href: "/messages",
      label: "Patrocinado: Envases retornables",
      alt: "Palets y cajas retornables",
      objectPosition: "center",
    },
    {
      id: "s2",
      image:
        "https://images.unsplash.com/photo-1518618021020-8ee98c65f7a0?q=80&w=2000&auto=format&fit=crop",
      href: "/explore?tag=metal",
      label: t("ui.acuerdos-con-metal-rgicas"),
      alt: "Bobinas metálicas",
      objectPosition: "center top",
    },
    {
      id: "s3",
      image:
        "https://images.unsplash.com/photo-1552871212-5d5c9086a0d2?q=80&w=2000&auto=format&fit=crop",
      href: "/explore?tag=madera",
      label: t("ui.madera-recuperada"),
      alt: "Tablas de madera",
      objectPosition: "50% 40%",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <BannerHero
        items={ITEMS}
        heightClass="h-[220px] md:h-[300px] lg:h-[360px]"
        showArrows
        showDots
        className="rounded-2xl shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.01] transition"
      />
    </div>
  );
}
