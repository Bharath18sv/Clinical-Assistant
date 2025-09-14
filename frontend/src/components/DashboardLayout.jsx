"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, UserRole } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { User, isDoctor, isPatient, isAdmin } from "@/utils/types";

export const DashboardLayout = ({ children, className = "", requiredRole }) => {
  const { user, userRole, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // 🔹 Redirect logic inside useEffect
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user || !userRole)) {
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      let loginPath = "/";

      if (currentPath.startsWith("/patient")) {
        loginPath = "/patient/login";
      } else if (currentPath.startsWith("/doctor")) {
        loginPath = "/doctor/login";
      } else if (currentPath.startsWith("/admin")) {
        loginPath = "/admin/login";
      }

      router.push(loginPath);
    }
  }, [loading, isAuthenticated, user, userRole, router]);

  // Show loading while auth is being checked
  if (loading || (!isAuthenticated && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">
            Please wait while we load your dashboard.
          </p>
        </div>
      </div>
    );
  }

  // 🔹 Role-based access check
  if (requiredRole && userRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <p>You don't have permission to access this page.</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  // 🔹 Helpers
  const getUserDisplayName = () => {
    if (user?.fullname) return user.fullname;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const getUserAvatar = () => {
    return user?.profilePic || "/default-avatar.png";
  };

  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      <Sidebar userRole={userRole} userName={getUserDisplayName()} />
      <div className="flex-1 overflow-hidden">
        {/* Top bar with user info */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-semibold text-gray-900"></h1>

              {/* User info in top bar */}
              <div className="flex items-center space-x-4">
                {user && isDoctor(user) && !user.isAvailable && (
                  <span className="status-badge status-cancelled">
                    Unavailable
                  </span>
                )}

                {user && isDoctor(user) && user.status === "pending" && (
                  <span className="status-badge status-pending">
                    Pending Approval
                  </span>
                )}

                <div className="flex items-center space-x-2">
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={getUserAvatar()}
                    alt={getUserDisplayName()}
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {getUserDisplayName()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
