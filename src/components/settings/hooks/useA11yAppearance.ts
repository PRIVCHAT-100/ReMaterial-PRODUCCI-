// src/components/settings/hooks/useA11yAppearance.ts
// Drop-in fix: mantiene la estética, aplica cambios al instante y persiste SOLO al pulsar "Guardar".
// Mapea las claves snake_case del UI a camelCase internas del motor a11y.

import { useEffect, useMemo, useState } from "react";
import { A11yAppearance as InternalPrefs, applyA11y, loadA11y, saveA11y } from "@/lib/a11y/apply";

// Preferencias que usa el componente de UI (snake_case):
export type UIPrefs = {
  theme: "light" | "dark" | "system";
  font_size: "small" | "medium" | "large";
  high_contrast: boolean;
  reduce_motion: boolean;
  table_density: "comfortable" | "compact";
};

function fromInternal(p: InternalPrefs): UIPrefs {
  return {
    theme: p.theme,
    font_size: p.fontSize,
    high_contrast: p.highContrast,
    reduce_motion: p.reduceMotion,
    table_density: p.density,
  };
}

function toInternal(p: UIPrefs): InternalPrefs {
  return {
    theme: p.theme,
    fontSize: p.font_size,
    highContrast: p.high_contrast,
    reduceMotion: p.reduce_motion,
    density: p.table_density,
  };
}

export function useA11yAppearance() {
  // Carga inicial desde almacenamiento interno y lo traduce al formato del UI
  const [prefs, setPrefs] = useState<UIPrefs>(() => fromInternal(loadA11y()));
  const [saving, setSaving] = useState(false);
  // Si tu UI muestra un skeleton inicial, puedes exponer loading=true aquí.
  const loading = false;

  // Aplica visualmente en caliente cada vez que el usuario cambia algo,
  // pero sin persistir hasta que pulse "Guardar".
  useEffect(() => {
    const preview = toInternal(prefs);
    applyA11y(preview);
  }, [prefs]);

  // Función "save" que tu componente espera: persiste y re‑aplica por seguridad.
  async function save(next?: UIPrefs) {
    setSaving(true);
    try {
      const finalPrefs = next ?? prefs;
      // Persistir
      saveA11y(toInternal(finalPrefs));
      // Re‑aplicar (por si hay side‑effects o arranque en otra pestaña)
      applyA11y(toInternal(finalPrefs));
      // Actualizamos el estado local por si llegó "next"
      if (next) setPrefs(next);
    } finally {
      setSaving(false);
    }
  }

  return { prefs, setPrefs, save, loading, saving };
}
