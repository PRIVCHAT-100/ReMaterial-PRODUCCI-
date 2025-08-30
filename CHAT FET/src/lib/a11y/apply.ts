
// src/lib/a11y/apply.ts
export type A11yAppearance = {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
  reduceMotion: boolean;
  density: "comfortable" | "compact";
};

const STORAGE_KEY = "a11y_prefs_v1";

export function loadA11y(): A11yAppearance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    theme: "system",
    fontSize: "medium",
    highContrast: false,
    reduceMotion: false,
    density: "comfortable",
  };
}

export function saveA11y(prefs: A11yAppearance) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function applyA11y(prefs: A11yAppearance) {
  const root = document.documentElement;

  // Tema
  if (prefs.theme === "dark") {
    root.classList.add("dark");
  } else if (prefs.theme === "light") {
    root.classList.remove("dark");
  } else {
    // sistema
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }

  // Fuente
  root.setAttribute("data-fontsize", prefs.fontSize);

  // Contraste
  root.toggleAttribute("data-high-contrast", prefs.highContrast);

  // Reducir movimiento
  root.toggleAttribute("data-reduce-motion", prefs.reduceMotion);

  // Densidad
  root.setAttribute("data-density", prefs.density);
}

export function bootA11y() {
  const prefs = loadA11y();
  applyA11y(prefs);

  // Listener para cambios de sistema
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const prefs = loadA11y();
    if (prefs.theme === "system") applyA11y(prefs);
  });
}
