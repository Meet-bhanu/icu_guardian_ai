import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import MedicationsContent from "@/components/patient-sections/MedicationsContent";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { getPatientById } from "@/lib/patientData";

export default function MedicationsPage() {
  const { isPatient } = usePatientAuth();
  const [, setLocation] = useLocation();
  const [patientId, setPatientId] = useState("P001");
  const patient = getPatientById(patientId);

  useEffect(() => {
    if (isPatient) {
      setLocation("/patient/medications");
    }
  }, [isPatient, setLocation]);

  if (isPatient) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-500 text-sm mt-1">
            ICU medication administration — mark doses as given, not given, or missed
          </p>
        </div>

        <MedicationsContent
          patientId={patientId}
          patientName={patient?.name ?? patientId}
          showPatientSelector
          showAdminSummary
          onPatientChange={setPatientId}
          patientDetailPath={`/dashboard/patients/${patientId}/medications`}
        />
      </div>
    </AppLayout>
  );
}
