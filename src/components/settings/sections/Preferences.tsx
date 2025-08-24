
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePreferences } from "../hooks/usePreferences";

export default function PreferencesSection() {
  const { prefs, setPrefs, save, loading, saving } = usePreferences();
  const disabled = loading || saving;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Idioma</CardTitle>
          <CardDescription>Idioma principal y alternativa.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Idioma</Label>
            <select className="border rounded-md h-10 px-3" value={prefs.language} disabled={disabled}
              onChange={(e) => setPrefs(p => ({ ...p, language: e.target.value as any }))}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="ca">Català</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Fallback</Label>
            <select className="border rounded-md h-10 px-3" value={prefs.fallback_language} disabled={disabled}
              onChange={(e) => setPrefs(p => ({ ...p, fallback_language: e.target.value as any }))}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="ca">Català</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias de publicación</CardTitle>
          <CardDescription>Valores por defecto al publicar productos.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Unidad de medida</Label>
            <select className="border rounded-md h-10 px-3" value={prefs.default_unit} disabled={disabled}
              onChange={(e) => setPrefs(p => ({ ...p, default_unit: e.target.value as any }))}>
              {["u","kg","g","l","m","m2","m3","cm","mm"].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Envío disponible</Label>
            <select className="border rounded-md h-10 px-3" value={String(prefs.default_shipping_available)} disabled={disabled}
              onChange={(e) => setPrefs(p => ({ ...p, default_shipping_available: e.target.value === "true" }))}>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Stock mínimo</Label>
            <Input type="number" min={0} value={prefs.default_min_stock} disabled={disabled}
              onChange={(e) => setPrefs(p => ({ ...p, default_min_stock: parseInt(e.target.value || "0") }))}/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas de oferta/contrato</CardTitle>
          <CardDescription>Guarda condiciones estándar para reutilizarlas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Nueva plantilla</Label>
            <Input placeholder="Nombre (ej. Oferta estándar)" id="tpl-name"/>
            <Textarea placeholder="Texto de la plantilla" id="tpl-body"/>
            <Button
              onClick={() => {
                const name = (document.getElementById("tpl-name") as HTMLInputElement).value.trim();
                const body = (document.getElementById("tpl-body") as HTMLTextAreaElement).value.trim();
                if (!name || !body) return;
                setPrefs(p => ({ ...p, offer_templates: [...p.offer_templates, { name, body }] }));
                (document.getElementById("tpl-name") as HTMLInputElement).value = "";
                (document.getElementById("tpl-body") as HTMLTextAreaElement).value = "";
              }}
              disabled={disabled}
            >
              Añadir plantilla
            </Button>
          </div>

          <div className="space-y-2">
            {prefs.offer_templates.length === 0 && (
              <div className="text-sm text-muted-foreground">No hay plantillas guardadas.</div>
            )}
            {prefs.offer_templates.map((t, i) => (
              <div key={i} className="border rounded-md p-3 flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm whitespace-pre-wrap">{t.body}</div>
                </div>
                <Button variant="secondary" onClick={() => setPrefs(p => ({ ...p, offer_templates: p.offer_templates.filter((_, idx) => idx !== i) }))} disabled={disabled}>
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save(prefs)} disabled={disabled}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
      </div>
    </div>
  );
}
