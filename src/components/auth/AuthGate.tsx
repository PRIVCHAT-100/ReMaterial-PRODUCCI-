import * as React from "react";
import { useAuth } from "@/contexts/AuthProvider";

const AuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Simple pass-through; replace with real gating if needed
  const _ = useAuth(); // ensures provider exists
  return <>{children}</>;
};

export default AuthGate;
