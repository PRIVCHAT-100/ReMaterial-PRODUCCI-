
import React, { createContext, useContext, useMemo } from "react";
import { FEATURE_FLAGS } from "@/config/featureFlags";

type FlagsObject = typeof FEATURE_FLAGS;

type Ctx = {
  enabled: (path: string) => boolean;
  raw: FlagsObject;
};

const FeatureFlagsContext = createContext<Ctx>({
  enabled: () => true,
  raw: FEATURE_FLAGS,
});

function readOverrides(): Partial<FlagsObject> | null {
  try {
    const raw = localStorage.getItem("featureFlags");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function deepMerge<T extends object>(base: T, override?: Partial<T>): T {
  if (!override) return base;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  for (const k in override) {
    const bv = (base as any)[k];
    const ov = (override as any)[k];
    out[k] = (bv && typeof bv === "object" && !Array.isArray(bv) && ov && typeof ov === "object")
      ? deepMerge(bv, ov)
      : (ov ?? bv);
  }
  return out;
}

function readPath(obj: any, path: string): any {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    if (cur == null) return undefined;
    if (i === parts.length - 1) {
      if (typeof cur[key] === "boolean") return cur[key];
      const maybe = cur[key];
      if (maybe && typeof maybe === "object" && "enabled" in maybe) return !!maybe.enabled;
      return maybe;
    }
    cur = cur[key];
  }
  return cur;
}

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const merged = useMemo(() => deepMerge(FEATURE_FLAGS, readOverrides() || undefined), []);
  const ctx: Ctx = useMemo(() => ({
    raw: merged,
    enabled: (path: string) => {
      const v = readPath(merged, path);
      if (typeof v === "boolean") return v;
      if (v && typeof v === "object" && "enabled" in v) return !!(v as any).enabled;
      return Boolean(v);
    },
  }), [merged]);

  return (
    <FeatureFlagsContext.Provider value={ctx}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
