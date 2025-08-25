// src/setupAutoToasts.ts
// Importa esto UNA sola vez (por ejemplo, en src/main.tsx o src/App.tsx)
// para que TODAS las escrituras de Supabase muestren notificación automática.
import { supabase } from "@/lib/supabase/client";
import { attachWriteToasts } from "@/lib/supabase/withToasts";

attachWriteToasts(supabase);

// Opcional: también escucha a eventos manuales por si tienes guardados que no pasan por Supabase.
window.addEventListener("save:success", () => {
  // Lazy import evita cargar notify de inicio si no se usa
  import("@/lib/notify").then(m => m.notifySuccess("Guardado correctamente"));
});
window.addEventListener("save:error", () => {
  import("@/lib/notify").then(m => m.notifyError("No se pudo guardar. Inténtalo de nuevo"));
});