import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- util: limita a columnas válidas de la tabla profiles ---
  const PROFILE_COLS = [
    'id',
    'email',
    'is_seller',
    'first_name',
    'last_name',
    'company_name',
    'sector',
    'location',
    'phone',
    'website',
    'cif',
    'created_at',
  ] as const;

  function pick<T extends Record<string, any>>(obj: T, keys: readonly string[]): Partial<T> {
    const o: Partial<T> = {};
    for (const k of keys) if (obj[k] !== undefined) (o as any)[k] = obj[k];
    return o;
  }

  // Inserta o actualiza el perfil sin provocar 409 ni 400
  async function ensureProfile(user: User, userData: any) {
    const base = {
      id: user.id, // PK = auth.uid()
      email: user.email ?? userData?.email ?? null,
      is_seller: (typeof userData?.is_seller === 'boolean' ? userData.is_seller : userData?.user_type === 'business'),
      first_name: userData?.first_name ?? '',
      last_name: userData?.last_name ?? '',
      company_name: userData?.company_name ?? null,
      sector: userData?.sector ?? null,
      location: userData?.location ?? null,
      phone: userData?.phone ?? null,
      website: userData?.website ?? null,
      cif: userData?.cif ?? null,
      created_at: new Date().toISOString(),
    };

    const row = pick(base, PROFILE_COLS);

    // ¿ya existe?
    const { data: existing, error: selErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (selErr && selErr.code && selErr.code !== 'PGRST116') {
      // error real (no "no rows")
      throw selErr;
    }

    if (!existing) {
      // insertar
      const { error: insErr } = await supabase.from('profiles').insert([row]);
      if (insErr) {
        // si a pesar de todo dice duplicado, hacemos update
        const dup = insErr.code === '23505' || (insErr as any).status === 409;
        if (!dup) throw insErr;
      } else {
        return;
      }
    }

    // actualizar (si ya existía o si insert devolvió duplicado)
    const { error: updErr } = await supabase.from('profiles').update(row).eq('id', user.id);
    if (updErr) throw updErr;
  }

  const signUp = async (email: string, password: string, userData: any) => {
  try {
    // 1) Crear usuario
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    });
    if (error) throw error;

    // 2) Asegurar que hay sesión antes de tocar RLS (evita 401/42501)
    let sessionNow = data.session || null;
    if (!sessionNow) {
      // Si no hay sesión inmediata (p. ej., confirmación desactivada), intentamos iniciar sesión
      const { data: si, error: siErr } = await supabase.auth.signInWithPassword({ email, password });
      if (!siErr) sessionNow = si.session;
    }

    // 3) Solo si hay sesión, creamos/actualizamos el perfil (RLS necesita auth.uid())
    if (sessionNow) {
      const { data: ures, error: uerr } = await supabase.auth.getUser();
      if (uerr) throw uerr;
      if (ures?.user) {
        await ensureProfile(ures.user, userData);
      }
    }

    toast({
      title: '¡Cuenta creada!',
      description: 'Tu cuenta ha sido creada exitosamente.',
    });

    return data;
  } catch (error: any) {
    console.error('Error creating/updating profile:', error);
    toast({
      title: 'Error al registrarse',
      description: error?.message || 'No se pudo completar el registro',
      variant: 'destructive',
    });
    throw error;
  }
};

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente.',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error al iniciar sesión',
        description: error?.message || 'No se pudo iniciar sesión',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error al cerrar sesión',
        description: error?.message || 'No se pudo cerrar sesión',
        variant: 'destructive',
      });
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase.from('profiles').update(data).eq('id', user.id);
      if (error) throw error;

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil ha sido actualizado correctamente.',
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Error al actualizar perfil',
        description: error?.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value = { user, session, loading, signUp, signIn, signOut, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
