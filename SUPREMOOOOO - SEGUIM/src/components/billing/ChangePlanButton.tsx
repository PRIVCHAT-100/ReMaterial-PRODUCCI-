// src/components/billing/ChangePlanButton.tsx
import React from "react";
import { openCustomerPortal } from "@/lib/billing";

export default function ChangePlanButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => openCustomerPortal()}
      className={className || "rounded-xl border px-3 py-2 hover:shadow"}
    >
      Cambiar de plan
    </button>
  );
}