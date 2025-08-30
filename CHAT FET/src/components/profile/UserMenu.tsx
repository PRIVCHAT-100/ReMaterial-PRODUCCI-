
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

export default function UserMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSeller, setIsSeller] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase.from("profiles").select("is_seller").eq("id", user.id).single();
      if (error) {
        console.error(error);
        return;
      }
      if (!ignore) setIsSeller(!!data?.is_seller);
    };
    load();
    return () => { ignore = true; };
  }, [user?.id]);

  const handleNavigation = (to: string) => {
    navigate(to);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" type="button">
          <ProfileAvatar className="h-8 w-8" profileId={user?.id} name={ user?.email || "Perfil" } />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.email ?? "Usuario"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isSeller && (
          <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>{t("ui.mi-perfil") || "Mi perfil"}</span>
          </DropdownMenuItem>
        )}

        {isSeller && (
          <DropdownMenuItem onClick={() => handleNavigation("/dashboard")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        )}

        {isSeller && (
          <DropdownMenuItem onClick={() => handleNavigation("/my-products")}>
            <Package className="mr-2 h-4 w-4" />
            <span>{t("ui.mis-productos") || "Mis productos"}</span>
          </DropdownMenuItem>
        )}

        {isSeller && (
          <DropdownMenuItem onClick={() => handleNavigation("/seller/inventory")}>
            <Package className="mr-2 h-4 w-4" />
            <span>Inventario</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => handleNavigation("/favorites")}>
          <Heart className="mr-2 h-4 w-4" />
          <span>{t("ui.favoritos") || "Favoritos"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleNavigation("/messages")}>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>{t("ui.mensajes") || "Mensajes"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t("ui.configuracion") || "Configuración"}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("ui.cerrar-sesion") || "Cerrar sesión"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
