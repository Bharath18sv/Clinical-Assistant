"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PatientSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/patient/dashboard" },
    { name: "Appointments", href: "/patient/appointments" },
    { name: "Medications", href: "/patient/medications" },
  ];

  return (
    <aside className="w-64 h-screen bg-green-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Patient Panel</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`block p-2 rounded hover:bg-green-700 ${
                pathname === link.href ? "bg-green-700 font-semibold" : ""
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
