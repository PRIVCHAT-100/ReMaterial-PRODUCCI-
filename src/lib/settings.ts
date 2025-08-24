// Unified A11y + Appearance settings API (drop-in, non-breaking).
// Works with ANY of these imports:
//   import { save } from "@/lib/settings";
//   import { save } from "@/lib/settings/api";
//   import settings from "@/lib/settings"; settings.save(...)
//   import settings from "@/lib/settings/api"; settings.save(...)
// Also exposes a safe global window.__a11ySave for last-resort compatibility.

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
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

  // Font size (opt-in via index.css)
  if (prefs.fontSize) root.setAttribute("data-fontsize", prefs.fontSize);
  else root.removeAttribute("data-fontsize");

  // High contrast
  if (prefs.highContrast) root.setAttribute("data-high-contrast", "");
  else root.removeAttribute("data-high-contrast");

  // Reduce motion
  if (prefs.reduceMotion) root.setAttribute("data-reduce-motion", "");
  else root.removeAttribute("data-reduce-motion");

  // Density
  if (prefs.density) root.setAttribute("data-density", prefs.density);
  else root.removeAttribute("data-density");
}

// Public API
export async function getAppearance(): Promise<A11yAppearance> {
  return load();
}

export async function save(nextPrefs: A11yAppearance): Promise<void> {
  const prev = load();
  const merged: A11yAppearance = { ...prev, ...nextPrefs };
  persist(merged);
  apply(merged);
}

// Boot on app start (optional)
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

// default export for compatibility
const settings = { save, getAppearance, bootAppearance };
export default settings;

// Safe global for legacy callers (will not throw if imported differently)
try {
  // @ts-ignore
  window.__a11ySave = save;
} catch {}
