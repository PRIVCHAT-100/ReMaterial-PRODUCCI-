import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import ChatDebugBanner from "@/components/debug/ChatDebugBanner";

export default function __DebugRoute() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-xl font-semibold mb-2">__DebugRoute montada</h1>
      <ChatDebugBanner userId={user?.id} seller={params.get("seller")} product={params.get("product")} />
      <p className="text-muted-foreground">Si ves esto, el router y Auth están montando correctamente.</p>
    </div>
  );
}
