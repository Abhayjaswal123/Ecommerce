import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Loading from "../pages/Loading";
import { getProductsPath, type AuthUser } from "../utils/authStorage";

type UserRole = NonNullable<AuthUser["role"]>;

export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const role = user.role?.toLowerCase() === "vendor" ? "vendor" : "user";

  // Reject users whose role isn't authorized
  if (allowedRoles && !allowedRoles.some((allowedRole) => allowedRole === role)) {
    return <Navigate to={getProductsPath(user.role)} replace />;
  }

  return <Outlet />;
}
