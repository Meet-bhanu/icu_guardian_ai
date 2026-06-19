import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import { doctors } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function DoctorsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 text-sm mt-1">Healthcare providers and specialists</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 mb-3">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {doctor.name.split(" ").slice(1).map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{doctor.specialty}</p>
                <Badge
                  className={cn(
                    "mt-3 text-xs",
                    doctor.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
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
    </AppLayout>
  );
}
