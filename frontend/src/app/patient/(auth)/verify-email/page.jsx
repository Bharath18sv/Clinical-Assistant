import { Suspense } from "react";
import PatientEmailVerificationContent from "./PatientEmailVerificationContent";

export default function PatientEmailVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <PatientEmailVerificationContent />
    </Suspense>
  );
}
