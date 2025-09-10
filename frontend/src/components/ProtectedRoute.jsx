"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { ROUTES } from "@/utils/routes";

export default function ProtectedRoute({
  children,
  allowedRoles = ["patient", "doctor", "admin"],
  redirectTo,
}) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to appropriate login based on current role or default to home
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(ROUTES.HOME);
        }
      } else if (
        allowedRoles.length > 0 &&
        userRole &&
        !allowedRoles.includes(userRole)
      ) {
        // Redirect to appropriate dashboard based on user role
        switch (userRole) {
          case "patient":
            router.push(ROUTES.PATIENT_DASHBOARD);
            break;
          case "doctor":
            router.push(ROUTES.DOCTOR_DASHBOARD);
            break;
          case "admin":
            router.push(ROUTES.ADMIN_DASHBOARD);
            break;
          default:
            router.push(ROUTES.HOME);
        }
      }
    }
  }, [user, loading, userRole, allowedRoles, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
