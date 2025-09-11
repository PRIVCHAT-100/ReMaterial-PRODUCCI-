import { useEffect, useMemo, useState } from "react";
import { Menu, User, Plus, Search as SearchIcon, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/profile/UserMenu";
import { useNavigate, NavLink, useLocation, Link } from "react-router-dom";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { useUserRole } from "@/hooks/useUserRole";

const Header = () => {
  const { t } = useTranslation();
  const { user } = useAuth() as any;
  const navigate = useNavigate();
  const location = useLocation();
  const { isSeller } = useUserRole();

  // Mostrar buscador SOLO en Explorar (ajusta ruta si tu home es otra)
  const isExplore = useMemo(() => location.pathname === "/", [location.pathname]);

  // === Lógica de búsqueda (clon de la Hero) ===
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.get("search")) setSearchValue("");
  }, [location.search]);

  const handleSearch = () => {
    const trimmed = searchValue.trim();
    if (trimmed) navigate(`/?search=${encodeURIComponent(trimmed)}`);
    else navigate(`/`);
  };
  // ============================================

  const linkBase =
    "block w-full text-left px-4 py-3 text-base font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2";
  const linkActive = "bg-neutral-100 dark:bg-neutral-800";
  const linkHover = "hover:bg-neutral-50 dark:hover:bg-neutral-800";

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Fila principal */}
        <div className="flex items-center justify-between h-16">
          {/* Logo (RM azul) + nombre */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground
                           font-extrabold tracking-tight shadow-sm group-hover:shadow transition"
                aria-label="ReMaterial inicio"
              >
                RM
              </span>
              <span className="font-semibold text-foreground">ReMaterial</span>
            </Link>
          </div>

          {/* Buscador SOLO en Explorar — Escritorio (md+) */}
          {isExplore && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="hidden md:flex items-center flex-1 max-w-xl mx-4"
              role="search"
              aria-label={t('ui.buscar-materiales')}
            >
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </span>
                <Input
                  type="text"
                  placeholder={`${t("search_placeholder")}`}
                  className="pl-10 h-12"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button size="lg" className="h-12 px-8 ml-3" type="submit">{t('ui.buscar-materiales')}<ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Navegación escritorio */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-foreground hover:text-primary" onClick={() => navigate("/")} type="button">
              Explorar
            </Button>
            {isSeller && (
              <Button variant="ghost" className="text-foreground hover:text-primary" onClick={() => navigate("/sell")} type="button">
                <Plus className="h-4 w-4 mr-2" />{t('ui.vender')}</Button>
            )}
            <Button variant="ghost" className="text-foreground hover:text-primary" onClick={() => navigate("/empresas")} type="button">
              Empresas
            </Button>
          </nav>

          {/* Acciones + menú móvil */}
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => navigate("/auth")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")} type="button">
                  Registrarse
                </Button>
              </>
            )}

            {/* Botón hamburguesa (móvil) + Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  aria-label={t('ui.abrir-men')}
                  aria-controls="mobile-menu"
                 type="button">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-80 max-w-[85vw] p-0 overflow-y-auto"
                id="mobile-menu"
                aria-label={t('ui.men-de-navegaci-n')}
              >
                <nav className="py-3">
                  <ul className="flex flex-col gap-2 p-2">
                    <li>
                      <SheetClose asChild>
                        <NavLink
                          to="/"
                          className={({ isActive }) =>
                            `${linkBase} ${isActive ? linkActive : ""} ${linkHover}`
                          }
                        >
                          Explorar
                        </NavLink>
                      </SheetClose>
                    </li>

                    <li>
                      <SheetClose asChild>
                        <NavLink
                          to="/empresas"
                          className={({ isActive }) =>
                            `${linkBase} ${isActive ? linkActive : ""} ${linkHover}`
                          }
                        >
                          Empresas
                        </NavLink>
                      </SheetClose>
                    </li>

                    {isSeller && (
                      <li>
                        <SheetClose asChild>
                          <NavLink
                            to="/sell"
                            className={({ isActive }) =>
                              `${linkBase} ${isActive ? linkActive : ""} ${linkHover}`
                            }
                          >
                            <span className="inline-flex items-center">
                              <Plus className="h-4 w-4 mr-2" />{t('ui.vender')}</span>
                          </NavLink>
                        </SheetClose>
                      </li>
                    )}

                    {!user && (
                      <>
                        <li><div className="h-px my-1 bg-border" /></li>
                        <li>
                          <SheetClose asChild>
                            <NavLink
                              to="/auth"
                              className={({ isActive }) =>
                                `${linkBase} ${isActive ? linkActive : ""} ${linkHover}`
                              }
                            >
                              {t('login')}
                            </NavLink>
                          </SheetClose>
                        </li>
                      </>
                    )}
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Buscador SOLO en Explorar — Móvil */}
        {isExplore && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="md:hidden pb-3"
            role="search"
            aria-label={t('ui.buscar-materiales')}
          >
            <div className="flex flex-col gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </span>
                <Input
                  type="text"
                  placeholder={`${t("search_placeholder")}`}
                  className="pl-10 h-12"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Button size="lg" className="h-12" type="submit">{t('ui.buscar-materiales')}<ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {!user && (
                <div className="text-center">
                  <Button size="sm" variant="outline" onClick={() => navigate("/auth")} type="button">
                    Regístrate para más opciones
                  </Button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </header>
  );
};

export default Header;
