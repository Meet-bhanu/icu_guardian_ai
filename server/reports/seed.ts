import { generatePatientProgressPdf } from "./generatePdf";
import { createReport, listReports } from "./store";
import type { PatientProgressData, ReportType } from "@shared/reports";

const DEMO_PATIENTS: Record<
  string,
  Omit<PatientProgressData, "reportDate" | "summary" | "observations" | "recommendations" | "progressNotes">
> = {
  P001: {
    patientId: "P001",
    patientName: "John Smith",
    age: 67,
    gender: "Male",
    bedNo: "ICU-01",
    doctor: "Dr. Sarah Chen",
    status: "Critical",
    vitals: { heartRate: 98, spO2: 94, bloodPressure: "128/82", respiratoryRate: 18, temperature: 98.4 },
    medications: [
      { name: "Metoprolol", dosage: "50mg", frequency: "Twice daily", status: "Active" },
      { name: "Heparin", dosage: "5000 IU", frequency: "Every 8 hrs", status: "Active" },
    ],
  },
  P002: {
    patientId: "P002",
    patientName: "Maria Garcia",
    age: 54,
    gender: "Female",
    bedNo: "ICU-02",
    doctor: "Dr. James Wilson",
    status: "Stable",
    vitals: { heartRate: 76, spO2: 97, bloodPressure: "118/74", respiratoryRate: 16, temperature: 98.1 },
    medications: [
      { name: "Furosemide", dosage: "40mg", frequency: "Once daily", status: "Active" },
    ],
  },
  P003: {
    patientId: "P003",
    patientName: "Robert Johnson",
    age: 72,
    gender: "Male",
    bedNo: "ICU-03",
    doctor: "Dr. Sarah Chen",
    status: "Warning",
    vitals: { heartRate: 88, spO2: 95, bloodPressure: "135/88", respiratoryRate: 20, temperature: 99.0 },
    medications: [
      { name: "Morphine", dosage: "2mg", frequency: "As needed", status: "Active" },
    ],
  },
};

const REPORT_CONTENT: Record<
  string,
  { summary: string; observations: string; recommendations: string; progressNotes: string[] }
> = {
  default: {
    summary:
      "Patient shows gradual improvement in vital signs over the monitoring period. Heart rate has stabilized within an acceptable range. Oxygen saturation remains at acceptable levels with supplemental oxygen support.",
    observations:
      "Heart rate trending downward from elevated levels. Blood pressure within target range. Respiratory rate normalizing. Patient responsive and alert. No new signs of infection.",
    recommendations:
      "Continue current medication regimen. Monitor SpO2 levels closely. Schedule follow-up imaging in 48 hours. Consider reducing oxygen support if SpO2 remains above 95% for 12 hours.",
    progressNotes: [
      "Admitted with acute respiratory distress; placed on supplemental oxygen.",
      "Vitals stabilizing; heart rate decreased from 118 to 98 bpm.",
      "Patient alert and cooperative; tolerated oral medications.",
      "Mobility exercises initiated with nursing support.",
      "Family updated on recovery trajectory; discharge planning discussed.",
    ],
  },
};

export function getPatientProgressData(patientId: string, reportDate?: string): PatientProgressData | null {
  const base = DEMO_PATIENTS[patientId];
  if (!base) return null;

  const content = REPORT_CONTENT.default;
  return {
    ...base,
    reportDate: reportDate ?? new Date().toISOString().slice(0, 10),
    ...content,
  };
}

export function getDemoPatientIds(): string[] {
  return Object.keys(DEMO_PATIENTS);
}

export function getDemoPatientName(patientId: string): string | null {
  return DEMO_PATIENTS[patientId]?.patientName ?? null;
}

export async function seedDemoReports(): Promise<void> {
  const existing = await listReports();
  if (existing.length > 0) return;

  const seeds: Array<{
    patientId: string;
    title: string;
    type: ReportType;
    date: string;
    daysAgo: number;
  }> = [
    { patientId: "P001", title: "Daily ICU Report", type: "current", date: "2026-06-19", daysAgo: 0 },
    { patientId: "P001", title: "Daily ICU Report", type: "past", date: "2026-06-18", daysAgo: 1 },
    { patientId: "P001", title: "Daily ICU Report", type: "past", date: "2026-06-17", daysAgo: 2 },
    { patientId: "P001", title: "Blood Panel Results", type: "lab", date: "2026-06-15", daysAgo: 4 },
    { patientId: "P001", title: "Chest X-Ray Report", type: "scan", date: "2026-06-14", daysAgo: 5 },
    { patientId: "P002", title: "Daily ICU Report", type: "current", date: "2026-06-19", daysAgo: 0 },
    { patientId: "P002", title: "CT Scan Report", type: "scan", date: "2026-06-12", daysAgo: 7 },
  ];

  for (const seed of seeds) {
    const patient = DEMO_PATIENTS[seed.patientId];
    if (!patient) continue;

    const progressData = getPatientProgressData(seed.patientId, seed.date);
    if (!progressData) continue;

    const adjustedNotes = progressData.progressNotes.slice(0, Math.max(1, 5 - seed.daysAgo));
    const pdfBuffer = await generatePatientProgressPdf({
      ...progressData,
      progressNotes: adjustedNotes,
    });

    const safeName = seed.title.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
    await createReport(
      {
        patientId: seed.patientId,
        patientName: patient.patientName,
        title: seed.title,
        type: seed.type,
        date: seed.date,
        fileName: `${safeName}-${seed.patientId}-${seed.date}.pdf`,
        summary: progressData.summary,
        observations: progressData.observations,
        recommendations: progressData.recommendations,
        source: "generated",
      },
      pdfBuffer,
    );
  }

  console.log("[Reports] Seeded demo PDF reports");
}
