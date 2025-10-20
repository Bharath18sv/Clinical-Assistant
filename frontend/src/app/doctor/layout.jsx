"use client";

import DoctorSidebar from "@/components/sidebars/DoctorSidebar";
import { usePathname } from "next/navigation";

export default function DoctorLayout({ children }) {
  const path = usePathname();
  const hidePaths = path === "/doctor/login" || path === "/doctor/verify-email";
  return (
    <div className="flex h-screen">
      {!hidePaths && <DoctorSidebar />}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
