import PatientSidebar from "@/components/patient/PatientSidebar";

export default function PatientLayout({ children }) {
  return (
    <div className="flex">
      <PatientSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
