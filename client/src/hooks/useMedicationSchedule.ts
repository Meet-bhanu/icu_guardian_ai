import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getMedicationsForPatient,
  type MedicationAdminStatus,
  type PatientMedication,
} from "@/lib/patientData";
import {
  isMedicationOverdue,
  medicationStorageKey,
  playMedicationAlert,
  stopMedicationAlertVoice,
} from "@/lib/medicationAlerts";
import { toast } from "sonner";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadStatus(patientId: string, medId: number): MedicationAdminStatus {
  const stored = sessionStorage.getItem(medicationStorageKey(patientId, medId, todayKey()));
  if (stored === "given" || stored === "missed" || stored === "not_given") {
    return stored;
  }
  return "not_given";
}

function saveStatus(patientId: string, medId: number, status: MedicationAdminStatus) {
  sessionStorage.setItem(medicationStorageKey(patientId, medId, todayKey()), status);
}

export function useMedicationSchedule(patientId: string, patientName: string) {
  const medications = useMemo(() => getMedicationsForPatient(patientId), [patientId]);
  const [statuses, setStatuses] = useState<Record<number, MedicationAdminStatus>>(() => {
    const initial: Record<number, MedicationAdminStatus> = {};
    for (const med of getMedicationsForPatient(patientId)) {
      initial[med.id] = loadStatus(patientId, med.id);
    }
    return initial;
  });
  const alertedRef = useRef<Set<string>>(new Set());

  const setMedicationStatus = useCallback(
    (medicationId: number, status: MedicationAdminStatus) => {
      setStatuses((prev) => ({ ...prev, [medicationId]: status }));
      saveStatus(patientId, medicationId, status);
      if (status === "given") {
        stopMedicationAlertVoice();
      }
      if (status !== "missed") {
        alertedRef.current.delete(`${patientId}:${medicationId}:${todayKey()}`);
      }
    },
    [patientId],
  );

  const checkMissedMedications = useCallback(() => {
    for (const med of medications) {
      const current = statuses[med.id] ?? loadStatus(patientId, med.id);
      if (current !== "not_given") continue;
      if (!isMedicationOverdue(med.time)) continue;

      const alertKey = `${patientId}:${med.id}:${todayKey()}`;
      if (alertedRef.current.has(alertKey)) continue;

      alertedRef.current.add(alertKey);
      setMedicationStatus(med.id, "missed");
      playMedicationAlert(patientName, med.name);
      toast.error(`Medication missed: ${med.name}`, {
        description: `${patientName} (${patientId}) — scheduled at ${med.time}`,
        duration: 8000,
      });
    }
  }, [medications, patientId, patientName, setMedicationStatus, statuses]);

  useEffect(() => {
    checkMissedMedications();
    const interval = setInterval(checkMissedMedications, 15000);
    return () => clearInterval(interval);
  }, [checkMissedMedications]);

  const compliance = useMemo(() => {
    if (medications.length === 0) return 100;
    const given = medications.filter((m) => (statuses[m.id] ?? "not_given") === "given").length;
    return Math.round((given / medications.length) * 100);
  }, [medications, statuses]);

  const nextDue = useMemo(() => {
    return (
      medications.find((m) => (statuses[m.id] ?? "not_given") === "not_given") ?? null
    );
  }, [medications, statuses]);

  return {
    medications,
    statuses,
    setMedicationStatus,
    compliance,
    nextDue,
  };
}

export type { PatientMedication };
