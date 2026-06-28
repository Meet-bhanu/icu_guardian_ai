import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { getDoctorsForPatient } from "@/lib/patientData";
import { cn } from "@/lib/utils";

interface DoctorsContentProps {
  patientId: string;
}

export default function DoctorsContent({ patientId }: DoctorsContentProps) {
  const doctors = getDoctorsForPatient(patientId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Doctors</h2>
        <p className="text-gray-500 text-sm mt-1">Healthcare providers assigned to this patient</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor, index) => (
          <Card key={doctor.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              {index === 0 && (
                <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/10">
                  Primary Physician
                </Badge>
              )}
              <Avatar className="w-16 h-16 mb-3">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {doctor.name.split(" ").slice(1).map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{doctor.specialty}</p>
              <div className="mt-2 text-xs text-gray-400 space-y-0.5">
                <p>{(doctor as any).email ?? `${doctor.name.toLowerCase().replace("dr. ", "").replace(" ", ".")}@hospital.com`}</p>
                <p className="font-mono">{(doctor as any).phone ?? "+1 (555) 019-9238"}</p>
              </div>
              <Badge
                className={cn(
                  "mt-3 text-xs",
                  doctor.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700",
                )}
              >
                {doctor.status}
              </Badge>
              <Button variant="link" className="mt-3 text-primary gap-1 text-sm">
                <Calendar className="w-4 h-4" />
                View Schedule
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
