import PatientLayout from "@/components/PatientLayout";
import HealthTrendsContent from "@/components/patient-sections/HealthTrendsContent";
import { usePatientAuth } from "@/hooks/usePatientAuth";

export default function PatientTrendsPage() {
  const { user, session } = usePatientAuth();
  const patientId = session?.patientId ?? "P001";
  const patientName = user?.name ?? "Patient";

  return (
    <PatientLayout>
      <HealthTrendsContent patientId={patientId} patientName={patientName} />
    </PatientLayout>
  );
}
