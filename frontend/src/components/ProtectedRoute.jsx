"use client";

import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";
import { AuthContext } from "@/context/AuthContext";
import API from "@/utils/api";

export default function ProtectedRoute({
  children,
  allowedRoles = ["patient", "doctor", "admin"],
  redirectTo,
}) {
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect to appropriate login based on current role or default to home
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push("/");
        }
      } else if (
        allowedRoles.length > 0 &&
        user.role &&
        !allowedRoles.includes(user.role)
      ) {
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
          case "patient":
            // router.push(ROUTES.PATIENT_DASHBOARD);
            router.push("/patient/dashboard");
            break;
          case "doctor":
            router.push("/doctor/dashboard");
            break;
          case "admin":
            router.push("/admin/dashboard");
            break;
          default:
            router.push("/");
        }
      }
    }
  }, [user, authLoading, allowedRoles, router, redirectTo]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (
    allowedRoles.length > 0 &&
    user.role &&
    !allowedRoles.includes(user.role)
  ) {
    return null;
  }

  return <>{children}</>;
}
