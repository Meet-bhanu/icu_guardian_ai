import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Users, Stethoscope, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function RoleSelection() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<"doctor" | "patient" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setRoleMutation = trpc.auth.setRole.useMutation();

  const handleRoleSelect = async (role: "doctor" | "patient") => {
    setIsLoading(true);
    try {
      await setRoleMutation.mutateAsync({ role });
      setSelectedRole(role);
      
      // Redirect to appropriate dashboard after 1 second
      setTimeout(() => {
        if (role === "doctor") {
          setLocation("/doctor/dashboard");
        } else {
          setLocation("/dashboard");
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to set role:", error);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen hh-gradient-soft">
      <header className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-40 shadow-[var(--hh-shadow-sm)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 hh-gradient-bg rounded-lg flex items-center justify-center shadow-sm shadow-primary/25">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">HealthHalo</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">Welcome to HealthHalo</h1>
            <p className="text-xl text-foreground font-semibold mb-2">Hello, {user?.name}!</p>
            <p className="text-muted-foreground font-medium">Please select your role to get started</p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Doctor Role */}
            <Card
              className={`p-8 cursor-pointer transition-all hh-card ${
                selectedRole === "doctor"
                  ? "ring-2 ring-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "hover:shadow-[var(--hh-shadow-md)]"
              }`}
              onClick={() => !isLoading && handleRoleSelect("doctor")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Healthcare Provider</h2>
                <p className="text-gray-600 mb-6">
                  Monitor patients, manage alerts, track medication compliance, and coordinate care
                </p>

                {/* Features List */}
                <ul className="text-left w-full space-y-2 mb-6 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Real-time patient monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Critical alert management
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Medication compliance tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Patient vital sign analytics
                  </li>
                </ul>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => !isLoading && handleRoleSelect("doctor")}
                  disabled={isLoading}
                >
                  {selectedRole === "doctor" && isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Setting up...
                    </>
                  ) : (
                    "Continue as Doctor"
                  )}
                </Button>
              </div>
            </Card>

            {/* Patient Role */}
            <Card
              className={`p-8 cursor-pointer transition-all ${
                selectedRole === "patient"
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:shadow-[var(--hh-shadow-md)]"
              }`}
              onClick={() => !isLoading && handleRoleSelect("patient")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient</h2>
                <p className="text-gray-600 mb-6">
                  Track your health, receive medication reminders, and stay connected with your care team
                </p>

                {/* Features List */}
                <ul className="text-left w-full space-y-2 mb-6 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Personal vital sign tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Medication reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Recovery progress monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Care team communication
                  </li>
                </ul>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => !isLoading && handleRoleSelect("patient")}
                  disabled={isLoading}
                >
                  {selectedRole === "patient" && isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Setting up...
                    </>
                  ) : (
                    "Continue as Patient"
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-700">
              <strong>Need help?</strong> You can change your role anytime from your account settings.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
