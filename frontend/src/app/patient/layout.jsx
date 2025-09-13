"use client";
import PatientSidebar from "@/components/PatientSidebar";
import { usePathname } from "next/navigation";

export default function PatientLayout({ children }) {
  const path = usePathname();
  let hideSidebar = false;
  console.log(path);
  if (path === "/patient/signup" || path === "/patient/login") {
    hideSidebar = true;
  }
  return (
    <div className="flex h-screen">
      {!hideSidebar && <PatientSidebar />}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
