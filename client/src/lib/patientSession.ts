export interface PatientSession {
  patientId: string;
  name: string;
  email: string;
  role: "patient";
  bedNo: string;
}

const SESSION_KEY = "icu-patient-session";

export function setPatientSession(session: PatientSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getPatientSession(): PatientSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PatientSession;
  } catch {
    return null;
  }
}

export function clearPatientSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
