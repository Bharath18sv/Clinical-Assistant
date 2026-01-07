"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Pill,
  Bell
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import API from "@/utils/api";

export default function PatientSidebar() {
  const { user, authLoading, logout: contextLogout } = useContext(AuthContext);
  // console.log("user in profile", user);
  const [patientData, setPatientData] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({ doctors: false });
  const [unreadCount, setUnreadCount] = useState(0);

  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && user) {

      // console.log('Full user object in patient sidebar:', user);
      // console.log('user.role:', user.role);
      // console.log('user.user:', user.user);
      // console.log('user.data:', user.data);
      
      // Patient login API returns: { user: patientData, accessToken, refreshToken, role }
      const userData = user.user || user.data?.user || user;
      // console.log('Final extracted userData:', userData);

      setPatientData(userData);
    } else if (!authLoading && !user) {
      setPatientData(null);
    }
  }, [user, authLoading]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await API.get("/notifications/unread-count");
        if (response.data?.data?.count !== undefined) {
          setUnreadCount(response.data.data.count);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    if (user) {
      fetchUnreadCount();
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (authLoading) {
    return (
      <aside className="w-64 h-screen bg-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
      </aside>
    );
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) setExpandedMenus({ doctors: false });
  };

  const toggleMenu = (menu) => {
    if (!isOpen) return;
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = async () => {
    try {
      contextLogout();
      toast.success("Logged out successfully");
      window.location.href = "/patient/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  const mainLinks = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Medications", href: "/patient/medications", icon: Pill },
    { name: "Appointments", href: "/patient/appointment", icon: Calendar },
    { name: "Prescriptions", href: "/patient/prescriptions", icon: FileText },
    { name: "Symptoms", href: "/patient/symptoms", icon: Activity },
    { name: "Notifications", href: "/patient/notification", icon: Bell },
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

  // Helper: check if a path matches or is nested under it
  const isPathActive = (href) => pathname.startsWith(href);

  return (
    <aside
      className={`${
        isOpen ? "w-85" : "w-16"
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
            const isActive = isPathActive(link.href);
            const isNotifications = link.name === "Notifications";
            const showBadge = isNotifications && unreadCount > 0;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`w-full flex items-center p-2 rounded-lg hover:bg-slate-700 transition-colors ${
                    isActive ? "bg-slate-700 font-semibold text-white" : ""
                  }`}
                  title={!isOpen ? link.name : ""}
                >
                  <div className="relative flex-shrink-0">
                    <Icon size={20} />
                    {/* Badge for collapsed sidebar */}
                    {!isOpen && showBadge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  {isOpen && (
                    <>
                      <span className="ml-3 flex-1">{link.name}</span>
                      {/* Badge for expanded sidebar */}
                      {showBadge && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}

          {/* Expandable Menus */}
          {expandableMenus.map((menu) => {
            const Icon = menu.icon;
            const isExpanded = expandedMenus[menu.id];
            const hasActiveSubLink = menu.subLinks.some((sub) =>
              isPathActive(sub.href)
            );

            return (
              <li key={menu.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className={`w-full flex items-center p-2 rounded-lg hover:bg-slate-700 transition-colors ${
                    hasActiveSubLink ? "bg-slate-700 font-semibold" : ""
                  }`}
                  title={!isOpen ? menu.name : ""}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="ml-3 flex-1 text-left">{menu.name}</span>
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </>
                  )}
                </button>

                {/* Sub-menu */}
                {isOpen && isExpanded && (
                  <ul className="ml-4 space-y-1 border-l border-slate-700 pl-2">
                    {menu.subLinks.map((subLink) => {
                      const SubIcon = subLink.icon;
                      const subActive = isPathActive(subLink.href);
                      return (
                        <li key={subLink.href}>
                          <Link
                            href={subLink.href}
                            className={`w-full flex items-center p-2 rounded-lg hover:bg-slate-700 transition-colors text-sm ${
                              subActive
                                ? "bg-slate-700 font-semibold text-slate-200"
                                : ""
                            }`}
                          >
                            <SubIcon size={16} />
                            <span className="ml-2">{subLink.name}</span>
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
            isPathActive("/patient/profile") ? "bg-slate-700 font-semibold" : ""
          }`}
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
          <LogOut size={16} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
