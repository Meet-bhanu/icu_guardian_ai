import { useEffect, useRef, useState } from "react";
import { useCriticalAlert } from "@/contexts/CriticalAlertContext";
import {
  detectWorseningCondition,
  evaluatePatientVitals,
  type PatientVitals,
} from "@/lib/vitalMonitoring";

interface UseCriticalVitalMonitorOptions {
  patientId: string;
  patientName: string;
  vitals: PatientVitals;
  enabled?: boolean;
}

export function useCriticalVitalMonitor({
  patientId,
  patientName,
  vitals,
  enabled = true,
}: UseCriticalVitalMonitorOptions) {
  const { triggerCriticalAlert, activeAlert } = useCriticalAlert();
  const previousVitalsRef = useRef<PatientVitals | null>(null);
  const lastAlertAtRef = useRef<number>(0);
  const [codeBlueEnabled, setCodeBlueEnabled] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("icu-enable-code-blue") === "true"
  );

  useEffect(() => {
    const checkState = () => {
      setCodeBlueEnabled(typeof window !== "undefined" && localStorage.getItem("icu-enable-code-blue") === "true");
    };
    window.addEventListener("storage", checkState);
    window.addEventListener("icu-code-blue-toggle", checkState);
    return () => {
      window.removeEventListener("storage", checkState);
      window.removeEventListener("icu-code-blue-toggle", checkState);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !codeBlueEnabled) return;

    const evaluation = evaluatePatientVitals(vitals);
    const worsening = previousVitalsRef.current
      ? detectWorseningCondition(previousVitalsRef.current, vitals)
      : [];

    previousVitalsRef.current = { ...vitals };

    const shouldTrigger =
      evaluation.isCritical || worsening.some((r) => r.includes("critical") || r.includes("worsening"));

    if (!shouldTrigger) return;

    const now = Date.now();
    if (activeAlert?.patientId === patientId) return;
    if (now - lastAlertAtRef.current < 60_000) return;

    const reasons = [...evaluation.reasons, ...worsening].filter(
      (reason, index, all) => all.indexOf(reason) === index,
    );

    if (reasons.length === 0 && evaluation.isCritical) {
      reasons.push("Patient vitals in critical range");
    }

    if (reasons.length === 0) return;

    lastAlertAtRef.current = now;
    triggerCriticalAlert({
      patientId,
      patientName,
      reasons,
    });
  }, [enabled, patientId, patientName, vitals, triggerCriticalAlert, activeAlert]);
}
