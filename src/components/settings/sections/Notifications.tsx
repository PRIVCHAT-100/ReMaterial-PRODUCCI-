
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNotificationPrefs } from "../hooks/useNotificationPrefs";
import If from "@/components/utils/If";

export default function NotificationsSection() {
  const { prefs, setPrefs, save, loading, saving } = useNotificationPrefs();
  const disabled = loading || saving;
  useMemo(() => ({}), []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Canales</CardTitle>
          <CardDescription>Elige por dónde te avisamos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email</div>
              <div className="text-sm text-muted-foreground">Recomendado</div>
            </div>
            <Switch checked={prefs.channels.email} disabled={disabled}
              onCheckedChange={(v) => setPrefs(p => ({ ...p, channels: { ...p.channels, email: v } }))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Web push</div>
              <div className="text-sm text-muted-foreground">Requiere permiso del navegador</div>
            </div>
            <Switch checked={prefs.channels.web_push} disabled={disabled}
              onCheckedChange={(v) => setPrefs(p => ({ ...p, channels: { ...p.channels, web_push: v } }))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos</CardTitle>
          <CardDescription>Selecciona de qué temas quieres recibir avisos.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {[
            ["messages","Mensajes"],["offers","Ofertas"],["favorites","Favoritos"],
            ["product_state","Cambios de estado"],["system","Avisos del sistema"]
          ].map(([key,label]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="font-medium">{label}</div>
              <Switch
                checked={(prefs.types as any)[key]}
                disabled={disabled}
                onCheckedChange={(v) => setPrefs(p => ({ ...p, types: { ...p.types, [key]: v } as any }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frecuencia</CardTitle>
          <CardDescription>Controla cada cuánto agrupamos notificaciones.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Select
            value={prefs.frequency}
            onValueChange={(v) => setPrefs(p => ({ ...p, frequency: v as any }))}
            disabled={disabled}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Inmediato</SelectItem>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch checked={prefs.weekly_digest} disabled={disabled}
              onCheckedChange={(v) => setPrefs(p => ({ ...p, weekly_digest: v }))} />
            <span>Resumen semanal (digest)</span>
          </div>
        </CardContent>
      </Card>

      <If flag="settings.notifications.mute_conversations">
        <Card>
          <CardHeader>
            <CardTitle>Silenciar conversaciones</CardTitle>
            <CardDescription>Silencia hilos específicos para no recibir avisos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="ID de conversación para silenciar (pegado rápido)"
                onKeyDown={(e:any) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    const id = e.currentTarget.value.trim();
                    setPrefs(p => ({ ...p, muted_conversation_ids: Array.from(new Set([...(p.muted_conversation_ids||[]), id])) }));
                    e.currentTarget.value = "";
                  }
                }}/>
              <Button variant="secondary" disabled>Buscar</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(prefs.muted_conversation_ids||[]).length === 0 && (
                <div className="text-sm text-muted-foreground">No hay conversaciones silenciadas.</div>
              )}
              {(prefs.muted_conversation_ids||[]).map((id) => (
                <Badge key={id} variant="secondary" className="cursor-pointer"
                  onClick={() => setPrefs(p => ({ ...p, muted_conversation_ids: p.muted_conversation_ids.filter(x => x !== id) }))}>
                  {id} ✕
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </If>

      <div className="flex justify-end">
        <Button onClick={() => save(prefs)} disabled={disabled}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
