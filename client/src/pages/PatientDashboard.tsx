import PatientLayout from "@/components/PatientLayout";
import { Link } from "wouter";

import LiveCameraFeed from "@/components/LiveCameraFeed";
import VitalSignsCard from "@/components/VitalSignsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useCriticalVitalMonitor } from "@/hooks/useCriticalVitalMonitor";
import { liveVitals } from "@/lib/mockData";
import {
  Heart,
  Droplets,
  Gauge,
  Wind,
  Camera,
  Brain,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function PatientDashboard() {
  const { user, session } = usePatientAuth();
  const [heartRate, setHeartRate] = useState(75);
  const [spO2, setSpO2] = useState(97);
  const patientName = user?.name ?? "John Smith";
  const patientId = session?.patientId ?? "P001";

  const vitals = useMemo(
    () => ({
      heartRate,
      spO2,
      systolicBP: 118,
      diastolicBP: 78,
      temperature: 37.1,
      respiratoryRate: liveVitals.respiratoryRate,
    }),
    [heartRate, spO2],
  );

  useCriticalVitalMonitor({ patientId, patientName, vitals });

  useEffect(() => {
    const id = setInterval(() => {
      setHeartRate((hr) => Math.round(Math.min(100, Math.max(68, hr + (Math.random() - 0.5) * 2))));
      setSpO2((o2) => Math.round(Math.min(100, Math.max(94, o2 + (Math.random() - 0.5) * 0.3))));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="hh-page-title">Dashboard</h1>
          <p className="hh-page-subtitle">Your health overview and real-time monitoring</p>
        </div>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <Link href="/patient/overview">
                <span className="text-base font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1 w-fit">
                  {patientName}
                </span>
              </Link>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient ID</p>
              <p className="text-base font-semibold text-gray-900">{patientId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bed / Room</p>
              <p className="text-base font-semibold text-gray-900">{session?.bedNo ?? "ICU-01"}</p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Live Overview — {patientName} ({patientId})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-red-600">Heart Rate</span>
                </div>
                <p className="text-2xl font-bold text-red-700">{heartRate}</p>
                <p className="text-xs text-red-500 mt-1">bpm</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">SpO₂</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{spO2}%</p>
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

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monitoring Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Camera</span>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Vitals Tracking</span>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Running</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">Your Status</span>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Stable</Badge>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card className="overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Live Camera Preview</h2>
            </div>
            <LiveCameraFeed autoStart patientId={patientId} label={`${session?.bedNo ?? "ICU-01"} — Bed View`} />
          </Card>
        </div>

        <VitalSignsCard
          heartRate={heartRate}
          spO2={spO2}
          systolicBP={118}
          diastolicBP={78}
          temperature={37.1}
          respiratoryRate={liveVitals.respiratoryRate}
        />

        <Card className="p-8 text-center">
          <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Recovery trends and full history</p>
          <p className="text-sm text-gray-500 mt-2">
            Detailed analytics are managed by your care team
          </p>
        </Card>
      </div>
    </PatientLayout>
  );
}
