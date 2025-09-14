"use client";

import { useState, useContext, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  LayoutDashboard,
  Users,
  Calendar,
  User,
  UserPlus,
  CheckCircle,
  Clock,
  X,
  LogOut,
} from "lucide-react";
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function DoctorSidebar() {
  const { user, authLoading, logout: contextLogout } = useContext(AuthContext);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState("/doctor/dashboard");

  const [expandedMenus, setExpandedMenus] = useState({
    patients: false,
    appointments: false,
  });
  const [doctorData, setDoctorData] = useState(null);
  // console.log("user", user);

  useEffect(() => {
    setDoctorData(user?.user);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setExpandedMenus({
        patients: false,
        appointments: false,
      });
    }
  };

  const toggleMenu = (menu) => {
    if (!isOpen) return;
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const mainLinks = [
    {
      name: "Dashboard",
      href: "/doctor/dashboard",
      icon: LayoutDashboard,
    },
  ];

  const expandableMenus = [
    {
      id: "patients",
      name: "Patients",
      icon: Users,
      subLinks: [
        { name: "Add Patient", href: "/doctor/patient/add", icon: UserPlus },
        {
          name: "My Patients",
          href: "/doctor/patient/",
          icon: Users,
        },
      ],
    },
    {
      id: "appointments",
      name: "Appointments",
      icon: Calendar,
      subLinks: [
        { name: "Active", href: "/doctor/appointments/active", icon: Clock },
        {
          name: "Completed",
          href: "/doctor/appointments/completed",
          icon: CheckCircle,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      contextLogout(); // Use context logout method
      toast.success("Logged out successfully");
      window.location.href = "/doctor/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-16"
      } h-screen bg-slate-800 text-white transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {isOpen && <h2 className="text-xl font-bold">Doctor Panel</h2>}
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
                  className={`w-full flex items-center p-2 rounded-lg transition-colors ${
                    pathname === link.href
                      ? "bg-slate-700 font-semibold"
                      : "hover:bg-slate-700"
                  }`}
                  title={!isOpen ? link.name : ""}
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
              (subLink) => pathname === subLink.href
            );

            return (
              <li key={menu.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className={`w-full flex items-center p-2 rounded-lg transition-colors ${
                    hasActiveSubLink ? "bg-slate-700" : "hover:bg-slate-700"
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
                            className={`w-full flex items-center p-2 rounded-lg transition-colors text-sm ${
                              pathname === subLink.href
                                ? "bg-slate-700 font-semibold text-slate-200"
                                : "hover:bg-slate-700"
                            }`}
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
          href="/doctor/profile"
          className={`w-full flex items-center ${
            isOpen ? "space-x-3" : "justify-center"
          } p-2 rounded-lg hover:bg-slate-700 transition-colors ${
            currentPath === "/doctor/profile" ? "bg-slate-700" : ""
          }`}
          onClick={() => setCurrentPath("/doctor/profile")}
        >
          <div className="flex-shrink-0">
            {doctorData?.profilePic ? (
              <img
                src={doctorData.profilePic}
                alt="Doctor Profile"
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
                {doctorData?.fullname || doctorData?.name || "Doctor"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {doctorData?.email || ""}
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
