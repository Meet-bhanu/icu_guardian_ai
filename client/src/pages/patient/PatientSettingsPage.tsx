import PatientLayout from "@/components/PatientLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, User } from "lucide-react";
import { usePatientAuth } from "@/hooks/usePatientAuth";

export default function PatientSettingsPage() {
  const { user, session } = usePatientAuth();

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Your notification preferences — {user?.name ?? "Patient"} ({session?.patientId ?? "P001"})
          </p>
        </div>

        <div className="max-w-2xl space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Account</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-900">{user?.name ?? "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">Patient ID</span>
                <span className="font-medium text-gray-900">{session?.patientId ?? "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">Bed / Room</span>
                <span className="font-medium text-gray-900">{session?.bedNo ?? "—"}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Critical Vitals Alerts</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Notify when your vitals need attention</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Medication Reminders</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Reminders for upcoming doses</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Family Notifications</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Allow care team to notify family contacts</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
}
