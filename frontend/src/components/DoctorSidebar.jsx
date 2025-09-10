"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DoctorSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/doctor/dashboard" },
    { name: "My Patients", href: "/doctor/patients" },
    { name: "Appointments", href: "/doctor/appointments" },
  ];

  return (
    <aside className="w-64 h-screen bg-blue-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Doctor Panel</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`block p-2 rounded hover:bg-blue-700 ${
                pathname === link.href ? "bg-blue-700 font-semibold" : ""
              }`}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
