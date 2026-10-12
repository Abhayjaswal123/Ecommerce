import { Navigate, Outlet } from "react-router";
import { getStoredUser } from "../utils/authStorage";

const ProtectedRoute = () => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;