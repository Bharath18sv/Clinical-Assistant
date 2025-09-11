"use client";
import PatientSidebar from "@/components/PatientSidebar";
import { usePathname } from "next/navigation";

export default function PatientLayout({ children }) {
  const path = usePathname();

  const hideSidebar = path === "/patient/signup" || "/patient/login";
  return (
    <div className="flex h-screen">
      {!hideSidebar && <PatientSidebar />}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
