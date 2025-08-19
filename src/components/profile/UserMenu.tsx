import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

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

export const UserMenu = () => {
  const { t } = useTranslation();

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  
// --- Unread badge state (suma de product + general) ---
const [unreadCount, setUnreadCount] = useState<number>(0);

useEffect(() => {
  if (!user?.id) return;
  let alive = true;

  const fetchTotals = async () => {
    try {
      const { productTotal, generalTotal } = await getUnreadTotals(user.id);
      if (alive) setUnreadCount((productTotal ?? 0) + (generalTotal ?? 0));
    } catch {}
  };

  fetchTotals();

  const channel = supabase
    .channel(`unread-badge-${user.id}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
      fetchTotals();
    })
    .subscribe();

  const interval = setInterval(fetchTotals, 30000);

  return () => {
    alive = false;
    clearInterval(interval);
    try { supabase.removeChannel(channel); } catch {}
  };
}, [user?.id]);
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
            <p className="text-sm font-medium leading-none">{user.user_metadata?.company_name || 'Usuario'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('ui.mi-perfil')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/dashboard')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/my-products')}>
          <Package className="mr-2 h-4 w-4" />
          <span>{t('ui.mis-productos')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/favorites')}>
          <Heart className="mr-2 h-4 w-4" />
          <span>{t('ui.favoritos')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/messages')}>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>{t('ui.mensajes')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('ui.configuraci-n')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('ui.cerrar-sesi-n')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};