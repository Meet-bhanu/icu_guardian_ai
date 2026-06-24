import PatientLayout from "@/components/PatientLayout";
import ReportsContent from "@/components/patient-sections/ReportsContent";
import { usePatientAuth } from "@/hooks/usePatientAuth";

export default function PatientReportsPage() {
  const { user, session } = usePatientAuth();
  const patientId = session?.patientId ?? "P001";
  const patientName = user?.name ?? "Patient";

  return (
    <PatientLayout>
      <ReportsContent
        patientId={patientId}
        patientName={patientName}
        uploadPath={`/patient/reports/upload`}
      />
    </PatientLayout>
  );
}
