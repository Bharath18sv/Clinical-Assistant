"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  User,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  X,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation"; // <-- usePathname instead of router
import { AuthContext } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function AdminSidebar() {
  const { user, authLoading, logout: contextLogout } = useContext(AuthContext);
  const [adminData, setAdminData] = useState(null);
  const pathname = usePathname(); // current route
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    doctors: false,
    patients: false,
    appointments: false,
  });

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // When opening sidebar, keep current expanded state
    } else {
      // When closing sidebar, collapse all menus
      setExpandedMenus({
        doctors: false,
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
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Patients",
      href: "/admin/patients",
      icon: User,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: User,
    },
    {
      name: "Appointments",
      href: "/admin/appointments",
      icon: Calendar,
    },
  ];

  const expandableMenus = [
    {
      id: "doctors",
      name: "Doctors",
      icon: Users,
      subLinks: [
        { name: "All Doctors", href: "/admin/doctors", icon: Users },
        { name: "Add Doctor", href: "/admin/doctors/add", icon: UserPlus },
        {
          name: "Approve Doctors",
          href: "/admin/doctors/approve",
          icon: CheckCircle,
        },
      ],
    },
    // {
    //   id: "patients",
    //   name: "Patients",
    //   icon: UserCheck,
    //   subLinks: [
    //     { name: "All Patients", href: "/admin/patients", icon: UserCheck },
    //     { name: "Active", href: "/admin/patients/active", icon: CheckCircle },
    //     { name: "Inactive", href: "/admin/patients/inactive", icon: XCircle },
    //   ],
    // },
    // {
    //   id: "appointments",
    //   name: "Appointments",
    //   icon: Calendar,
    //   subLinks: [
    //     {
    //       name: "All Appointments",
    //       href: "/admin/appointments",
    //       icon: Calendar,
    //     },
    //     { name: "Active", href: "/admin/appointments/active", icon: Clock },
    //     {
    //       name: "Completed",
    //       href: "/admin/appointments/completed",
    //       icon: CheckCircle,
    //     },
    //   ],
    // },
    // {
    //   id: "reports",
    //   name: "Reports",
    //   icon: LayoutDashboard,
    //   subLinks: [
    //     {
    //       name: "Export Reports",
    //       href: "/admin/reports",
    //       icon: LayoutDashboard,
    //     },
    //   ],
    // },
  ];

  useEffect(() => {
    if (user) {
      setAdminData(user?.user);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      contextLogout(); // Use context logout method
      toast.success("Logged out successfully");
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  return (
    <aside
      className={`${
        isOpen ? "w-85" : "w-16"
      } h-screen bg-slate-800 text-white transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        {isOpen && <h2 className="text-xl font-bold">Admin Panel</h2>}
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
                    pathname === link.href ? "bg-slate-700 font-semibold" : ""
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
                              pathname === subLink.href
                                ? "bg-slate-700 font-semibold text-slate-200"
                                : ""
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
        <div
          className={`flex items-center ${
            isOpen ? "space-x-3" : "justify-center"
          }`}
        >
          <div className="flex-shrink-0">
            {adminData?.profilePic ? (
              <img
                src={adminData?.profilePic}
                alt="Admin Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-600"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-slate-600">
                <User size={20} className="text-white" />
              </div>
            )}
          </div>

          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {adminData?.fullname}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {adminData?.email}
              </p>
            </div>
          )}
        </div>
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
