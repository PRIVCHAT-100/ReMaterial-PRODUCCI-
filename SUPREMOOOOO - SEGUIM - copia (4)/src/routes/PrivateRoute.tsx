
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return null;         // keep your aesthetics (no spinner forced)
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
