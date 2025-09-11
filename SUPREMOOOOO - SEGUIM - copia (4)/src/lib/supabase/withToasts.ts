
// src/lib/supabase/withToasts.ts
// Versión FIX: mantiene el chaining (.eq, .match, etc.) y muestra toasts cuando
// la petición se RESUELVE. No rompe los builders thenables de PostgREST.
import type { SupabaseClient } from "@supabase/supabase-js";
import { notifySuccess, notifyError } from "@/lib/notify";

type AnyObj = Record<string, any>;

function wrapThenableWithToasts<T extends AnyObj>(builder: T, okMsg?: string): T {
  // Ya envuelto
  if ((builder as any).__toastWrapped) return builder;

  const proxy = new Proxy(builder as AnyObj, {
    get(target, prop, receiver) {
      // Interceptamos THEN (lo usa await)
      if (prop === "then") {
        const origThen = (target as any).then?.bind(target);
        if (!origThen) return undefined;

        return (onFulfilled?: any, onRejected?: any) => {
          return origThen(
            (res: any) => {
              try {
                if (res && res.error) {
                  notifyError(res.error.message ?? "No se pudo guardar. Inténtalo de nuevo");
                } else {
                  notifySuccess(okMsg ?? "Guardado correctamente");
                }
              } catch {}
              return onFulfilled ? onFulfilled(res) : res;
            },
            (err: any) => {
              try {
                notifyError(err?.message ?? "No se pudo guardar. Inténtalo de nuevo");
              } catch {}
              if (onRejected) return onRejected(err);
              throw err;
            }
          );
        };
      }

      // Para el resto de propiedades/métodos devolvemos lo original (preserva chaining)
      const value = Reflect.get(target, prop, receiver);
      // Si es función, la ligamos al target para preservar 'this'
      if (typeof value === "function") return value.bind(target);
      return value;
    },
  });

  (proxy as any).__toastWrapped = true;
  return proxy as T;
}

export function attachWriteToasts(supabase: SupabaseClient) {
  try {
    // 1) from(...) -> builder con métodos de escritura que DEVUELVEN otro builder (thenable).
    const originalFrom = supabase.from.bind(supabase);
    if (!(supabase.from as any).__toastWrapped) {
      supabase.from = new Proxy(originalFrom as any, {
        apply(target, thisArg, argArray) {
          const tableBuilder = Reflect.apply(target, thisArg, argArray);
          // Interceptamos llamadas a insert/update/upsert/delete para envolver SU retorno (builder) sin romper el chain.
          ["insert", "update", "upsert", "delete"].forEach((m) => {
            const originalM = tableBuilder[m];
            if (typeof originalM === "function" && !(originalM as any).__toastWrapped) {
              tableBuilder[m] = function (...args: any[]) {
                const writeBuilder = originalM.apply(this, args);
                return wrapThenableWithToasts(writeBuilder, "Guardado correctamente");
              };
              (tableBuilder[m] as any).__toastWrapped = true;
            }
          });
          return tableBuilder;
        },
      }) as any;
      (supabase.from as any).__toastWrapped = true;
    }

    // 2) rpc: devuelve promesa directa → envolvemos método
    if (!(supabase.rpc as any).__toastWrapped) {
      const origRpc = supabase.rpc.bind(supabase);
      supabase.rpc = ((fn: any, params?: any, opts?: any) => {
        const p = origRpc(fn, params, opts);
        return p.then((res: any) => {
          if (res && res.error) notifyError(res.error.message ?? "No se pudo guardar. Inténtalo de nuevo");
          else notifySuccess("Guardado correctamente");
          return res;
        }).catch((e: any) => {
          notifyError(e?.message ?? "No se pudo guardar. Inténtalo de nuevo");
          throw e;
        });
      }) as any;
      (supabase.rpc as any).__toastWrapped = true;
    }

    // 3) auth.updateUser (promesa directa)
    if (supabase.auth && !(supabase.auth.updateUser as any).__toastWrapped) {
      const origUpdate = supabase.auth.updateUser.bind(supabase.auth);
      supabase.auth.updateUser = ((data: any, opts?: any) => {
        const p = origUpdate(data, opts);
        return p.then((res: any) => {
          if (res && (res as any).error) notifyError((res as any).error?.message ?? "No se pudo guardar. Inténtalo de nuevo");
          else notifySuccess("Guardado correctamente");
          return res;
        }).catch((e: any) => {
          notifyError(e?.message ?? "No se pudo guardar. Inténtalo de nuevo");
          throw e;
        });
      }) as any;
      (supabase.auth.updateUser as any).__toastWrapped = true;
    }

    // 4) storage.from(...).upload/update/move/remove (promesas directas)
    if (supabase.storage?.from && !(supabase.storage.from as any).__toastWrapped) {
      const origStorageFrom = supabase.storage.from.bind(supabase.storage);
      supabase.storage.from = new Proxy(origStorageFrom as any, {
        apply(target, thisArg, argArray) {
          const bucket = Reflect.apply(target, thisArg, argArray);
          ["upload","update","move","remove"].forEach((m) => {
            const orig = bucket[m];
            if (typeof orig === "function" && !(orig as any).__toastWrapped) {
              bucket[m] = function (...args: any[]) {
                const res = orig.apply(this, args);
                if (res && typeof res.then === "function") {
                  return res.then((r: any) => {
                    if (r && r.error) notifyError(r.error.message ?? "No se pudo guardar. Inténtalo de nuevo");
                    else notifySuccess("Guardado correctamente");
                    return r;
                  }).catch((e: any) => {
                    notifyError(e?.message ?? "No se pudo guardar. Inténtalo de nuevo");
                    throw e;
                  });
                }
                return res;
              };
              (bucket[m] as any).__toastWrapped = true;
            }
          });
          return bucket;
        },
      }) as any;
      (supabase.storage.from as any).__toastWrapped = true;
    }

  } catch (e) {
    console.warn("[attachWriteToasts] No se pudo envolver el cliente:", e);
  }
}
