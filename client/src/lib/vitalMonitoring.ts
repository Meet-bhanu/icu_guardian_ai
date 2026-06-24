export interface PatientVitals {
  heartRate?: number;
  spO2?: number;
  systolicBP?: number;
  diastolicBP?: number;
  temperature?: number;
  respiratoryRate?: number;
}

export const VITAL_RANGES = {
  heartRate: { min: 60, max: 100, critical: { min: 40, max: 130 } },
  spO2: { min: 95, max: 100, critical: { min: 88, max: 100 } },
  systolicBP: { min: 90, max: 140, critical: { min: 70, max: 180 } },
  diastolicBP: { min: 60, max: 90, critical: { min: 40, max: 120 } },
  temperature: { min: 36.5, max: 37.5, critical: { min: 35, max: 40 } },
  respiratoryRate: { min: 12, max: 20, critical: { min: 8, max: 30 } },
} as const;

type VitalStatus = "normal" | "warning" | "critical";

function getStatus(value: number | undefined, range: { min: number; max: number; critical: { min: number; max: number } }): VitalStatus {
  if (value === undefined) return "normal";
  if (value < range.critical.min || value > range.critical.max) return "critical";
  if (value < range.min || value > range.max) return "warning";
  return "normal";
}

export function evaluatePatientVitals(vitals: PatientVitals): {
  isCritical: boolean;
  isWarning: boolean;
  reasons: string[];
  statuses: Record<string, VitalStatus>;
} {
  const statuses = {
    heartRate: getStatus(vitals.heartRate, VITAL_RANGES.heartRate),
    spO2: getStatus(vitals.spO2, VITAL_RANGES.spO2),
    systolicBP: getStatus(vitals.systolicBP, VITAL_RANGES.systolicBP),
    temperature: getStatus(vitals.temperature, VITAL_RANGES.temperature),
    respiratoryRate: getStatus(vitals.respiratoryRate, VITAL_RANGES.respiratoryRate),
  };

  const reasons: string[] = [];

  if (statuses.heartRate === "critical") {
    reasons.push(`Critical heart rate: ${vitals.heartRate} bpm`);
  }
  if (statuses.spO2 === "critical") {
    reasons.push(`Critical oxygen saturation: ${vitals.spO2}%`);
  }
  if (statuses.systolicBP === "critical") {
    reasons.push(`Critical blood pressure: ${vitals.systolicBP}/${vitals.diastolicBP ?? "—"} mmHg`);
  }
  if (statuses.temperature === "critical") {
    reasons.push(`Critical temperature: ${vitals.temperature}°C`);
  }
  if (statuses.respiratoryRate === "critical") {
    reasons.push(`Critical respiratory rate: ${vitals.respiratoryRate}/min`);
  }

  const isCritical = reasons.length > 0;
  const isWarning = Object.values(statuses).some((s) => s === "warning");

  return { isCritical, isWarning, reasons, statuses };
}

export function detectWorseningCondition(previous: PatientVitals, current: PatientVitals): string[] {
  const worsening: string[] = [];

  if (
    previous.spO2 !== undefined &&
    current.spO2 !== undefined &&
    current.spO2 < previous.spO2 - 2 &&
    current.spO2 < 92
  ) {
    worsening.push(`SpO₂ worsening: ${previous.spO2}% → ${current.spO2}%`);
  }

  if (
    previous.heartRate !== undefined &&
    current.heartRate !== undefined &&
    current.heartRate > previous.heartRate + 10 &&
    current.heartRate > 105
  ) {
    worsening.push(`Heart rate worsening: ${previous.heartRate} → ${current.heartRate} bpm`);
  }

  if (
    previous.respiratoryRate !== undefined &&
    current.respiratoryRate !== undefined &&
    current.respiratoryRate > previous.respiratoryRate + 4 &&
    current.respiratoryRate > 22
  ) {
    worsening.push(`Respiratory rate worsening: ${previous.respiratoryRate} → ${current.respiratoryRate}/min`);
  }

  if (
    previous.systolicBP !== undefined &&
    current.systolicBP !== undefined &&
    current.systolicBP > previous.systolicBP + 15 &&
    current.systolicBP > 150
  ) {
    worsening.push(`Blood pressure worsening: ${previous.systolicBP} → ${current.systolicBP} mmHg systolic`);
  }

  const prevEval = evaluatePatientVitals(previous);
  const currEval = evaluatePatientVitals(current);

  if (!prevEval.isCritical && currEval.isCritical) {
    worsening.push("Patient condition has entered critical range");
  } else if (prevEval.isWarning && currEval.isCritical) {
    worsening.push("Patient condition deteriorated from warning to critical");
  }

  return worsening;
}
