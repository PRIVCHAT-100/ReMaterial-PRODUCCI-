
import React from "react";
import { useFeatureFlags } from "@/contexts/FeatureFlagsProvider";

export default function If({ flag, children }: { flag: string; children: React.ReactNode }) {
  const { enabled } = useFeatureFlags();
  if (!enabled(flag)) return null;
  return <>{children}</>;
}
