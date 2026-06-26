import AppLayout from "@/components/AppLayout";
import MedicationsContent from "@/components/patient-sections/MedicationsContent";
import { useAdminSelectedPatient } from "@/hooks/useAdminSelectedPatient";

export default function MedicationsPage() {
  const { patientId, setPatientId, patientName } = useAdminSelectedPatient();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-500 text-sm mt-1">
            ICU medication administration — select a patient to view and manage doses
          </p>
        </div>

        <MedicationsContent
          patientId={patientId}
          patientName={patientName}
          showPatientSelector
          showAdminSummary
          onPatientChange={setPatientId}
          patientDetailPath={`/dashboard/patients/${patientId}/medications`}
        />
      </div>
    </AppLayout>
  );
}
