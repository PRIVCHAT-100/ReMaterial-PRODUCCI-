// src/components/DistanceBadge.tsx
import React from "react";
import type { LatLng } from "@/utils/distance";
import { distanceKm } from "@/utils/distance";

type Props = {
  me?: LatLng | null;
  item?: LatLng | null;
  className?: string;
};

export default function DistanceBadge({ me, item, className }: Props) {
  if (!me || !item) return null;
  try {
    const km = distanceKm(me, item);
    if (!isFinite(km)) return null;
    return <span className={className}>{km} km</span>;
  } catch {
    return null;
  }
}
