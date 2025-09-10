"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  BeakerIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Define user roles
const UserRole = "admin" | "patient" | "doctor";

// Navigation configuration for each user role
const navigationConfig = {
  patient: [
    {
      name: "Dashboard",
      href: "/patient/dashboard",
      icon: HomeIcon,
    },
    {
      name: "Doctors",
      href: "/patient/doctors",
      icon: UserGroupIcon,
      children: [
        { name: "All Doctors", href: "/patient/doctors/all", icon: UsersIcon },
        {
          name: "My Doctors",
          href: "/patient/doctors/my-doctors",
          icon: UserGroupIcon,
        },
      ],
    },
    {
      name: "Appointments",
      href: "/patient/appointments",
      icon: CalendarIcon,
    },
    {
      name: "Medications",
      href: "/patient/medications",
      icon: BeakerIcon,
    },
    {
      name: "Symptoms",
      href: "/patient/symptoms",
      icon: DocumentTextIcon,
    },
    {
      name: "Trends",
      href: "/patient/trends",
      icon: ChartBarIcon,
    },
    {
      name: "Alerts",
      href: "/patient/alerts",
      icon: ExclamationTriangleIcon,
    },
    {
      name: "Profile",
      href: "/patient/profile",
      icon: UsersIcon,
    },
  ],
  doctor: [
    {
      name: "Dashboard",
      href: "/doctor/dashboard",
      icon: HomeIcon,
    },
    {
      name: "Add Patient",
      href: "/doctor/patient/add",
      icon: UserPlusIcon,
    },
    {
      name: "My Patients",
      href: "/doctor/patient",
      icon: UsersIcon,
    },
    {
      name: "Tasks",
      href: "/doctor/tasks",
      icon: CalendarIcon,
    },
    {
      name: "Summary",
      href: "/doctor/summary",
      icon: ChartBarIcon,
    },
    {
      name: "Alerts",
      href: "/doctor/alerts",
      icon: ExclamationTriangleIcon,
    },
    {
      name: "Profile",
      href: "/doctor/profile",
      icon: UsersIcon,
    },
  ],
  admin: [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: HomeIcon,
    },
    {
      name: "Doctors",
      href: "/admin/doctors",
      icon: UserGroupIcon,
      children: [
        { name: "All Doctors", href: "/admin/doctors/all", icon: UsersIcon },
        { name: "Add Doctors", href: "/admin/doctors/add", icon: UserPlusIcon },
        {
          name: "Approve Doctors",
          href: "/admin/doctors/approve",
          icon: DocumentTextIcon,
        },
      ],
    },
    {
      name: "Patients",
      href: "/admin/patients",
      icon: UsersIcon,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: ChartBarIcon,
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: UsersIcon,
    },
  ],
};

// Fallback navigation for users without a valid role
const fallbackNavigation = [
  {
    name: "Home",
    href: "/",
    icon: HomeIcon,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: UsersIcon,
  },
];

const SidebarProps = {
  userRole: UserRole,
  userName: string,
  className: string,
};

const NavItemComponentProps = {
  item: any,
  pathname: string,
  level: number,
};

const NavItemComponent = ({ item, pathname, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href;
  const isChildActive = item.children?.some((child) => pathname === child.href);

  const baseClasses = `
    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
    ${level === 0 ? "pl-3" : "pl-8"}
  `;

  const activeClasses =
    isActive || isChildActive
      ? "bg-gray-100 text-gray-900"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <Link
        href={hasChildren ? "#" : item.href}
        className={`${baseClasses} ${activeClasses}`}
        onClick={handleClick}
      >
        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <span className="flex-1">{item.name}</span>
        {hasChildren && (
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </div>
        )}
      </Link>

      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children?.map((child) => (
            <NavItemComponent
              key={child.href}
              item={child}
              pathname={pathname}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ userRole, userName = "User", className = "" }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const navigation = userRole ? navigationConfig[userRole] : fallbackNavigation;

  const roleDisplayName = {
    admin: "Administrator",
    super_admin: "Super Administrator",
    patient: "Patient",
    doctor: "Doctor",
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="bg-white p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          {isMobileOpen ? (
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0
        ${className}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">
                  {roleDisplayName[userRole] || "User"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                pathname={pathname}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-xs text-gray-500">Dashboard v1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area spacer for desktop */}
      <div
        className="hidden md:block md:w-64 md:flex-shrink-0"
        aria-hidden="true"
      >
        {/* Spacer element to offset the fixed sidebar. */}
      </div>
    </>
  );
};

// Example usage component
export const DashboardLayout = ({ children, userRole, userName }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} userName={userName} />
      <div className="flex-1 overflow-hidden">
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
