"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Activity,
  User,
  UserCheck,
  LogOut,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";

export default function PatientSidebar() {
  const { user, authLoading, logout: contextLogout } = useContext(AuthContext);
  const [patientData, setPatientData] = useState(null);
  const [currentPath, setCurrentPath] = useState("/patient/dashboard");
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    doctors: false,
  });

  useEffect(() => {
    // Only update patientData when authLoading is false and user exists
    if (!authLoading && user) {
      const userData = user.data?.user || user;
      setPatientData(userData);
      // console.log("patientData set: ", userData);
    } else if (!authLoading && !user) {
      // console.log("No user found after auth loading completed");
      setPatientData(null);
    }
  }, [user, authLoading]);

  // Don't render sidebar while auth is loading
  if (authLoading) {
    return (
      <aside className="w-64 h-screen bg-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
      </aside>
    );
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // keep expanded menus when opening
    } else {
      // collapse all when closing
      setExpandedMenus({ doctors: false });
    }
  };

  const toggleMenu = (menu) => {
    if (!isOpen) return;
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleLogout = async () => {
    try {
      contextLogout(); // Use context logout method
      toast.success("Logged out successfully");
      window.location.href = "/patient/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  const mainLinks = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Appointments", href: "/patient/appointment", icon: Calendar },
    { name: "Prescriptions", href: "/patient/prescriptions", icon: FileText },
    { name: "Symptoms", href: "/patient/symptoms", icon: Activity },
  ];

  const expandableMenus = [
    {
      id: "doctors",
      name: "Doctors",
      icon: Users,
      subLinks: [
        { name: "My Doctors", href: "/patient/doctor", icon: UserCheck },
        { name: "All Doctors", href: "/patient/doctor/all", icon: Users },
      ],
    },
  ];

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-16"
      } h-screen bg-slate-800 text-white transition-all duration-300 ease-in-out flex flex-col relative`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {isOpen && <h2 className="text-xl font-bold">Patient Panel</h2>}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {/* Main Links */}
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`w-full flex items-center p-2 rounded-lg hover:bg-slate-700 transition-colors ${
                    currentPath === link.href
                      ? "bg-slate-700 font-semibold"
                      : ""
                  }`}
                  title={!isOpen ? link.name : ""}
                  onClick={() => setCurrentPath(link.href)}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isOpen && (
                    <span className="ml-3 text-left">{link.name}</span>
                  )}
                </Link>
              </li>
            );
          })}

          {/* Expandable Menus */}
          {expandableMenus.map((menu) => {
            const Icon = menu.icon;
            const isExpanded = expandedMenus[menu.id];
            const hasActiveSubLink = menu.subLinks.some(
              (subLink) => currentPath === subLink.href
            );

            return (
              <li key={menu.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className={`w-full flex items-center p-2 rounded-lg hover:bg-slate-700 transition-colors ${
                    hasActiveSubLink ? "bg-slate-700" : ""
                  }`}
                  title={!isOpen ? menu.name : ""}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="ml-3 flex-1 text-left">{menu.name}</span>
                      {isExpanded ? (
                        <ChevronDown size={16} className="flex-shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="flex-shrink-0" />
                      )}
                    </>
                  )}
                </button>

                {/* Sub-menu */}
                {isOpen && isExpanded && (
                  <ul className="ml-4 space-y-1 border-l border-slate-700 pl-2">
                    {menu.subLinks.map((subLink) => {
                      const SubIcon = subLink.icon;
                      return (
                        <li key={subLink.href}>
                          <Link
                            href={subLink.href}
                            className={`w-full flex items-center p-2 rounded-lg hover:bg-slate-700 transition-colors text-sm ${
                              currentPath === subLink.href
                                ? "bg-slate-700 font-semibold text-slate-200"
                                : ""
                            }`}
                            onClick={() => setCurrentPath(subLink.href)}
                          >
                            <SubIcon size={16} className="flex-shrink-0" />
                            <span className="ml-2 text-left">
                              {subLink.name}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile Section */}
      <div className="border-t border-slate-700 p-4">
        <Link
          href="/patient/profile"
          className={`w-full flex items-center ${
            isOpen ? "space-x-3" : "justify-center"
          } p-2 rounded-lg hover:bg-slate-700 transition-colors ${
            currentPath === "/patient/profile" ? "bg-slate-700" : ""
          }`}
          onClick={() => setCurrentPath("/patient/profile")}
        >
          <div className="flex-shrink-0">
            {patientData?.profilePic ? (
              <img
                src={patientData.profilePic}
                alt="Patient Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-slate-600">
                <User size={20} className="text-white" />
              </div>
            )}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">
                {patientData?.fullname || patientData?.name || "Patient"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {patientData?.email || ""}
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            isOpen ? "justify-start space-x-2" : "justify-center"
          } px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors duration-200`}
          title={!isOpen ? "Logout" : ""}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
