import React from "react";
import { UserPlus, Calendar, Activity, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

function QuickActions() {
  const router = useRouter();

  return (
    <div>
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/patient/find-doctors")}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Find New Doctor</p>
              <p className="text-sm text-gray-600">Discover more specialists</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
          </button>
          <button
            onClick={() => router.push("/patient/appointment")}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">My Appointments</p>
              <p className="text-sm text-gray-600">View scheduled visits</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
          </button>
          <button
            onClick={() => router.push("/patient/health-records")}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Health Records</p>
              <p className="text-sm text-gray-600">Access medical history</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickActions;
