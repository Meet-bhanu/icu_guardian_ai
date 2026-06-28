import { useIcuAuth } from "@/hooks/useIcuAuth";
import { canAccessRoute, isAdminRole } from "@/lib/authApi";
import { Spinner } from "@/components/ui/spinner";
import { Redirect, Route } from "wouter";

interface AuthRouteProps {
  path: string;
  component: React.ComponentType;
  /** Minimum role area: admin | doctor | patient */
  area?: "admin" | "doctor" | "patient";
}

function AuthRouteGuard({
  Component,
  area,
}: {
  Component: React.ComponentType;
  area?: "admin" | "doctor" | "patient";
}) {
  const { user, loading, isAuthenticated } = useIcuAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect to="/login" />;
  }

  const path = typeof window !== "undefined" ? window.location.pathname : "";

  if (area === "admin" && !isAdminRole(user.role)) {
    return <Redirect to="/login" />;
  }
  if (area === "doctor" && user.role !== "doctor" && !isAdminRole(user.role)) {
    return <Redirect to="/login" />;
  }
  if (area === "patient" && user.role !== "patient" && !isAdminRole(user.role)) {
    return <Redirect to="/login" />;
  }

  if (!canAccessRoute(user.role, path)) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

export function AuthRoute({ path, component: Component, area }: AuthRouteProps) {
  return (
    <Route
      path={path}
      component={() => <AuthRouteGuard Component={Component} area={area} />}
    />
  );
}

export function LoginRedirect() {
  const { user, loading, isAuthenticated } = useIcuAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === "doctor") return <Redirect to="/doctor/dashboard" />;
    if (user.role === "patient") return <Redirect to="/patient/dashboard" />;
    return <Redirect to="/dashboard" />;
  }

  return <Redirect to="/login" />;
}
