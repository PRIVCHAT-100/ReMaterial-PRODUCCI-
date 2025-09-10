import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBilling } from "../hooks/useBilling";
import { getMySubscription, openCustomerPortal, getIncludedKeywordsForPlan } from "@/lib/billing";
import { useState, useEffect } from "react";
import { useProfileRole } from "@/hooks/useProfileRole";

export default function BillingSection() {
  const { data, setData, saveTax, loading, saving } = useBilling();
  const [localTax, setLocalTax] = useState(data.tax);
  const disabled = loading || saving;
  const [sub, setSub] = useState<any | null>(null);
  const [subError, setSubError] = useState<string | null>(null);

  useEffect(() => {
    setLocalTax(data.tax);
  }, [data.tax]);

  // Carga de suscripción (plan/estado/renovación)
  useEffect(() => {
    (async () => {
      try {
        const s = await getMySubscription();
        setSub(s as any);
      } catch (e:any) {
        setSubError(e?.message || "No se pudo cargar la suscripción");
      }
    })();
  }, []);

  const role = useProfileRole();
  const isSeller = !!role.data?.isSeller;

  return (
    <div className="space-y-6">
      {isSeller && (
      <Card>
        <CardHeader>
          <CardTitle>Datos fiscales</CardTitle>
          <CardDescription>Usados en facturas y contabilidad.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Razón social</Label>
            <Input value={localTax.legal_name} disabled={disabled} onChange={(e) => setLocalTax(t => ({ ...t, legal_name: e.target.value }))}/>
          </div>
          <div className="space-y-2">
            <Label>CIF/NIF</Label>
            <Input value={localTax.tax_id} disabled={disabled} onChange={(e) => setLocalTax(t => ({ ...t, tax_id: e.target.value }))}/>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Dirección de facturación</Label>
            <Input value={localTax.billing_address} disabled={disabled} onChange={(e) => setLocalTax(t => ({ ...t, billing_address: e.target.value }))}/>
          </div>
          <div className="space-y-2">
            <Label>Preferencia de IVA</Label>
            <select className="border rounded-md h-10 px-3" value={localTax.vat_preference}
              disabled={disabled}
              onChange={(e) => setLocalTax(t => ({ ...t, vat_preference: e.target.value as any }))}>
              <option value="included">Incluido</option>
              <option value="excluded">Excluido</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>IVA intracomunitario (opcional)</Label>
            <Input value={localTax.eu_vat_number || ""} disabled={disabled} onChange={(e) => setLocalTax(t => ({ ...t, eu_vat_number: e.target.value }))}/>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => saveTax(localTax)} disabled={disabled}>
              {saving ? "Guardando..." : "Guardar datos fiscales"}
            </Button>
          </div>
        </CardContent>
      </Card>
      )}


      <Card>
        <CardHeader>
          <CardTitle>Métodos de pago</CardTitle>
          {/* Info de suscripción */}
          {sub && (
            <CardDescription className="mt-1">
              Plan: <strong className="uppercase">{sub?.plan_tier || 'free'}</strong> — Estado: {sub?.status || 'inactive'}
              {sub?.current_period_end && (
                <> — Próxima renovación: {new Date(sub.current_period_end).toLocaleDateString()}</>
              )}
              <br />
              Palabras clave incluidas gratis: <strong>{getIncludedKeywordsForPlan(sub?.plan_tier)}</strong>
            </CardDescription>
          )}
          {subError && <CardDescription className="mt-1 text-red-600">{subError}</CardDescription>}

          <CardDescription>Gestiona tus tarjetas a través de Stripe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">Esta sección se conectará con Stripe (portal de cliente) sin romper nada del código actual.</div>
          <Button variant="secondary" disabled>Abrir portal de Stripe</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Direcciones por defecto</CardTitle>
          <CardDescription>Recogida / envío para tus pedidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Añadir/editar direcciones se habilitará aquí. (Persistencia incluida en hooks.)</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de facturas</CardTitle>
          <CardDescription>Descarga tus facturas emitidas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Importe</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.invoices.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-muted-foreground">Sin facturas todavía.</TableCell></TableRow>
              ) : data.invoices.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{(inv.amount/100).toFixed(2)}</TableCell>
                  <TableCell>{inv.currency?.toUpperCase?.() || "EUR"}</TableCell>
                  <TableCell>
                    {inv.download_url ? <a className="text-primary underline" href={inv.download_url}>Descargar</a> : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
