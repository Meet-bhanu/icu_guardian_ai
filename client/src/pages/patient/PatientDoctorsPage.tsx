import PatientLayout from "@/components/PatientLayout";
import DoctorsContent from "@/components/patient-sections/DoctorsContent";
import { usePatientAuth } from "@/hooks/usePatientAuth";

export default function PatientDoctorsPage() {
  const { session } = usePatientAuth();
  const patientId = session?.patientId ?? "P001";

  return (
    <PatientLayout>
      <DoctorsContent patientId={patientId} />
    </PatientLayout>
  );
}
