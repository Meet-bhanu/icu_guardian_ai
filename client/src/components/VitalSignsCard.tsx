import { Card } from "@/components/ui/card";
import { Heart, Droplets, Gauge, Thermometer, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface VitalSignsCardProps {
  heartRate?: number;
  spO2?: number;
  systolicBP?: number;
  diastolicBP?: number;
  temperature?: number;
  respiratoryRate?: number;
  showAlerts?: boolean;
}

// Define normal ranges for vital signs
const VITAL_RANGES = {
  heartRate: { min: 60, max: 100, critical: { min: 40, max: 130 } },
  spO2: { min: 95, max: 100, critical: { min: 88, max: 100 } },
  systolicBP: { min: 90, max: 140, critical: { min: 70, max: 180 } },
  diastolicBP: { min: 60, max: 90, critical: { min: 40, max: 120 } },
  temperature: { min: 36.5, max: 37.5, critical: { min: 35, max: 40 } },
  respiratoryRate: { min: 12, max: 20, critical: { min: 8, max: 40 } },
};

function getVitalStatus(value: number | undefined, ranges: typeof VITAL_RANGES.heartRate): "normal" | "warning" | "critical" {
  if (value === undefined) return "normal";
  if (value < ranges.critical.min || value > ranges.critical.max) return "critical";
  if (value < ranges.min || value > ranges.max) return "warning";
  return "normal";
}

function getStatusColor(status: "normal" | "warning" | "critical"): string {
  switch (status) {
    case "critical":
      return "text-red-600 bg-red-50";
    case "warning":
      return "text-yellow-600 bg-yellow-50";
    default:
      return "text-green-600 bg-green-50";
  }
}

export default function VitalSignsCard({
  heartRate,
  spO2,
  systolicBP,
  diastolicBP,
  temperature,
  respiratoryRate,
  showAlerts = true,
}: VitalSignsCardProps) {
  const heartRateStatus = getVitalStatus(heartRate, VITAL_RANGES.heartRate);
  const spO2Status = getVitalStatus(spO2, VITAL_RANGES.spO2);
  const systolicBPStatus = getVitalStatus(systolicBP, VITAL_RANGES.systolicBP);
  const temperatureStatus = getVitalStatus(temperature, VITAL_RANGES.temperature);
  const respiratoryStatus = getVitalStatus(respiratoryRate, VITAL_RANGES.respiratoryRate);

  const hasAlert = [heartRateStatus, spO2Status, systolicBPStatus, temperatureStatus, respiratoryStatus].some(
    (status) => status === "critical" || status === "warning"
  );

  return (
    <Card className={cn("p-6 space-y-6", hasAlert && showAlerts && "border-red-300 bg-red-50/30")}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
        {hasAlert && showAlerts && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            Alert
          </div>
        )}
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Heart Rate */}
        <div className={cn("p-4 rounded-lg", getStatusColor(heartRateStatus))}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-medium">Heart Rate</span>
          </div>
          <p className="text-2xl font-bold">{heartRate ?? "--"}</p>
          <p className="text-xs opacity-75 mt-1">60-100 bpm</p>
        </div>

        {/* SpO2 */}
        <div className={cn("p-4 rounded-lg", getStatusColor(spO2Status))}>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4" />
            <span className="text-xs font-medium">SpO₂</span>
          </div>
          <p className="text-2xl font-bold">{spO2 ?? "--"}</p>
          <p className="text-xs opacity-75 mt-1">95-100%</p>
        </div>

        {/* Blood Pressure */}
        <div className={cn("p-4 rounded-lg", getStatusColor(systolicBPStatus))}>
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4" />
            <span className="text-xs font-medium">Blood Pressure</span>
          </div>
          <p className="text-2xl font-bold">
            {systolicBP ?? "--"}/{diastolicBP ?? "--"}
          </p>
          <p className="text-xs opacity-75 mt-1">120/80 mmHg</p>
        </div>

        {/* Temperature */}
        <div className={cn("p-4 rounded-lg", getStatusColor(temperatureStatus))}>
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4" />
            <span className="text-xs font-medium">Temperature</span>
          </div>
          <p className="text-2xl font-bold">{temperature ?? "--"}</p>
          <p className="text-xs opacity-75 mt-1">36.5-37.5°C</p>
        </div>

        {/* Respiratory Rate */}
        <div className={cn("p-4 rounded-lg", getStatusColor(respiratoryStatus))}>
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4" />
            <span className="text-xs font-medium">Respiratory Rate</span>
          </div>
          <p className="text-2xl font-bold">{respiratoryRate ?? "--"}</p>
          <p className="text-xs opacity-75 mt-1">12-20 breaths/min</p>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex gap-4 text-xs pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-600"></div>
          <span className="text-gray-600">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-600"></div>
          <span className="text-gray-600">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-600"></div>
          <span className="text-gray-600">Critical</span>
        </div>
      </div>
    </Card>
  );
}
