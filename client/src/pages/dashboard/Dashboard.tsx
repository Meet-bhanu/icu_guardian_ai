import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  AlertTriangle,
  UserPlus,
  UserMinus,
  Heart,
  Droplets,
  Gauge,
  Wind,
  Camera,
  Brain,
  Shield,
} from "lucide-react";
import {
  dashboardStats,
  liveVitals,
  recentAlerts,
  aiMonitoringStatus,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

const severityStyles = {
  critical: "bg-red-100 text-red-700",
  warning: "bg-orange-100 text-orange-700",
  info: "bg-blue-100 text-blue-700",
};

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">ICU overview and real-time monitoring</p>
        </div>

        {/* Summary Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">Total Patients</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalPatients}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">Critical Patients</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{dashboardStats.criticalPatients}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">Today's Admissions</span>
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.todayAdmissions}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">Discharges Today</span>
              <UserMinus className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.dischargesToday}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Overview */}
          <Card className="p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Overview — John Smith (P001)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-red-600">Heart Rate</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{liveVitals.heartRate}</p>
                <p className="text-xs text-red-500 mt-1">bpm — Elevated</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">SpO₂</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{liveVitals.spO2}%</p>
                <p className="text-xs text-blue-500 mt-1">Normal range</p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-green-600">Blood Pressure</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{liveVitals.bloodPressure}</p>
                <p className="text-xs text-green-500 mt-1">mmHg</p>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium text-orange-600">Resp. Rate</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">{liveVitals.respiratoryRate}</p>
                <p className="text-xs text-orange-500 mt-1">breaths/min</p>
              </div>
            </div>
          </Card>

          {/* AI Monitoring Status */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Monitoring Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Cameras</span>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {aiMonitoringStatus.cameras}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">AI Detection</span>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {aiMonitoringStatus.aiDetection}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">System Health</span>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  {aiMonitoringStatus.systemHealth}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      alert.severity === "critical" ? "bg-red-500" :
                      alert.severity === "warning" ? "bg-orange-500" : "bg-blue-500"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-500">Patient {alert.patientId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn("text-xs", severityStyles[alert.severity])}>
                    {alert.severity}
                  </Badge>
                  <span className="text-xs text-gray-400">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
