import { doctors, familyContacts, patients as initialPatients } from "./mockData";

export type MedicationAdminStatus = "not_given" | "given" | "missed";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bedNo: string;
  doctor: string;
  status: "Critical" | "Stable" | "Warning";
}

export interface PatientMedication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
}

export function getPatientsList(): Patient[] {
  if (typeof window === "undefined") return initialPatients as Patient[];
  const stored = localStorage.getItem("icu-patients-list");
  if (!stored) {
    localStorage.setItem("icu-patients-list", JSON.stringify(initialPatients));
    return initialPatients as Patient[];
  }
  try {
    return JSON.parse(stored) as Patient[];
  } catch {
    return initialPatients as Patient[];
  }
}

export function savePatientsList(list: Patient[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("icu-patients-list", JSON.stringify(list));
  }
}

const baseMedications: PatientMedication[] = [
  { id: 1, name: "Metoprolol", dosage: "50mg", frequency: "Twice daily", time: "08:00 AM" },
  { id: 2, name: "Furosemide", dosage: "40mg", frequency: "Once daily", time: "10:00 AM" },
  { id: 3, name: "Heparin", dosage: "5000 IU", frequency: "Every 8 hrs", time: "02:00 PM" },
  { id: 4, name: "Morphine", dosage: "2mg", frequency: "As needed", time: "04:00 PM" },
  { id: 5, name: "Insulin", dosage: "10 units", frequency: "Before meals", time: "06:00 PM" },
];

const patientFamilyMap: Record<string, typeof familyContacts> = {
  P001: [familyContacts[0], familyContacts[1]],
  P002: [familyContacts[2]],
  P003: [familyContacts[3]],
  P004: [familyContacts[4]],
  P005: [familyContacts[5]],
  P006: [
    { id: 7, name: "James Williams", relationship: "Husband", phone: "+1 (555) 789-0123" },
  ],
};

export function getPatientById(patientId: string) {
  return getPatientsList().find((p) => p.id === patientId) ?? null;
}

export function getMedicationsForPatient(patientId: string): PatientMedication[] {
  return baseMedications.map((med, index) => ({
    ...med,
    id: Number(`${patientId.replace(/\D/g, "")}${index + 1}`) || med.id,
  }));
}

export function getDoctorForPatient(patientId: string) {
  const patient = getPatientById(patientId);
  if (!patient) return null;
  return doctors.find((d) => d.name === patient.doctor) ?? doctors[0];
}

export function getDoctorsForPatient(patientId: string) {
  const primary = getDoctorForPatient(patientId);
  const others = doctors.filter((d) => d.name !== primary?.name).slice(0, 2);
  return primary ? [primary, ...others] : doctors.slice(0, 3);
}

export function getFamilyContactsForPatient(patientId: string) {
  return patientFamilyMap[patientId] ?? familyContacts.slice(0, 2);
}

export function getHealthMetricsForPatient(patientId: string) {
  const patient = getPatientById(patientId);
  const recovery =
    patient?.status === "Stable" ? 82 : patient?.status === "Warning" ? 68 : 55;
  return [
    { label: "Overall Recovery", value: recovery, color: "#22c55e" },
    { label: "Vital Stability", value: recovery + 8, color: "#3b82f6" },
    { label: "Medication Compliance", value: 91, color: "#22c55e" },
  ];
}
