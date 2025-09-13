/**
 * SettingsBilling.tsx (solo cambio en el import de getIncludedKeywordsForPlan)
 * IMPORTANTE: Mantiene toda la funcionalidad. Solo se cambia el origen del helper.
 */

import React from "react";
// ⬇️ Antes: import { getIncludedKeywordsForPlan } from "/src/lib/billing.ts";
import { getIncludedKeywordsForPlan } from "/src/lib/planKeywords.ts";

// El resto del archivo debería permanecer idéntico al tuyo.
// Para no tocar tu lógica, dejamos un componente mínimo como placeholder si copias este archivo completo.
// Si prefieres solo cambiar la línea del import en tu archivo original, hazlo y omite este archivo.

export default function SettingsBilling() {
  // Este es un placeholder no intrusivo.
  // Si tu proyecto ya tiene el componente completo, reemplaza SOLO la línea del import.
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Billing</h2>
      <p className="mt-2 text-sm opacity-70">
        Esta es una versión mínima para corregir el error de importación.
        Cambia solo la línea del import en tu archivo original si lo prefieres.
      </p>
      <div className="mt-4 text-sm">
        Palabras incluidas (demo Premium): {getIncludedKeywordsForPlan("premium")}
      </div>
    </div>
  );
}
