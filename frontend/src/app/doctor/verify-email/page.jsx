import { Suspense } from "react";
import DoctorEmailVerificationContent from "./DoctorEmailVerificationContent";

export default function DoctorEmailVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <DoctorEmailVerificationContent />
    </Suspense>
  );
}
