"use client";

import DoctorSidebar from "@/components/DoctorSidebar";
import { usePathname } from "next/navigation";

export default function DoctorLayout({ children }) {
  const path = usePathname();
  const hidePaths = path === "/doctor/login";
  return (
    <div className="flex h-screen">
      {!hidePaths && <DoctorSidebar />}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
