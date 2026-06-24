import { Link } from "wouter";
import { useEffect, useState } from "react";
import MedicationsSchedule from "@/components/MedicationsSchedule";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { patients } from "@/lib/mockData";
import { getMedicationsForPatient, getPatientById } from "@/lib/patientData";
import { medicationStorageKey } from "@/lib/medicationAlerts";
import { cn } from "@/lib/utils";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getMissedCount(patientId: string): number {
  const meds = getMedicationsForPatient(patientId);
  return meds.filter((med) => {
    const stored = sessionStorage.getItem(medicationStorageKey(patientId, med.id, todayKey()));
    return stored === "missed";
  }).length;
}

interface MedicationsContentProps {
  patientId: string;
  patientName: string;
  showPatientSelector?: boolean;
  onPatientChange?: (patientId: string) => void;
  showAdminSummary?: boolean;
  patientDetailPath?: string;
}

export default function MedicationsContent({
  patientId,
  patientName,
  showPatientSelector = false,
  onPatientChange,
  showAdminSummary = false,
  patientDetailPath,
}: MedicationsContentProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const missedForPatient = getMissedCount(patientId);
  const totalMissedAll = showAdminSummary
    ? patients.reduce((sum, p) => sum + getMissedCount(p.id), 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Medication Schedule</h2>
          <p className="text-gray-500 text-sm mt-1">
            Track administration status — {patientName} ({patientId})
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showPatientSelector && onPatientChange && (
            <Select value={patientId} onValueChange={onPatientChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {patientDetailPath && (
            <Link href={patientDetailPath}>
              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-gray-50 py-1.5 px-3">
                <ExternalLink className="w-3 h-3" />
                Patient profile
              </Badge>
            </Link>
          )}
        </div>
      </div>

      {showAdminSummary && totalMissedAll > 0 && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {totalMissedAll} missed dose{totalMissedAll !== 1 ? "s" : ""} across ICU today
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {patients
                  .filter((p) => getMissedCount(p.id) > 0)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onPatientChange?.(p.id)}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full border transition-colors",
                        p.id === patientId
                          ? "bg-amber-200 border-amber-400 text-amber-900"
                          : "bg-white border-amber-200 text-amber-800 hover:bg-amber-100",
                      )}
                    >
                      {p.name}: {getMissedCount(p.id)} missed
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {missedForPatient > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm font-medium">
              {missedForPatient} missed dose{missedForPatient !== 1 ? "s" : ""} for {patientName} today.
              Alert sounds play automatically when doses are overdue.
            </p>
          </div>
        </Card>
      )}

      <MedicationsSchedule
        key={patientId}
        patientId={patientId}
        patientName={patientName}
      />
    </div>
  );
}
