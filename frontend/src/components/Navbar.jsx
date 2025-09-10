"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, ChevronDown, UserCircle, LogOut } from "lucide-react";
import { getUserRole } from "@/utils/roles";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = ({ user }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const role = getUserRole();
  const { logout } = useAuth();
  const dropdownRef = useRef < HTMLDivElement > null;

  const handleLogout = () => {
    logout(); // clears tokens + redirects
  };

  // Role-based profile path
  const profilePath =
    role === "admin"
      ? "/admin/profile"
      : role === "doctor"
      ? "/doctor/profile"
      : "/patient/profile";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Smart Care Assistant
            </h1>
          </div>
          {role && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <span className="text-gray-700 font-medium">
                  {user?.fullname}
                </span>
                <ChevronDown
                  className={`text-gray-500 transform transition-transform duration-300 ${
                    open ? "rotate-180" : "rotate-0"
                  }`}
                  size={16}
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullname}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {role === "admin" && (
                      <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Administrator
                      </span>
                    )}
                    {role === "doctor" && (
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Doctor
                      </span>
                    )}
                    {role === "patient" && (
                      <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Patient
                      </span>
                    )}
                  </div>

                  <Link
                    href={profilePath}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <UserCircle size={18} />
                    Profile Settings
                  </Link>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
