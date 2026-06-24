import PatientDetailLayout, { usePatientDetailRoute } from "@/components/PatientDetailLayout";
import HealthTrendsContent from "@/components/patient-sections/HealthTrendsContent";

export default function PatientTrendsPage() {
  const { patientId, patient } = usePatientDetailRoute();

  return (
    <PatientDetailLayout activeSegment="trends">
      <HealthTrendsContent patientId={patientId} patientName={patient?.name ?? patientId} />
    </PatientDetailLayout>
  );
}
