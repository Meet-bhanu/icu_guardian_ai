import PatientLayout from "@/components/PatientLayout";
import ICUMonitorWaveform from "@/components/ICUMonitorWaveform";
import LiveCameraFeed from "@/components/LiveCameraFeed";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { liveVitals } from "@/lib/mockData";
import {
  Heart,
  Droplets,
  Gauge,
  Wind,
  Activity,
  User,
  BedDouble,
} from "lucide-react";
import { useEffect, useState } from "react";

const aiDetections = [
  { label: "Motion Detection", active: true, icon: Activity },
  { label: "Face Detection", active: true, icon: User },
  { label: "Bed Exit Detection", active: true, icon: BedDouble },
];

export default function PatientMonitoringPage() {
  const { user, session } = usePatientAuth();
  const [heartRate, setHeartRate] = useState(liveVitals.heartRate);
  const [spO2, setSpO2] = useState(liveVitals.spO2);
  const patientName = user?.name ?? "John Smith";
  const patientId = session?.patientId ?? "P001";

  useEffect(() => {
    const id = setInterval(() => {
      setHeartRate((hr) => {
        const next = hr + (Math.random() - 0.5) * 2;
        return Math.round(Math.min(120, Math.max(60, next)));
      });
      setSpO2((o2) => {
        const next = o2 + (Math.random() - 0.5) * 0.4;
        return Math.round(Math.min(100, Math.max(90, next)));
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Monitoring</h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time patient surveillance — {patientName} ({session?.bedNo ?? "ICU-01"})
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden p-0">
              <LiveCameraFeed label={`${session?.bedNo ?? "ICU-01"} — Bed Monitoring`} />
            </Card>

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

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-time Vitals</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Heart Rate</span>
                </div>
                <p className="text-3xl font-bold text-red-700">{heartRate}</p>
                <p className="text-xs text-red-500 mt-1">bpm</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">SpO₂</span>
                </div>
                <p className="text-3xl font-bold text-blue-700">{spO2}%</p>
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Physiological Waveforms</h2>
            <Badge variant="outline" className="text-xs">
              {patientName} ({patientId})
            </Badge>
          </div>
          <ICUMonitorWaveform
            type="ecg"
            label="ECG — Heart Rate"
            value={heartRate}
            unit="bpm"
            heartRate={heartRate}
            color="#00ff41"
          />
          <ICUMonitorWaveform
            type="spo2"
            label="SpO₂ — Oxygen Saturation"
            value={spO2}
            unit="%"
            heartRate={heartRate}
            color="#38bdf8"
          />
        </div>
      </div>
    </PatientLayout>
  );
}
