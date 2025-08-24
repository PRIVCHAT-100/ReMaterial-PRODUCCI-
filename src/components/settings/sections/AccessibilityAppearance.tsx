
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useA11yAppearance } from "../hooks/useA11yAppearance";
import { Label } from "@/components/ui/label";

export default function AccessibilityAppearanceSection() {
  const { prefs, setPrefs, save, loading, saving } = useA11yAppearance();
  const disabled = loading || saving;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>Elige claro / oscuro / sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <select className="border rounded-md h-10 px-3" value={prefs.theme} disabled={disabled}
            onChange={(e) => setPrefs(p => ({ ...p, theme: e.target.value as any }))}>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
            <option value="system">Sistema</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accesibilidad</CardTitle>
          <CardDescription>Ajustes de legibilidad y movimiento.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tamaño de fuente</Label>
            <select className="border rounded-md h-10 px-3" value={prefs.font_size} disabled={disabled}
              onChange={(e) => setPrefs(p => ({ ...p, font_size: e.target.value as any }))}>
              <option value="small">Pequeño</option>
              <option value="medium">Medio</option>
              <option value="large">Grande</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Contraste elevado</Label>
            <select className="border rounded-md h-10 px-3" value={String(prefs.high_contrast)} disabled={disabled}
              onChange={(e) => setPrefs(p => ({ ...p, high_contrast: e.target.value === "true" }))}>
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Reducir animaciones</Label>
            <select className="border rounded-md h-10 px-3" value={String(prefs.reduce_motion)} disabled={disabled}
              onChange={(e) => setPrefs(p => ({ ...p, reduce_motion: e.target.value === "true" }))}>
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Densidad de tablas/listados</CardTitle>
          <CardDescription>Elige vista compacta o cómoda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <select className="border rounded-md h-10 px-3" value={prefs.table_density} disabled={disabled}
            onChange={(e) => setPrefs(p => ({ ...p, table_density: e.target.value as any }))}>
            <option value="comfortable">Cómoda</option>
            <option value="compact">Compacta</option>
          </select>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save(prefs)} disabled={disabled}>{saving ? "Guardando..." : "Guardar cambios"}</Button>
      </div>
    </div>
  );
}
