import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppState } from "@/context/AppStateContext";

export default function AppRequireAuth() {
  const { isLoggedIn } = useAppState();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/app/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
