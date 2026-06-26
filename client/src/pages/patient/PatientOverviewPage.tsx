import PatientLayout from "@/components/PatientLayout";
import PatientOverviewContent from "@/components/patient-sections/PatientOverviewContent";
import { usePatientAuth } from "@/hooks/usePatientAuth";

export default function PatientPortalOverviewPage() {
  const { session } = usePatientAuth();
  const patientId = session?.patientId ?? "P001";

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="hh-page-title">Records & Overview</h1>
          <p className="hh-page-subtitle">Access your clinical reports, trends, medication schedule, and contacts</p>
        </div>
        <PatientOverviewContent patientId={patientId} />
      </div>
    </PatientLayout>
  );
}
