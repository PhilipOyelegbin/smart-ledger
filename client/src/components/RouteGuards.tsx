import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
  const access = useAuthStore((state) => state.access);
  const location = useLocation();

  if (!access) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicRoute() {
  const access = useAuthStore((state) => state.access);

  if (access) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
