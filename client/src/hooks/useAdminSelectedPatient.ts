import { useCallback, useEffect, useState } from "react";
import { getPatientById, getPatientsList } from "@/lib/patientData";

const STORAGE_KEY = "icu-admin-selected-patient";

export function getAdminSelectedPatientId(): string {
  if (typeof window === "undefined") return "P001";
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored && getPatientById(stored)) return stored;
  const list = getPatientsList();
  return list[0]?.id ?? "P001";
}

export function setAdminSelectedPatientId(patientId: string) {
  sessionStorage.setItem(STORAGE_KEY, patientId);
  window.dispatchEvent(new CustomEvent("icu-admin-patient-change", { detail: patientId }));
}

export function useAdminSelectedPatient() {
  const [patientId, setPatientIdState] = useState(getAdminSelectedPatientId);

  useEffect(() => {
    const onChange = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id) setPatientIdState(id);
    };
    window.addEventListener("icu-admin-patient-change", onChange);
    return () => window.removeEventListener("icu-admin-patient-change", onChange);
  }, []);

  const setPatientId = useCallback((id: string) => {
    setAdminSelectedPatientId(id);
    setPatientIdState(id);
  }, []);

  const patient = getPatientById(patientId);

  return {
    patientId,
    setPatientId,
    patientName: patient?.name ?? patientId,
    bedNo: patient?.bedNo ?? "ICU-01",
  };
}
