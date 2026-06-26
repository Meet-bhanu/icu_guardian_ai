import PatientLayout from "@/components/PatientLayout";
import ICUMonitorWaveform from "@/components/ICUMonitorWaveform";
import LiveCameraFeed from "@/components/LiveCameraFeed";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useCriticalVitalMonitor } from "@/hooks/useCriticalVitalMonitor";
import { evaluatePatientVitals } from "@/lib/vitalMonitoring";
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
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function parseBloodPressure(bp: string) {
  const [systolic, diastolic] = bp.split("/").map((v) => parseInt(v, 10));
  return { systolicBP: systolic, diastolicBP: diastolic };
}

const aiDetections = [
  { label: "Motion Detection", active: true, icon: Activity },
  { label: "Face Detection", active: true, icon: User },
  { label: "Bed Exit Detection", active: true, icon: BedDouble },
];

export default function PatientMonitoringPage() {
  const { user, session } = usePatientAuth();
  const initialBp = parseBloodPressure(liveVitals.bloodPressure);
  const [heartRate, setHeartRate] = useState(liveVitals.heartRate);
  const [spO2, setSpO2] = useState(liveVitals.spO2);
  const [systolicBP, setSystolicBP] = useState(initialBp.systolicBP);
  const [diastolicBP, setDiastolicBP] = useState(initialBp.diastolicBP);
  const [respiratoryRate, setRespiratoryRate] = useState(liveVitals.respiratoryRate);
  const [faceDetected, setFaceDetected] = useState(true);
  const patientName = user?.name ?? "John Smith";
  const patientId = session?.patientId ?? "P001";

  const vitals = useMemo(
    () => ({ heartRate, spO2, systolicBP, diastolicBP, respiratoryRate, temperature: 37.8 }),
    [heartRate, spO2, systolicBP, diastolicBP, respiratoryRate],
  );
  const vitalEval = evaluatePatientVitals(vitals);

  useCriticalVitalMonitor({ patientId, patientName, vitals });

  useEffect(() => {
    const id = setInterval(() => {
      setHeartRate((hr) => {
        const spike = Math.random() < 0.08 ? 18 : 0;
        return Math.round(Math.min(145, Math.max(55, hr + (Math.random() - 0.45) * 4 + spike)));
      });
      setSpO2((o2) => {
        const drop = Math.random() < 0.08 ? -6 : 0;
        return Math.round(Math.min(100, Math.max(82, o2 + (Math.random() - 0.5) * 1.2 + drop)));
      });
      setSystolicBP((bp) => Math.round(Math.min(195, Math.max(85, bp + (Math.random() - 0.5) * 6))));
      setRespiratoryRate((rr) => Math.round(Math.min(34, Math.max(10, rr + (Math.random() - 0.5) * 2))));
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
              <LiveCameraFeed
                patientId={patientId}
                label={`${session?.bedNo ?? "ICU-01"} — Bed Monitoring`}
                patientName={patientName}
                onPresenceChange={setFaceDetected}
              />
            </Card>

            <div className="flex flex-wrap gap-3">
              {aiDetections.map((det) => (
                <div
                  key={det.label}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <det.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">{det.label}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      det.label === "Face Detection"
                        ? faceDetected
                          ? "bg-green-500"
                          : "bg-amber-500"
                        : "bg-green-500"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <Card className={cn("p-5", vitalEval.isCritical && "border-red-500 ring-2 ring-red-300")}>
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
                <p className="text-3xl font-bold text-green-700">{systolicBP}/{diastolicBP}</p>
                <p className="text-xs text-green-500 mt-1">mmHg</p>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">Respiratory Rate</span>
                </div>
                <p className="text-3xl font-bold text-orange-700">{respiratoryRate}</p>
                <p className="text-xs text-orange-500 mt-1">breaths/min</p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </PatientLayout>
  );
}
