import { Navigate } from "react-router-dom";
import { getSession } from "../lib/auth/session";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
