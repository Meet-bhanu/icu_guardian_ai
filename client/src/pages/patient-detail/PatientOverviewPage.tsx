import PatientDetailLayout, { usePatientDetailRoute } from "@/components/PatientDetailLayout";
import PatientOverviewContent from "@/components/patient-sections/PatientOverviewContent";

export default function PatientOverviewPage() {
  const { patientId } = usePatientDetailRoute();

  return (
    <PatientDetailLayout activeSegment="">
      <PatientOverviewContent patientId={patientId} />
    </PatientDetailLayout>
  );
}
