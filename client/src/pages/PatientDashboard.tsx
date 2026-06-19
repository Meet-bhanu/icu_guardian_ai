import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Pill, TrendingUp, User, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">ICU Guardian AI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Button variant="outline" onClick={handleLogout} className="flex gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Vital Signs Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 space-y-2">
            <span className="text-gray-600 font-medium text-sm">Heart Rate</span>
            <p className="text-3xl font-bold text-gray-900">-- bpm</p>
            <p className="text-xs text-gray-500">Normal range: 60-100</p>
          </Card>

          <Card className="p-6 space-y-2">
            <span className="text-gray-600 font-medium text-sm">Oxygen Level</span>
            <p className="text-3xl font-bold text-gray-900">-- %</p>
            <p className="text-xs text-gray-500">Normal range: 95-100</p>
          </Card>

          <Card className="p-6 space-y-2">
            <span className="text-gray-600 font-medium text-sm">Blood Pressure</span>
            <p className="text-3xl font-bold text-gray-900">--/--</p>
            <p className="text-xs text-gray-500">Normal range: 120/80</p>
          </Card>

          <Card className="p-6 space-y-2">
            <span className="text-gray-600 font-medium text-sm">Temperature</span>
            <p className="text-3xl font-bold text-gray-900">-- °C</p>
            <p className="text-xs text-gray-500">Normal range: 36.5-37.5</p>
          </Card>
        </div>

        {/* Main Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Vital Signs History */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Vital Signs History
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No vital data available yet</p>
              <p className="text-sm text-gray-500 mt-2">Your vital signs will be displayed here as they are recorded</p>
            </div>
          </div>

          {/* Medication Schedule */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-primary" />
              Medication Schedule
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No medications scheduled</p>
              <p className="text-sm text-gray-500 mt-2">Your medication schedule will appear here</p>
            </div>
          </div>
        </div>

        {/* Assigned Doctor */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Your Healthcare Team
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No assigned doctor yet</p>
            <p className="text-sm text-gray-500 mt-2">Your assigned healthcare provider will be displayed here</p>
          </div>
        </div>
      </main>
    </div>
  );
}
