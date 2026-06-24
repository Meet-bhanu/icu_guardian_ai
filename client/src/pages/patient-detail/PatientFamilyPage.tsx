import PatientDetailLayout, { usePatientDetailRoute } from "@/components/PatientDetailLayout";
import FamilyContactsContent from "@/components/patient-sections/FamilyContactsContent";

export default function PatientFamilyPage() {
  const { patientId } = usePatientDetailRoute();

  return (
    <PatientDetailLayout activeSegment="family">
      <FamilyContactsContent patientId={patientId} />
    </PatientDetailLayout>
  );
}
