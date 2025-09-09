
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useIntegrations } from "../hooks/useIntegrations";

export default function IntegrationsSection() {
  const { data, setData, loading, saving, saveBasics, createApiKey, revokeApiKey } = useIntegrations();
  const disabled = loading || saving;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
          <CardDescription>Para coordinar recogidas o visitas.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Activar</Label>
            <select className="border rounded-md h-10 px-3" value={String(data.calendar_enabled)} disabled={disabled}
              onChange={(e) => saveBasics({ calendar_enabled: e.target.value === "true", calendar_provider: data.calendar_provider })}>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <select className="border rounded-md h-10 px-3" value={data.calendar_provider} disabled={disabled}
              onChange={(e) => saveBasics({ calendar_enabled: data.calendar_enabled, calendar_provider: e.target.value as any })}>
              <option value="none">Ninguno</option>
              <option value="google">Google</option>
              <option value="outlook">Outlook</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API keys / Webhooks</CardTitle>
          <CardDescription>Crea y revoca claves con ámbitos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-2">
            <Input placeholder="Nombre (ej. ERP)" id="key-name" />
            <Input placeholder="Token (solo demo)" id="key-token" />
            <select multiple className="border rounded-md h-24 px-2" id="key-scopes">
              <option value="read">read</option>
              <option value="write">write</option>
              <option value="webhooks">webhooks</option>
            </select>
          </div>
          <Button
            onClick={() => {
              const name = (document.getElementById("key-name") as HTMLInputElement).value.trim();
              const token = (document.getElementById("key-token") as HTMLInputElement).value.trim();
              const scopesSel = (document.getElementById("key-scopes") as HTMLSelectElement);
              const scopes = Array.from(scopesSel.selectedOptions).map(o => o.value);
              if (!name || !token) return;
              createApiKey(name, token, scopes);
              (document.getElementById("key-name") as HTMLInputElement).value = "";
              (document.getElementById("key-token") as HTMLInputElement).value = "";
              Array.from(scopesSel.options).forEach(o => o.selected = false);
            }}
            disabled={disabled}
          >
            Crear clave
          </Button>

          <div className="space-y-2">
            {data.api_keys.length === 0 && <div className="text-sm text-muted-foreground">No hay claves todavía.</div>}
            {data.api_keys.map(k => (
              <div key={k.id} className="border rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{k.name}</div>
                  <div className="text-xs text-muted-foreground">{k.token}</div>
                  <div className="flex gap-1 mt-1">{k.scopes.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                </div>
                <Button variant="secondary" onClick={() => revokeApiKey(k.id)} disabled={disabled}>Revocar</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
