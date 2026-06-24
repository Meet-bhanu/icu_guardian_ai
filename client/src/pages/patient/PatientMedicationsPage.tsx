import PatientLayout from "@/components/PatientLayout";
import MedicationsContent from "@/components/patient-sections/MedicationsContent";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { Card } from "@/components/ui/card";

export default function PatientMedicationsPage() {
  const { user, session } = usePatientAuth();
  const patientId = session?.patientId ?? "P001";
  const patientName = user?.name ?? "Patient";

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-500 text-sm mt-1">Your medication schedule and compliance</p>
        </div>

        <MedicationsContent
          patientId={patientId}
          patientName={patientName}
        />

        <Card className="p-4 bg-gray-50 border-gray-200">
          <p className="text-sm text-gray-600">
            Use the dropdown on each medication to mark doses as <strong>Not Given</strong>,{" "}
            <strong>Given</strong>, or <strong>Missed</strong>. If a dose is not marked given by its
            scheduled time, you will hear an alert for that medicine. Contact your nurse if you
            have questions — you cannot change prescriptions from this portal.
          </p>
        </Card>
      </div>
    </PatientLayout>
  );
}
