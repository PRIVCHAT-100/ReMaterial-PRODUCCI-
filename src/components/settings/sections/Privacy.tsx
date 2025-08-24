import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePrivacyPrefs } from "../hooks/usePrivacyPrefs";

export default function PrivacySection() {
  const { prefs, setPrefs, save, loading, saving } = usePrivacyPrefs();
  const disabled = loading || saving;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quién puede contactarte</CardTitle>
          <CardDescription>Limita quién puede iniciar conversaciones contigo.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={prefs.who_can_contact}
            onValueChange={(v) => setPrefs(p => ({ ...p, who_can_contact: v as any }))}
            className="grid gap-3 md:grid-cols-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">Todos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verified" id="verified" />
              <Label htmlFor="verified">Sólo verificados</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="prior_contacts" id="prior_contacts" />
              <Label htmlFor="prior_contacts">Sólo contactos previos</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bloquear usuarios/empresas</CardTitle>
          <CardDescription>Impide que te contacten o vean tu perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="ID de usuario o empresa"
              onKeyDown={(e:any) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  const id = e.currentTarget.value.trim();
                  setPrefs(p => ({ ...p, blocklist: Array.from(new Set([...(p.blocklist||[]), id])) }));
                  e.currentTarget.value = "";
                }
              }}/>
            <Button variant="secondary" disabled>Buscar</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(prefs.blocklist||[]).length === 0 && (
              <div className="text-sm text-muted-foreground">No hay bloqueados.</div>
            )}
            {(prefs.blocklist||[]).map((id) => (
              <Badge key={id} variant="secondary" className="cursor-pointer"
                onClick={() => setPrefs(p => ({ ...p, blocklist: p.blocklist.filter(x => x !== id) }))}>
                {id} ✕
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibilidad</CardTitle>
          <CardDescription>Controla qué ven los demás sobre tu actividad.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Mostrar última conexión</div>
            <Switch checked={prefs.show_last_seen} disabled={disabled}
              onCheckedChange={(v) => setPrefs(p => ({ ...p, show_last_seen: v }))}/>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Consentimiento cookies</div>
            <Switch checked={prefs.consent_cookies} disabled={disabled}
              onCheckedChange={(v) => setPrefs(p => ({ ...p, consent_cookies: v }))}/>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Consentimiento analytics</div>
            <Switch checked={prefs.consent_analytics} disabled={disabled}
              onCheckedChange={(v) => setPrefs(p => ({ ...p, consent_analytics: v }))}/>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save(prefs)} disabled={disabled}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
