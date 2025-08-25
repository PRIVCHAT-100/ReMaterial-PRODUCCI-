import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, Package, MessageSquare, LogOut, BarChart3, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { getUnreadTotals } from "@/features/chat/chatApi";
import { useProfileRole } from "@/hooks/useProfileRole";

/**
 * IMPORTANTE: Todos los hooks viven en el top-level y en el mismo orden SIEMPRE.
 * Nada de hooks dentro de condiciones o retornos tempranos.
 */
export const UserMenu = () => {
  // 1) Hooks SIEMPRE en el mismo orden
  const { user, signOut } = useAuth();
  const { data } = useProfileRole();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 2) Estados/refs
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const aliveRef = useRef(true);
  const isSeller = !!data?.isSeller;

  // 3) Efectos (no condicionales)
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchTotals = async () => {
      try {
        const { productTotal, generalTotal } = await getUnreadTotals(user.id);
        if (aliveRef.current) {
          setUnreadCount((productTotal ?? 0) + (generalTotal ?? 0));
        }
      } catch {
        // silencioso
      }
    };

    // Primera carga
    fetchTotals();

    // Suscripción a cambios
    channel = supabase
      .channel(`unread-badge-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        fetchTotals();
      })
      .subscribe();

    // Refresco periódico
    interval = setInterval(fetchTotals, 30000);

    return () => {
      if (interval) clearInterval(interval);
      try { if (channel) supabase.removeChannel(channel); } catch {}
    };
  }, [user?.id]);

  // 4) Render (el return puede ser condicional; los hooks NO)
  if (!user) return null;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" type="button">
          <ProfileAvatar className="h-8 w-8" profileId={user?.id} name={ user?.email || "Perfil" } />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata?.company_name || "Usuario"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
          <User className="mr-2 h-4 w-4" />
          <span>{t("ui.mi-perfil")}</span>
        </DropdownMenuItem>

        {isSeller && (
          <DropdownMenuItem onClick={() => handleNavigation("/dashboard")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        )}

        {isSeller && (
          <DropdownMenuItem onClick={() => handleNavigation("/my-products")}>
            <Package className="mr-2 h-4 w-4" />
            <span>{t("ui.mis-productos")}</span>
          </DropdownMenuItem>
        )}
 

        <DropdownMenuItem onClick={() => handleNavigation("/favorites")}>
          <Heart className="mr-2 h-4 w-4" />
          <span>{t("ui.favoritos")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleNavigation("/messages")}>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>{t("ui.mensajes")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t("ui.configuracion")}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("ui.cerrar-sesion")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
