import PatientDetailLayout, { usePatientDetailRoute } from "@/components/PatientDetailLayout";
import ReportsContent from "@/components/patient-sections/ReportsContent";

export default function PatientReportsPage() {
  const { patientId, patient } = usePatientDetailRoute();

  return (
    <PatientDetailLayout activeSegment="reports">
      <ReportsContent
        patientId={patientId}
        patientName={patient?.name}
        uploadPath={`/dashboard/patients/${patientId}/reports/upload`}
      />
    </PatientDetailLayout>
  );
}
