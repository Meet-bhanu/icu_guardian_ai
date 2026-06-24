import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import {
  Contact,
  FileText,
  Pill,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { getPatientById } from "@/lib/patientData";
import { usePatientAuth } from "@/hooks/usePatientAuth";

const sections = [
  {
    title: "Reports",
    description: "Medical reports, lab results, and scan documentation",
    segment: "reports",
    icon: FileText,
    color: "text-primary",
  },
  {
    title: "Health Trends",
    description: "Recovery progress and vital sign analytics",
    segment: "trends",
    icon: TrendingUp,
    color: "text-blue-600",
  },
  {
    title: "Medications",
    description: "Medication schedule and administration tracking",
    segment: "medications",
    icon: Pill,
    color: "text-green-600",
  },
  {
    title: "Doctors",
    description: "Assigned physicians and care team",
    segment: "doctors",
    icon: Stethoscope,
    color: "text-purple-600",
  },
  {
    title: "Family Contacts",
    description: "Emergency contacts and family members",
    segment: "family",
    icon: Contact,
    color: "text-orange-600",
  },
];

interface PatientOverviewContentProps {
  patientId: string;
}

export default function PatientOverviewContent({ patientId }: PatientOverviewContentProps) {
  const { isPatient } = usePatientAuth();
  const patient = getPatientById(patientId);
  if (!patient) return null;

  const basePath = isPatient ? "/patient" : `/dashboard/patients/${patientId}`;

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Summary</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Age / Gender</p>
            <p className="font-semibold text-gray-900">
              {patient.age} · {patient.gender}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bed Number</p>
            <p className="font-semibold text-gray-900">{patient.bedNo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Attending Doctor</p>
            <p className="font-semibold text-gray-900">{patient.doctor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-semibold text-gray-900">{patient.status}</p>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link key={section.segment} href={`${basePath}/${section.segment}`}>
            <Card className="p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
              <section.icon className={`w-8 h-8 mb-3 ${section.color}`} />
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
