import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, AlertTriangle, Palette } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [codeBlueEnabled, setCodeBlueEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("icu-enable-code-blue") === "true";
  });

  const handleToggleCodeBlue = (checked: boolean) => {
    localStorage.setItem("icu-enable-code-blue", checked ? "true" : "false");
    setCodeBlueEnabled(checked);
    window.dispatchEvent(new Event("icu-code-blue-toggle"));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">System configuration and preferences</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold text-red-650 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-550"></span>
                    </span>
                    Code Blue Vitals Alarm
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">Activate hospital-wide voice alarms and siren overlays for critical vital conditions</p>
                </div>
                <Switch checked={codeBlueEnabled} onCheckedChange={handleToggleCodeBlue} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Critical Alerts</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Push notifications for critical events</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Medication Reminders</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Alerts for upcoming medication doses</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Receive daily summary via email</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Sound Alerts</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Play audio for critical alerts</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          {/* Emergency Thresholds */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Emergency Thresholds</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium shrink-0">Heart Rate Alert (bpm)</Label>
                <Select defaultValue="130">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="120">Above 120</SelectItem>
                    <SelectItem value="130">Above 130</SelectItem>
                    <SelectItem value="140">Above 140</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium shrink-0">SpO₂ Alert (%)</Label>
                <Select defaultValue="90">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="92">Below 92</SelectItem>
                    <SelectItem value="90">Below 90</SelectItem>
                    <SelectItem value="88">Below 88</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium shrink-0">Blood Pressure Alert</Label>
                <Select defaultValue="160">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="150">Above 150/100</SelectItem>
                    <SelectItem value="160">Above 160/110</SelectItem>
                    <SelectItem value="180">Above 180/120</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Theme Options */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Theme Options</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-sm font-medium">Color Theme</Label>
                <Select defaultValue="light">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Compact Mode</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Reduce spacing in dashboard views</p>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
