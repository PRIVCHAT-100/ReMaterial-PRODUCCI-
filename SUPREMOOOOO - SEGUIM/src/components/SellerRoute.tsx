import { Navigate } from "react-router-dom";
import { useProfileRole } from "@/hooks/useProfileRole";

export default function SellerRoute({ children }: { children: JSX.Element }) {
  const { data, isLoading, isError } = useProfileRole();

  if (isLoading) return <div />;
  if (isError) return <Navigate to="/upgrade-seller" replace />;

  if (!data?.isAuthenticated) return <Navigate to="/auth" replace />;
  if (!data.isSeller) return <Navigate to="/upgrade-seller" replace />;

  // enforce active plan for sellers
  if (!data.plan || data.planStatus !== 'active') return <Navigate to="/plans" replace />;

  return children;
}
