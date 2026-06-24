import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import CriticalAlertOverlay from "@/components/CriticalAlertOverlay";
import {
  CRITICAL_ALARM_MIN_DURATION_MS,
  playCriticalPatientAlarm,
  stopCriticalPatientAlarm,
} from "@/lib/criticalAlerts";
import { toast } from "sonner";

export interface CriticalAlertState {
  patientId: string;
  patientName: string;
  reasons: string[];
  triggeredAt: number;
}

interface CriticalAlertContextValue {
  activeAlert: CriticalAlertState | null;
  triggerCriticalAlert: (alert: Omit<CriticalAlertState, "triggeredAt">) => void;
  acknowledgeAlert: () => void;
  elapsedMs: number;
  canAcknowledge: boolean;
}

const CriticalAlertContext = createContext<CriticalAlertContextValue | null>(null);

export function CriticalAlertProvider({ children }: { children: ReactNode }) {
  const [activeAlert, setActiveAlert] = useState<CriticalAlertState | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [canAcknowledge, setCanAcknowledge] = useState(false);
  const lastTriggerKeyRef = useRef<string>("");

  useEffect(() => {
    if (!activeAlert) {
      setElapsedMs(0);
      setCanAcknowledge(false);
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - activeAlert.triggeredAt;
      setElapsedMs(elapsed);
      setCanAcknowledge(elapsed >= CRITICAL_ALARM_MIN_DURATION_MS);
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [activeAlert]);

  const triggerCriticalAlert = useCallback((alert: Omit<CriticalAlertState, "triggeredAt">) => {
    const triggerKey = `${alert.patientId}:${alert.reasons.join("|")}`;
    if (lastTriggerKeyRef.current === triggerKey && activeAlert) {
      return;
    }
    lastTriggerKeyRef.current = triggerKey;

    const fullAlert: CriticalAlertState = {
      ...alert,
      triggeredAt: Date.now(),
    };

    setActiveAlert(fullAlert);
    playCriticalPatientAlarm(alert.patientName, alert.patientId, alert.reasons);

    toast.error("CODE BLUE — Patient Critical", {
      description: `${alert.patientName} (${alert.patientId}): ${alert.reasons[0]}`,
      duration: CRITICAL_ALARM_MIN_DURATION_MS,
    });
  }, [activeAlert]);

  const acknowledgeAlert = useCallback(() => {
    if (!activeAlert) return;
    if (Date.now() - activeAlert.triggeredAt < CRITICAL_ALARM_MIN_DURATION_MS) return;
    stopCriticalPatientAlarm();
    setActiveAlert(null);
    lastTriggerKeyRef.current = "";
    toast.success("Critical alarm acknowledged", {
      description: "Medical team notified. Continue monitoring the patient.",
    });
  }, [activeAlert]);

  const value = useMemo(
    () => ({
      activeAlert,
      triggerCriticalAlert,
      acknowledgeAlert,
      elapsedMs,
      canAcknowledge,
    }),
    [activeAlert, triggerCriticalAlert, acknowledgeAlert, elapsedMs, canAcknowledge],
  );

  return (
    <CriticalAlertContext.Provider value={value}>
      {children}
      {activeAlert && (
        <CriticalAlertOverlay
          alert={activeAlert}
          elapsedMs={elapsedMs}
          canAcknowledge={canAcknowledge}
          onAcknowledge={acknowledgeAlert}
        />
      )}
    </CriticalAlertContext.Provider>
  );
}

export function useCriticalAlert() {
  const ctx = useContext(CriticalAlertContext);
  if (!ctx) {
    throw new Error("useCriticalAlert must be used within CriticalAlertProvider");
  }
  return ctx;
}
