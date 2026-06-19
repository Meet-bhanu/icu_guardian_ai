import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, AlertCircle, Pill, Users, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import VitalSignsCard from "@/components/VitalSignsCard";
import AlertPanel from "@/components/AlertPanel";
import MedicationRemindersPanel from "@/components/MedicationRemindersPanel";

export default function DoctorDashboard() {
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
            <span className="text-sm text-gray-600">Dr. {user?.name}</span>
            <Button variant="outline" onClick={handleLogout} className="flex gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Active Patients</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Critical Alerts</span>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Pending Reminders</span>
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Avg Compliance</span>
              <Heart className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">0%</p>
          </Card>
        </div>

        {/* Patients Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Patients</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No patients assigned yet</p>
              <p className="text-sm text-gray-500 mt-2">Patients will appear here once they are assigned to you</p>
            </div>
          </div>

          {/* Vital Signs Demo */}
          <VitalSignsCard
            heartRate={72}
            spO2={98}
            systolicBP={120}
            diastolicBP={80}
            temperature={37.2}
            respiratoryRate={16}
          />

          {/* Alerts Section */}
          <AlertPanel alerts={[]} />

          {/* Medication Reminders Section */}
          <MedicationRemindersPanel reminders={[]} />
        </div>
      </main>
    </div>
  );
}
