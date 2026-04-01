import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* Orbital spinner — reuses the same visual language as LoadingState in States.jsx */
function AuthLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface-0">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border border-surface-3" />
        <div
          className="absolute inset-0 rounded-full border-t border-accent animate-spin"
          style={{ animationDuration: "0.9s" }}
        />
        <div className="absolute inset-[10px] rounded-full border border-surface-4/50" />
        <div
          className="absolute inset-[10px] rounded-full border-t border-accent/50 animate-spin"
          style={{ animationDuration: "1.4s", animationDirection: "reverse" }}
        />
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
