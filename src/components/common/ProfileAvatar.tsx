import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export interface ProfileAvatarProps {
  src?: string | null;
  name?: string | null;
  profileId?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<ProfileAvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

/**
 * Centraliza la lógica del avatar (imagen/logo o iniciales).
 * - Usa src directamente si se proporciona.
 * - Si no hay src y existe profileId, hace fetch de profiles.logo_url.
 * - Fallback con iniciales (blanco sobre fondo primario).
 */
export default function ProfileAvatar({ src, name, profileId, className, size = "md" }: ProfileAvatarProps) {
  const [url, setUrl] = useState<string | null | undefined>(src);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!src && profileId) {
        const { data, error } = await supabase
          .from("profiles")
          .select("logo_url")
          .eq("id", profileId)
          .single();
        if (!active) return;
        if (!error && data) {
          setUrl(data.logo_url);
        } else {
          setUrl(null);
        }
      } else {
        setUrl(src || null);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [profileId, src]);

  const initials = getInitials(name);

  return (
    <Avatar className={[sizeClasses[size], className].filter(Boolean).join(" ")}>
      {url ? (
        <AvatarImage src={url} alt={name || "Logo"} />
      ) : (
        <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
      )}
    </Avatar>
  );
}