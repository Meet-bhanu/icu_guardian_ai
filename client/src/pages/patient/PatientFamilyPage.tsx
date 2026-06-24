import PatientLayout from "@/components/PatientLayout";
import FamilyContactsContent from "@/components/patient-sections/FamilyContactsContent";
import { usePatientAuth } from "@/hooks/usePatientAuth";

export default function PatientFamilyPage() {
  const { session } = usePatientAuth();
  const patientId = session?.patientId ?? "P001";

  return (
    <PatientLayout>
      <FamilyContactsContent patientId={patientId} />
    </PatientLayout>
  );
}
