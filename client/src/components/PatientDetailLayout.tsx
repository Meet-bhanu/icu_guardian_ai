import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { setAdminSelectedPatientId } from "@/hooks/useAdminSelectedPatient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPatientById } from "@/lib/patientData";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Contact,
  FileText,
  LayoutDashboard,
  Pill,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import NotFound from "@/pages/NotFound";

const statusStyles = {
  Critical: "bg-red-100 text-red-700",
  Stable: "bg-green-100 text-green-700",
  Warning: "bg-orange-100 text-orange-700",
};

const tabs = [
  { label: "Overview", segment: "", icon: LayoutDashboard },
  { label: "Reports", segment: "reports", icon: FileText },
  { label: "Health Trends", segment: "trends", icon: TrendingUp },
  { label: "Medications", segment: "medications", icon: Pill },
  { label: "Doctors", segment: "doctors", icon: Stethoscope },
  { label: "Family Contacts", segment: "family", icon: Contact },
] as const;

interface PatientDetailLayoutProps {
  children: React.ReactNode;
  activeSegment?: string;
}

export function usePatientDetailRoute() {
  const [location] = useLocation();
  const match = location.match(/^\/dashboard\/patients\/([^/]+)/);
  const patientId = match?.[1] ?? "";
  const patient = getPatientById(patientId);
  return { patientId, patient, match: Boolean(match) };
}

export default function PatientDetailLayout({
  children,
  activeSegment = "",
}: PatientDetailLayoutProps) {
  const { patientId, patient, match } = usePatientDetailRoute();
  const [location] = useLocation();

  useEffect(() => {
    if (patientId) {
      setAdminSelectedPatientId(patientId);
    }
  }, [patientId]);

  if (!match || !patient) {
    return (
      <AppLayout>
        <NotFound />
      </AppLayout>
    );
  }

  const basePath = `/dashboard/patients/${patientId}`;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/patients">
            <Button variant="ghost" className="w-fit gap-2 -ml-2 text-gray-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Patients
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {patient.id} · Bed {patient.bedNo} · {patient.doctor}
              </p>
            </div>
            <Badge className={cn("text-xs w-fit", statusStyles[patient.status])}>
              {patient.status}
            </Badge>
          </div>
        </div>

        <Card className="p-2">
          <nav className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const href = tab.segment ? `${basePath}/${tab.segment}` : basePath;
              const isActive =
                tab.segment === activeSegment ||
                (tab.segment === "" && location === basePath);
              return (
                <Link key={tab.segment || "overview"} href={href}>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                </Link>
              );
            })}
          </nav>
        </Card>

        {children}
      </div>
    </AppLayout>
  );
}
