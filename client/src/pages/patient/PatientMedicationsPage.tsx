import PatientLayout from "@/components/PatientLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Pill } from "lucide-react";
import { medications } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Given: "bg-green-100 text-green-700",
  "Due in 00:25": "bg-orange-100 text-orange-700",
  Scheduled: "bg-blue-100 text-blue-700",
};

export default function PatientMedicationsPage() {
  const compliance = 85;
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (compliance / 100) * circumference;

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-500 text-sm mt-1">Your medication schedule and compliance</p>
        </div>

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
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell>{med.dosage}</TableCell>
                      <TableCell>{med.frequency}</TableCell>
                      <TableCell>{med.time}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", statusStyles[med.status] ?? "bg-gray-100 text-gray-700")}>
                          {med.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">Next Dose Reminder</h2>
              </div>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">Heparin — 5000 IU</p>
                <div className="text-4xl font-bold text-orange-600 font-mono">00:25</div>
                <p className="text-xs text-gray-400 mt-2">Due at 02:00 PM</p>
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
                <p className="text-sm text-gray-500 mt-3">This week&apos;s compliance rate</p>
              </div>
            </Card>

            <Card className="p-5 bg-gray-50">
              <p className="text-sm text-gray-600">
                Contact your nurse if you have questions about any medication. You cannot modify
                prescriptions from this portal.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
