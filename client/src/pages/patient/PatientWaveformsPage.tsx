import PatientLayout from "@/components/PatientLayout";
import ICUMonitorWaveform from "@/components/ICUMonitorWaveform";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { liveVitals } from "@/lib/mockData";
import { useEffect, useState } from "react";

export default function PatientWaveformsPage() {
  const { user, session } = usePatientAuth();
  const [heartRate, setHeartRate] = useState(liveVitals.heartRate);
  const [spO2, setSpO2] = useState(liveVitals.spO2);
  const patientName = user?.name ?? "John Smith";
  const patientId = session?.patientId ?? "P001";

  useEffect(() => {
    const id = setInterval(() => {
      setHeartRate((hr) => Math.round(Math.min(120, Math.max(60, hr + (Math.random() - 0.5) * 2))));
      setSpO2((o2) => Math.round(Math.min(100, Math.max(90, o2 + (Math.random() - 0.5) * 0.4))));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waveforms</h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time physiological waveforms — {patientName} ({patientId})
          </p>
        </div>

        <div className="space-y-4">
          <ICUMonitorWaveform
            type="ecg"
            label="ECG — Heart Rate"
            value={heartRate}
            unit="bpm"
            heartRate={heartRate}
            color="#00ff41"
            size="large"
          />
          <ICUMonitorWaveform
            type="spo2"
            label="SpO₂ — Oxygen Level"
            value={spO2}
            unit="%"
            heartRate={heartRate}
            color="#38bdf8"
            size="large"
          />
        </div>
      </div>
    </PatientLayout>
  );
}
