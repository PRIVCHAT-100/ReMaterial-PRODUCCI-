import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
  requireSeller?: boolean;
}

const PrivateRoute = ({ children, requireSeller = false }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // TODO: Implement seller role check when user roles are added
  if (requireSeller) {
    // For now, allow all authenticated users to sell
    // Later we can add: if (!user.is_seller) return <Navigate to="/profile?upgrade=seller" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;