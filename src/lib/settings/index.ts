// Settings API with default export as function `save` (for compatibility).
// Also provides named exports { save, getAppearance, bootAppearance }.
//
// Works with any of these:
//   import save from "@/lib/settings";           save(...)
//   import { save } from "@/lib/settings";       save(...)
//   import save from "@/lib/settings/api";       save(...)
//   import { save } from "@/lib/settings/api";   save(...)

export type A11yAppearance = {
  theme: "light" | "dark" | "system";
  fontSize?: "small" | "medium" | "large";
  highContrast?: boolean;
  reduceMotion?: boolean;
  density?: "comfortable" | "compact";
};

const STORAGE_KEY = "a11y_prefs_v1";

function load(): A11yAppearance {
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

function persist(prefs: A11yAppearance) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
}

function apply(prefs: A11yAppearance) {
  const root = document.documentElement;

  // Theme
  if (prefs.theme === "dark") {
    root.classList.add("dark");
  } else if (prefs.theme === "light") {
    root.classList.remove("dark");
  } else {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", dark);
  }

  // Font size (opt-in; requires index.css rules)
  if (prefs.fontSize) root.setAttribute("data-fontsize", prefs.fontSize);
  else root.removeAttribute("data-fontsize");

  // High contrast focus
  if (prefs.highContrast) root.setAttribute("data-high-contrast", "");
  else root.removeAttribute("data-high-contrast");

  // Reduce motion
  if (prefs.reduceMotion) root.setAttribute("data-reduce-motion", "");
  else root.removeAttribute("data-reduce-motion");

  // Density (affects tables)
  if (prefs.density) root.setAttribute("data-density", prefs.density);
  else root.removeAttribute("data-density");
}

export async function getAppearance(): Promise<A11yAppearance> {
  return load();
}

export async function save(nextPrefs: A11yAppearance): Promise<void> {
  const prev = load();
  const merged: A11yAppearance = { ...prev, ...nextPrefs };
  persist(merged);
  apply(merged);
}

// Optional boot
export function bootAppearance() {
  const prefs = load();
  apply(prefs);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => {
    const p = load();
    if (p.theme === "system") apply(p);
  };
  if (mq.addEventListener) mq.addEventListener("change", handler);
  else mq.addListener(handler);
}

// Default export is the function `save` (important for your onClick usage).
export default save;
