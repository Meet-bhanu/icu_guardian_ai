import PatientDetailLayout, { usePatientDetailRoute } from "@/components/PatientDetailLayout";
import MedicationsContent from "@/components/patient-sections/MedicationsContent";

export default function PatientMedicationsDetailPage() {
  const { patientId, patient } = usePatientDetailRoute();

  return (
    <PatientDetailLayout activeSegment="medications">
      <MedicationsContent
        patientId={patientId}
        patientName={patient?.name ?? patientId}
      />
    </PatientDetailLayout>
  );
}
