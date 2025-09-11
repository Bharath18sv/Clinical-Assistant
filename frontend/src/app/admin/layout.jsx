"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // Hide sidebar on login and signup pages
  const hideSidebar =
    pathname === "/admin/login" || pathname === "/admin/signup";
  return (
    <div className="flex h-screen">
      {!hideSidebar && <AdminSidebar />}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
