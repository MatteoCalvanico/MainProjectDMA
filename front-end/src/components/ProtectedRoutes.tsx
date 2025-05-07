import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { JSX } from "react";

interface ProtectedRouteProps {
  children: JSX.Element | JSX.Element[];
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn } = useAppContext(); // Prendiamo il flag di loggato/non loggato dall'AppContext

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
