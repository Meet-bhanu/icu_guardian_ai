import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import AdminPatientSelector from "@/components/AdminPatientSelector";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import ICUMonitorWaveform from "@/components/ICUMonitorWaveform";
import { useAdminSelectedPatient } from "@/hooks/useAdminSelectedPatient";
import { liveVitals } from "@/lib/mockData";

export default function WaveformsPage() {
  const { patientId, setPatientId, patientName } = useAdminSelectedPatient();

  const [heartRate, setHeartRate] = useState(liveVitals.heartRate);
  const [spO2, setSpO2] = useState(liveVitals.spO2);
  const [respRate, setRespRate] = useState(liveVitals.respiratoryRate);

  useEffect(() => {
    const id = setInterval(() => {
      setHeartRate((hr) => Math.round(Math.min(120, Math.max(60, hr + (Math.random() - 0.5) * 2))));
      setSpO2((o2) => Math.round(Math.min(100, Math.max(90, o2 + (Math.random() - 0.5) * 0.4))));
      setRespRate((rr) => Math.round(Math.min(30, Math.max(10, rr + (Math.random() - 0.5) * 0.5))));
    }, 2000);
    return () => clearInterval(id);
  }, [patientId]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Waveforms</h1>
            <p className="text-gray-500 text-sm mt-1">
              Real-time physiological waveforms — {patientName} ({patientId})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminPatientSelector patientId={patientId} onPatientChange={setPatientId} />
            <Select defaultValue="1h">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">Last 15 min</SelectItem>
                <SelectItem value="1h">Last 1 hour</SelectItem>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon"><ZoomOut className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon"><ZoomIn className="w-4 h-4" /></Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ICUMonitorWaveform
            key={`${patientId}-ecg`}
            type="ecg"
            label="ECG — Heart Rate"
            value={heartRate}
            unit="bpm"
            heartRate={heartRate}
            color="#ef4444"
            size="large"
          />
          <ICUMonitorWaveform
            key={`${patientId}-spo2`}
            type="spo2"
            label="SpO₂ — Oxygen Level"
            value={spO2}
            unit="%"
            heartRate={heartRate}
            color="#3b82f6"
            size="large"
          />
          <ICUMonitorWaveform
            key={`${patientId}-resp`}
            type="resp"
            label="Respiration Rate"
            value={respRate}
            unit="breaths/min"
            heartRate={heartRate}
            color="#f97316"
            size="large"
          />
          <ICUMonitorWaveform
            key={`${patientId}-pulse`}
            type="pulse"
            label="Pulse Waveform"
            value={heartRate}
            unit="bpm"
            heartRate={heartRate}
            color="#22c55e"
            size="large"
          />
        </div>
      </div>
    </AppLayout>
  );
}
