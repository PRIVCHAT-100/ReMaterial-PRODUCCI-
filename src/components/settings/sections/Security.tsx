import React from "react";
import FormSection from "../FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Security (2FA TOTP + quick controls)
 * Implements client‑side TOTP enrollment/verification/disable via supabase.auth.mfa
 */

type Totp = { id: string; status?: string };
export default function Security() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);

  const [factors, setFactors] = React.useState<Totp[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Enroll flow
  const [enrolling, setEnrolling] = React.useState(false);
  const [factorId, setFactorId] = React.useState<string | null>(null);
  const [qrSvg, setQrSvg] = React.useState<string | null>(null);
  const [secret, setSecret] = React.useState<string | null>(null);
  const [verifyCode, setVerifyCode] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        await refreshFactors();
      } catch (e: any) {
        console.error(e);
        toast({ title: "Error", description: e?.message ?? "No se pudo cargar el estado de 2FA.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshFactors = async () => {
    // @ts-ignore
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    const totp = (data?.totp ?? []).map((f: any) => ({ id: f.id, status: f.status }));
    setFactors(totp);
    setActiveId(((data as any)?.default_factor_id as string) ?? null);
  };

  const startEnroll = async () => {
    try {
      setEnrolling(true);
      // @ts-ignore
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      const totp = (data as any)?.totp ?? {};
      setFactorId(totp.id);
      setQrSvg(totp.qr_code ?? null);
      setSecret(totp.secret ?? null);
      toast({ title: "Escanea el QR", description: "Usa Google Authenticator, 1Password, etc." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo iniciar 2FA", description: e?.message ?? "", variant: "destructive" });
      setEnrolling(false);
    }
  };

  const verifyEnroll = async () => {
    if (!factorId || !verifyCode) {
      toast({ title: "Código necesario", description: "Introduce el código de la app de autenticación.", variant: "destructive" });
      return;
    }
    try {
      // @ts-ignore
      const { error } = await supabase.auth.mfa.verify({ factorId, code: verifyCode });
      if (error) throw error;
      toast({ title: "2FA activado" });
      setEnrolling(false);
      setFactorId(null); setQrSvg(null); setSecret(null); setVerifyCode("");
      await refreshFactors();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Código incorrecto", description: e?.message ?? "", variant: "destructive" });
    }
  };

  const disableTotp = async (id: string) => {
    try {
      // @ts-ignore
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) throw error;
      toast({ title: "2FA desactivado" });
      await refreshFactors();
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo desactivar", description: e?.message ?? "", variant: "destructive" });
    }
  };

  if (loading) return <div className="rounded-2xl border p-6">Cargando…</div>;

  const hasTotp = factors.length > 0;

  return (
    <div className="space-y-4">
      <FormSection title="Autenticación en dos pasos (2FA)">
        {!hasTotp && !enrolling && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-600">
              Protege tu cuenta con códigos temporales (TOTP) generados por una app (Google Authenticator, Authy, 1Password…).
            </p>
            <div>
              <Button onClick={startEnroll}>Activar 2FA</Button>
            </div>
          </div>
        )}

        {enrolling && (
          <div className="space-y-4">
            <p className="text-sm">Escanea el siguiente QR con tu app de autenticación y escribe el código de 6 dígitos.</p>
            {qrSvg && <div className="border rounded-xl p-3" dangerouslySetInnerHTML={{ __html: qrSvg }} />}
            {secret && <p className="text-xs text-zinc-500">Clave secreta: <code className="select-all">{secret}</code></p>}
            <div className="flex gap-2 items-center">
              <Input placeholder="Código de 6 dígitos" value={verifyCode} onChange={e => setVerifyCode(e.target.value)} className="max-w-[200px]" />
              <Button onClick={verifyEnroll}>Verificar y activar</Button>
              <Button variant="secondary" onClick={() => { setEnrolling(false); setFactorId(null); setQrSvg(null); setSecret(null); setVerifyCode(""); }}>Cancelar</Button>
            </div>
          </div>
        )}

        {hasTotp && !enrolling && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">2FA está activado en tu cuenta.</p>
            <ul className="list-disc ml-5 text-sm">
              {factors.map(f => (
                <li key={f.id} className="flex items-center justify-between">
                  <span>Factor TOTP • {f.status ?? "active"}</span>
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => disableTotp(f.id)}>Desactivar</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </FormSection>

      <FormSection title="Otras medidas">
        <ul className="text-sm list-disc ml-5 space-y-2 text-zinc-700">
          <li>Usa una contraseña larga y única.</li>
          <li>Activa 2FA en cuanto sea posible.</li>
          <li>Evita iniciar sesión en redes y equipos públicos.</li>
        </ul>
      </FormSection>
    </div>
  );
}