"use client";

import React, { createContext, useState, useEffect } from "react";
import { isTokenExpired } from "@/utils/auth";

export const AuthContext = createContext();

// Global reference for API interceptor to access clearUser
let globalClearUser = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // Add loading state

  const checkTokenValidity = async () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);

        // Check if token is expired before setting user
        if (userData?.accessToken) {
          const tokenExpired = isTokenExpired(userData?.accessToken);
          if (tokenExpired) {
            // Clear expired data
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
          } else {
            setUser(userData);
          }
        } else {
          setUser(userData);
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setAuthLoading(false); // Set loading to false after checking localStorage
  };

  // Load user from localStorage on app start
  useEffect(() => {
    checkTokenValidity();
  }, []);



  // Login function (save to localStorage + state)
  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Also remove token
    setUser(null);
  };

  // Clear user function (for API interceptor to use)
  const clearUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // Set global reference on mount
  useEffect(() => {
    globalClearUser = clearUser;
    return () => {
      globalClearUser = null;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, clearUser, authLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export function for API interceptor to use
export const getGlobalClearUser = () => globalClearUser;
