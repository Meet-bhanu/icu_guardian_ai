import PatientDetailLayout, { usePatientDetailRoute } from "@/components/PatientDetailLayout";
import DoctorsContent from "@/components/patient-sections/DoctorsContent";

export default function PatientDoctorsPage() {
  const { patientId } = usePatientDetailRoute();

  return (
    <PatientDetailLayout activeSegment="doctors">
      <DoctorsContent patientId={patientId} />
    </PatientDetailLayout>
  );
}
