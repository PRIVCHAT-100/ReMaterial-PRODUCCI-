
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSupportLegal } from "../hooks/useSupportLegal";
import If from "@/components/utils/If";

const TERMS_VERSION = "1.0";
const PRIVACY_VERSION = "1.0";
const STATUS_URL = "https://status.example.com"; // cámbialo si tienes uno real
const HELP_URL = "/help"; // o URL externa a tu centro de ayuda

export default function SupportLegalSection() {
  const { data, createTicket, acceptLegal, loading, saving } = useSupportLegal();
  const disabled = loading || saving;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Centro de ayuda / FAQ</CardTitle>
          <CardDescription>Encuentra respuestas rápidas.</CardDescription>
        </CardHeader>
        <CardContent>
          <a href={HELP_URL} className="underline text-primary">Abrir centro de ayuda</a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contactar soporte</CardTitle>
          <CardDescription>Crearemos un ticket con tu mensaje.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Asunto" id="s-subject" />
          <Textarea placeholder="Describe el problema o sugerencia" id="s-message" />
          <Button
            onClick={() => {
              const subject = (document.getElementById("s-subject") as HTMLInputElement).value.trim();
              const message = (document.getElementById("s-message") as HTMLTextAreaElement).value.trim();
              if (!subject || !message) return;
              createTicket(subject, message);
              (document.getElementById("s-subject") as HTMLInputElement).value = "";
              (document.getElementById("s-message") as HTMLTextAreaElement).value = "";
            }}
            disabled={disabled}
          >
            Enviar
          </Button>
        </CardContent>
      </Card>

      <If flag="settings.support.status">
        <Card>
          <CardHeader>
            <CardTitle>Estado del sistema</CardTitle>
            <CardDescription>Consulta incidencias en tiempo real.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={STATUS_URL} className="underline text-primary" target="_blank" rel="noreferrer">Abrir status</a>
          </CardContent>
        </Card>
      </If>

      <Card>
        <CardHeader>
          <CardTitle>Términos y privacidad</CardTitle>
          <CardDescription>Última versión aceptada por tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            Aceptado: {data.legal.accepted_at ? new Date(data.legal.accepted_at).toLocaleString() : "—"}
            {" "}| Términos v{data.legal.terms_version ?? "—"} | Privacidad v{data.legal.privacy_version ?? "—"}
          </div>
          <div className="flex gap-2">
            <a className="underline text-primary" href="/terms" target="_blank" rel="noreferrer">Términos y Condiciones</a>
            <a className="underline text-primary" href="/privacy" target="_blank" rel="noreferrer">Política de Privacidad</a>
          </div>
          <Button onClick={() => acceptLegal(TERMS_VERSION, PRIVACY_VERSION)} disabled={disabled}>
            Aceptar v{TERMS_VERSION}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
