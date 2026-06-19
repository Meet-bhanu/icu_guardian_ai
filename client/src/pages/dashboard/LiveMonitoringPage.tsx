import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Droplets,
  Gauge,
  Wind,
  Eye,
  User,
  BedDouble,
  Activity,
} from "lucide-react";
import { liveVitals } from "@/lib/mockData";

const aiDetections = [
  { label: "Motion Detection", active: true, icon: Activity },
  { label: "Face Detection", active: true, icon: User },
  { label: "Bed Exit Detection", active: true, icon: BedDouble },
];

export default function LiveMonitoringPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time patient surveillance — John Smith (ICU-01)</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                    <Eye className="w-10 h-10 text-white/60" />
                  </div>
                  <p className="text-white/80 text-sm">Live Camera Feed</p>
                  <p className="text-white/50 text-xs mt-1">ICU-01 — Bed Monitoring</p>
                  <Badge className="mt-3 bg-red-500 hover:bg-red-500 text-white gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </Badge>
                </div>
                <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  14:32:08
                </div>
                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  Camera 01
                </div>
              </div>
            </Card>

            {/* AI Detection Status */}
            <div className="flex flex-wrap gap-3">
              {aiDetections.map((det) => (
                <div
                  key={det.label}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <det.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">{det.label}</span>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Vitals Sidebar */}
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-time Vitals</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Heart Rate</span>
                </div>
                <p className="text-3xl font-bold text-red-700">{liveVitals.heartRate}</p>
                <p className="text-xs text-red-500 mt-1">bpm</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">SpO₂</span>
                </div>
                <p className="text-3xl font-bold text-blue-700">{liveVitals.spO2}%</p>
                <p className="text-xs text-blue-500 mt-1">oxygen level</p>
              </div>
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Blood Pressure</span>
                </div>
                <p className="text-3xl font-bold text-green-700">{liveVitals.bloodPressure}</p>
                <p className="text-xs text-green-500 mt-1">mmHg</p>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">Respiratory Rate</span>
                </div>
                <p className="text-3xl font-bold text-orange-700">{liveVitals.respiratoryRate}</p>
                <p className="text-xs text-orange-500 mt-1">breaths/min</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
