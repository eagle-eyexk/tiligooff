import { useAuth } from "@/lib/AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { status } = useAuth();

  if (status === "AUTH_REQUIRED") {
    return <Navigate to="/user/login" replace />;
  }

  if (status === "USER_NOT_REGISTERED") {
    return <div>User not registered for this app</div>;
  }

  return children;
}
