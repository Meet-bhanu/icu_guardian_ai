export type ReportType = "current" | "past" | "lab" | "scan";

export interface PatientReport {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  type: ReportType;
  date: string;
  fileName: string;
  summary?: string;
  observations?: string;
  recommendations?: string;
  uploadedAt: string;
  source: "generated" | "uploaded";
}

export interface ReportPatient {
  id: string;
  name: string | null;
}

export interface PatientProgressData {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  bedNo: string;
  doctor: string;
  status: string;
  reportDate: string;
  summary: string;
  observations: string;
  recommendations: string;
  vitals: {
    heartRate: number;
    spO2: number;
    bloodPressure: string;
    respiratoryRate: number;
    temperature: number;
  };
  medications: Array<{ name: string; dosage: string; frequency: string; status: string }>;
  progressNotes: string[];
}
