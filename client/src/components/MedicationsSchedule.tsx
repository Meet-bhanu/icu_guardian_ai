import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Pill } from "lucide-react";
import { useMedicationSchedule } from "@/hooks/useMedicationSchedule";
import type { MedicationAdminStatus } from "@/lib/patientData";
import { cn } from "@/lib/utils";

const statusLabels: Record<MedicationAdminStatus, string> = {
  not_given: "Not Given",
  given: "Given",
  missed: "Missed",
};

const statusStyles: Record<MedicationAdminStatus, string> = {
  not_given: "bg-gray-100 text-gray-700",
  given: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
};

interface MedicationsScheduleProps {
  patientId: string;
  patientName: string;
}

export default function MedicationsSchedule({ patientId, patientName }: MedicationsScheduleProps) {
  const { medications, statuses, setMedicationStatus, compliance, nextDue } =
    useMedicationSchedule(patientId, patientName);

  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (compliance / 100) * circumference;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="p-4 lg:col-span-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Administration Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((med) => {
                const status = statuses[med.id] ?? "not_given";
                return (
                  <TableRow
                    key={med.id}
                    className={cn(status === "missed" && "bg-red-50/50")}
                  >
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell>{med.frequency}</TableCell>
                    <TableCell>{med.time}</TableCell>
                    <TableCell>
                      <Select
                        value={status}
                        onValueChange={(value) =>
                          setMedicationStatus(med.id, value as MedicationAdminStatus)
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "w-[140px] h-8 text-xs font-medium border-0",
                            statusStyles[status],
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_given">{statusLabels.not_given}</SelectItem>
                          <SelectItem value="given">{statusLabels.given}</SelectItem>
                          <SelectItem value="missed">{statusLabels.missed}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          If a dose is not marked as given by its scheduled time, it is automatically marked missed
          and an alert sound plays for {patientName}.
        </p>
      </Card>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Next Dose</h2>
          </div>
          <div className="text-center py-4">
            {nextDue ? (
              <>
                <p className="text-sm text-gray-500 mb-2">
                  {nextDue.name} — {nextDue.dosage}
                </p>
                <div className="text-2xl font-bold text-orange-600">{nextDue.time}</div>
                <p className="text-xs text-gray-400 mt-2">Scheduled for {patientName}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">All doses recorded for today</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Medication Compliance</h2>
          </div>
          <div className="flex flex-col items-center py-2">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{compliance}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">Today&apos;s compliance rate</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
