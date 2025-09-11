"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PatientSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/patient/dashboard" },
    { name: "Appointments", href: "/patient/appointment" },
    { name: "Prescriptions", href: "/patient/prescriptions" },
    { name: "Symptoms", href: "/patient/symptoms" },
    { name: "Profile", href: "/patient/profile" },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-4">
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
      {/* //logout button */}
      <div className="absolute bottom-4 left-4">
        <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold transition-colors duration-200">
          Logout
        </button>
      </div>
    </aside>
  );
}
