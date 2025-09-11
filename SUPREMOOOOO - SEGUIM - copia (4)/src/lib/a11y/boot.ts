// Optional boot shim. Call this once early (e.g., in src/main.tsx or src/index.tsx)
// import { boot } from "@/lib/a11y/boot"; boot();
import { bootAppearance } from "@/lib/settings";
export function boot() {
  try {
    bootAppearance();
  } catch {}
}
export default { boot };
