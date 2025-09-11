import { useEffect, useMemo, useRef, useState } from "react";
import { useProfileRole } from "@/hooks/useProfileRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { hasAdvancedInventory } from "@/lib/billing/guards";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, MoreHorizontal, Plus, RefreshCcw, Save, Search, ShoppingCart, TrendingDown, TrendingUp, X } from "lucide-react";

import Header from "@/components/Header";

/**
 * PESTAÑA: Productos / Inventario (para vendedores)
 *
 * Incluye:
 * - Listado de productos del vendedor con: imagen, título, precio, inventario, estado y acciones.
 * - Edición rápida de inventario (+/- e input), guardado optimista y acciones en lote.
 * - Acciones rápidas: "Registrar 1 venta", Restock +10/+50, Poner a 0 (Agotado), Pausar/Reanudar.
 * - Destacado visual de bajo inventario (umbral configurable) y de productos agotados.
 * - Búsqueda por título, filtros por estado, selector "solo bajo stock".
 * - Suscripción en tiempo real a cambios en `products`.
 */

// Cambia a "stock" si tu columna se llama así en vez de "inventory"
const INVENTORY_COL = "inventory" as const;

const PRODUCT_STATES = ["active", "paused", "sold_out"] as const;
type ProductStatus = typeof PRODUCT_STATES[number];

export type ProductRow = {
  id: string;
  seller_id: string;
  title: string;
  price_cents?: number | null;
  price?: number | null;
  [INVENTORY_COL]?: number | null;
  status?: ProductStatus | null;
  thumbnail_url?: string | null;
  created_at?: string | null;
};

function formatPrice(p?: number | null, cents?: number | null) {
  const value = typeof cents === "number" && !Number.isNaN(cents)
    ? cents / 100
    : typeof p === "number"
    ? p
    : 0;
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function getInventoryValue(p: ProductRow): number {
  const v = (p as any)[INVENTORY_COL];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return 0;
}

function nextStatusFromInventory(inv: number, current?: ProductStatus | null): ProductStatus {
  if (inv <= 0) return "sold_out";
  if (current === "paused") return "paused";
  return "active";
}

export default function SellerInventoryPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [edited, setEdited] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [lowThreshold, setLowThreshold] = useState<number>(5);
  const userIdRef = useRef<string | null>(null);

  // Cargar productos del vendedor
  const { data: profileRole } = useProfileRole();

  if (profileRole && !hasAdvancedInventory(profileRole.plan as any)) {
    return (<div className="max-w-3xl mx-auto p-6"><div className="rounded-xl border bg-amber-50 border-amber-300 text-amber-900 p-4">La gestión de inventario avanzada es exclusiva de <b>Premium</b> y <b>Pro+</b>. <a className="underline" href="/plans">Mejorar plan</a></div></div>);
  }

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id ?? null;
      userIdRef.current = uid;
      if (!uid) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("id,seller_id,title,price_cents,price,thumbnail_url,status,created_at," + INVENTORY_COL)
        .eq("seller_id", uid)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        console.error("Error cargando productos", error);
        setRows([]);
      } else {
        setRows(data as ProductRow[]);
      }
      setLoading(false);
    })();

    return () => { active = false; };
  }, []);

  // Suscripción a cambios en tiempo real

  useEffect(() => {
    const uid = userIdRef.current;
    if (!uid) return;

    const channel = supabase
      .channel("inventory-products-changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "products", filter: `seller_id=eq.${uid}` },
        (payload) => setRows((prev) => prev.map((r) => (r.id === (payload.new as any).id ? { ...r, ...(payload.new as any) } : r))))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "products", filter: `seller_id=eq.${uid}` },
        (payload) => setRows((prev) => [payload.new as any as ProductRow, ...prev]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userIdRef.current]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const inv = getInventoryValue(r);
      const matchesText = !q || r.title?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesLow = !lowOnly || inv <= lowThreshold;
      return matchesText && matchesStatus && matchesLow;
    });
  }, [rows, query, statusFilter, lowOnly, lowThreshold]);

  const anySelected = useMemo(() => Object.values(selected).some(Boolean), [selected]);
  const editedCount = useMemo(() => Object.keys(edited).length, [edited]);

  function setRowSelected(id: string, v: boolean) {
    setSelected((prev) => ({ ...prev, [id]: v }));
  }
  function setRowEdited(id: string, value: number) {
    setEdited((prev) => ({ ...prev, [id]: value }));
  }
  function clearEdits(ids?: string[]) {
    if (!ids) { setEdited({}); return; }
    setEdited((prev) => {
      const clone = { ...prev };
      for (const id of ids) delete clone[id];
      return clone;
    });
  }

  async function saveOne(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const newInv = edited[id];
    if (typeof newInv !== "number" || Number.isNaN(newInv) || newInv < 0) return;

    const prev = row;
    const next = {
      ...row,
      [INVENTORY_COL]: newInv,
      status: nextStatusFromInventory(newInv, row.status ?? undefined),
    } as ProductRow;

    setRows((prevRows) => prevRows.map((r) => (r.id === id ? next : r)));

    const { error } = await supabase
      .from("products")
      .update({ [INVENTORY_COL]: newInv, status: next.status })
      .eq("id", id);

    if (error) {
      console.error("Error guardando inventario", error);
      setRows((prevRows) => prevRows.map((r) => (r.id === id ? prev : r)));
      return;
    }
    clearEdits([id]);
  }

  async function saveEdited() {
    if (!editedCount) return;
    setSaving(true);
    const snapshot = rows;

    const nextRows = rows.map((r) => {
      const newInv = edited[r.id];
      if (typeof newInv === "number") {
        return { ...r, [INVENTORY_COL]: newInv, status: nextStatusFromInventory(newInv, r.status ?? undefined) } as ProductRow;
      }
      return r;
    });
    setRows(nextRows);

    try {
      const updates = Object.entries(edited).map(([id, inv]) => ({ id, inv }));
      for (const u of updates) {
        const prevStatus = snapshot.find((x) => x.id === u.id)?.status ?? undefined;
        const { error } = await supabase
          .from("products")
          .update({ [INVENTORY_COL]: u.inv, status: nextStatusFromInventory(u.inv, prevStatus as ProductStatus) })
          .eq("id", u.id);
        if (error) throw error;
      }
      setEdited({});
    } catch (e) {
      console.error("Error guardando cambios masivos", e);
      setRows(snapshot);
    } finally {
      setSaving(false);
    }
  }

  async function quickAdjust(id: string, delta: number) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const current = typeof edited[id] === "number" ? edited[id] : getInventoryValue(row);
    const next = Math.max(0, current + delta);
    setRowEdited(id, next);
  }

  async function quickSale(id: string) {
    await quickAdjust(id, -1);
    await saveOne(id);
  }

  async function quickRestock(id: string, amount = 10) {
    await quickAdjust(id, amount);
    await saveOne(id);
  }

  async function setZero(id: string) {
    setRowEdited(id, 0);
    await saveOne(id);
  }

  async function togglePause(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const nextStatus: ProductStatus = row.status === "paused" ? nextStatusFromInventory(getInventoryValue(row), "active") : "paused";

    const prev = row.status;
    setRows((prevRows) => prevRows.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));

    const { error } = await supabase.from("products").update({ status: nextStatus }).eq("id", id);
    if (error) {
      console.error("Error cambiando estado", error);
      setRows((prevRows) => prevRows.map((r) => (r.id === id ? { ...r, status: prev } : r)));
    }
  }

  async function bulk(delta: number) {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([id]) => id);
    if (!ids.length) return;

    for (const id of ids) {
      const row = rows.find((r) => r.id === id);
      if (!row) continue;
      const next = Math.max(0, getInventoryValue(row) + delta);
      setRowEdited(id, next);
      await saveOne(id);
    }
  }

  function resetSelections() {
    setSelected({});
  }
  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
      </div>
      <div className="flex-1">
        <div className="container mx-auto max-w-screen-2xl px-4 py-6 space-y-6">
          <Card>
            <CardHeader className="gap-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xl sm:text-2xl">Productos / Inventario</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => (window.location.assign("/seller/products/new"))}>
                    <Plus className="mr-2 h-4 w-4" /> Añadir producto
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => window.location.reload()} aria-label="Refrescar">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por título…"
                      className="pl-8"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="whitespace-nowrap">Estado: {statusFilter === "all" ? "Todos" : statusFilter}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>Todos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("active")}>Activos</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("paused")}>Pausados</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("sold_out")}>Agotados</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="lowOnly" checked={lowOnly} onCheckedChange={(v) => setLowOnly(!!v)} />
                    <Label htmlFor="lowOnly" className="text-sm">Solo bajo stock</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="umbral" className="text-sm">Umbral</Label>
                    <Input
                      id="umbral"
                      type="number"
                      min={0}
                      value={lowThreshold}
                      onChange={(e) => setLowThreshold(Math.max(0, Number(e.target.value)))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2 pb-3">
                <Button variant="outline" size="sm" disabled={!anySelected} onClick={() => bulk(-1)}>
                  <TrendingDown className="mr-2 h-4 w-4" /> Registrar 1 venta (selección)
                </Button>
                <Button variant="outline" size="sm" disabled={!anySelected} onClick={() => bulk(10)}>
                  <TrendingUp className="mr-2 h-4 w-4" /> Restock +10 (selección)
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button size="sm" disabled={!editedCount || saving} onClick={saveEdited}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Guardar cambios ({editedCount})
                </Button>
                {!!(anySelected || editedCount) && (
                  <Button variant="ghost" size="sm" onClick={() => { resetSelections(); clearEdits(); }}>
                    <X className="mr-2 h-4 w-4" /> Limpiar
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableCaption>
                    {loading ? "Cargando productos…" : filtered.length ? `${filtered.length} producto(s)` : "No hay productos que coincidan."}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={filtered.length > 0 && filtered.every((r) => selected[r.id])}
                          onCheckedChange={(v) => {
                            const checked = !!v;
                            const next: Record<string, boolean> = { ...selected };
                            for (const r of filtered) next[r.id] = checked;
                            setSelected(next);
                          }}
                          aria-label="Seleccionar todos"
                        />
                      </TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="w-28 text-right">Precio</TableHead>
                      <TableHead className="w-64">Inventario</TableHead>
                      <TableHead className="w-28">Estado</TableHead>
                      <TableHead className="w-64">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => {
                      const invOriginal = getInventoryValue(r);
                      const invEdited = edited[r.id];
                      const inv = typeof invEdited === "number" ? invEdited : invOriginal;
                      const isLow = inv <= lowThreshold && inv > 0;
                      const isZero = inv <= 0;

                      return (
                        <TableRow key={r.id} className={isZero ? "bg-destructive/5" : isLow ? "bg-amber-50 dark:bg-amber-950/20" : undefined}>
                          <TableCell>
                            <Checkbox
                              checked={!!selected[r.id]}
                              onCheckedChange={(v) => setRowSelected(r.id, !!v)}
                              aria-label={`Seleccionar ${r.title}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {r.thumbnail_url ? (
                                <img src={r.thumbnail_url} alt="miniatura" className="h-12 w-12 rounded-lg object-cover border" />
                              ) : (
                                <div className="h-12 w-12 rounded-lg border grid place-items-center text-xs text-muted-foreground">IMG</div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-medium leading-none">{r.title ?? "(Sin título)"}</span>
                                <span className="text-xs text-muted-foreground">ID: {r.id.slice(0, 8)}…</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatPrice(r.price ?? null, r.price_cents ?? null)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => setRowEdited(r.id, Math.max(0, inv - 1))} aria-label="-1">
                                -
                              </Button>
                              <Input
                                type="number"
                                className="w-24 text-center"
                                value={inv}
                                min={0}
                                onChange={(e) => setRowEdited(r.id, Math.max(0, Number(e.target.value)))}
                              />
                              <Button variant="outline" size="icon" onClick={() => setRowEdited(r.id, inv + 1)} aria-label="+1">
                                +
                              </Button>
                              {isZero ? (
                                <Badge variant="destructive">Agotado</Badge>
                              ) : isLow ? (
                                <Badge variant="secondary">Bajo</Badge>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            {r.status === "paused" && <Badge variant="outline">Pausado</Badge>}
                            {r.status === "active" && <Badge>Activo</Badge>}
                            {r.status === "sold_out" && <Badge variant="destructive">Agotado</Badge>}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-2">
                              <Button size="sm" onClick={() => saveOne(r.id)} disabled={typeof edited[r.id] !== "number"}>
                                <Save className="mr-2 h-4 w-4" /> Guardar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => quickSale(r.id)} disabled={inv <= 0}>
                                <ShoppingCart className="mr-2 h-4 w-4" /> Registrar 1 venta
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <MoreHorizontal className="mr-2 h-4 w-4" /> Más
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => quickRestock(r.id, 10)}>
                                    Restock +10
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => quickRestock(r.id, 50)}>
                                    Restock +50
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem className="text-destructive">Poner a 0 (agotar)</DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>¿Poner inventario a 0?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Esto marcará el producto como <strong>Agotado</strong>.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => setZero(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                          Confirmar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => togglePause(r.id)}>
                                    {r.status === "paused" ? "Reanudar" : "Pausar"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground">
            <p>
              Consejo: si tus ventas se registran desde el chat/pedido, asegúrate de que al crear el pedido se <strong>descuenta el
              inventario</strong> en la tabla <code>products</code>. Esta vista se sincroniza en tiempo real con cambios en tus productos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}