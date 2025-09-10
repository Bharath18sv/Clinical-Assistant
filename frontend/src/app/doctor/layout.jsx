import DoctorSidebar from "@/components/doctor/DoctorSidebar";

export default function DoctorLayout({ children }) {
  return (
    <div className="flex">
      <DoctorSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
