import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { TAXONOMY, type Taxon } from "@/data/taxonomy";
import { useTranslation } from "react-i18next";

type Props = {
  variant?: "desktop" | "mobile";
  onNavigate: (path: string) => void;
};

function buildPath(cat: string, sub?: string) {
  return sub ? `/c/${cat}/${sub}` : `/c/${cat}`;
}

export default function CategoriesMenu({ variant = "desktop", onNavigate }: Props) {
  const { t } = useTranslation();

  if (variant === "mobile") return <MobileCategories onNavigate={onNavigate} />;
  return <DesktopCategories onNavigate={onNavigate} />;
}

/* ---------------- Desktop (Dropdown, sin overlay que bloquee scroll) ---------------- */
function DesktopCategories({ onNavigate }: { onNavigate: (p: string) => void }) {
  const cats = TAXONOMY;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hidden md:inline-flex">{t('ui.categor-as')}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="z-[70] w-72">
        {cats.map((c) => {
          const hasChildren = !!(c.children && c.children.length);
          if (!hasChildren) {
            return (
              <DropdownMenuItem key={c.slug} onClick={() => onNavigate(buildPath(c.slug))}>
                <span className="flex-1">{c.label}</span>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuSub key={c.slug}>
              <DropdownMenuSubTrigger>
                <span className="flex-1">{c.label}</span>
                <ChevronRight className="ml-2 h-4 w-4 opacity-60" />
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[70] w-72">
                  <DropdownMenuItem onClick={() => onNavigate(buildPath(c.slug))}>
                    <strong className="font-medium">Ver todo {c.label}</strong>
                  </DropdownMenuItem>
                  <div className="h-px my-1 bg-border" />
                  {(c.children as Taxon[]).map((s) => (
                    <DropdownMenuItem key={s.slug} onClick={() => onNavigate(buildPath(c.slug, s.slug))}>
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ---------------- Móvil (lista plegable dentro del drawer; no cambia) ---------------- */
function MobileCategories({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [openCat, setOpenCat] = React.useState<string | null>(null);

  return (
    <div className="p-2">
      <div className="px-2 pb-2 text-sm font-medium text-muted-foreground">{t('ui.categor-as')}</div>
      <ul className="flex flex-col gap-1">
        {TAXONOMY.map((c) => {
          const opened = openCat === c.slug;
          const hasChildren = !!(c.children && c.children.length);
          return (
            <li key={c.slug}>
              <button
                className="w-full flex items-center justify-between rounded-xl px-4 py-3 hover:bg-muted"
                onClick={() => {
                  if (!hasChildren) return onNavigate(buildPath(c.slug));
                  setOpenCat(opened ? null : c.slug);
                }}
              >
                <span className="font-medium">{c.label}</span>
                <ChevronDown className={`h-4 w-4 transition ${opened ? "rotate-180" : ""}`} />
              </button>

              {opened && hasChildren && (
                <ul className="mt-1 ml-3 border-l pl-3 flex flex-col gap-1">
                  <li>
                    <button
                      className="w-full text-left rounded-lg px-3 py-2 hover:bg-muted font-medium"
                      onClick={() => onNavigate(buildPath(c.slug))}
                    >
                      Ver todo {c.label}
                    </button>
                  </li>
                  {c.children!.map((s) => (
                    <li key={s.slug}>
                      <button
                        className="w-full text-left rounded-lg px-3 py-2 hover:bg-muted"
                        onClick={() => onNavigate(buildPath(c.slug, s.slug))}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}