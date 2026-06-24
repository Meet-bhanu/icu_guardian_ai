import { AlertTriangle, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CriticalAlertState } from "@/contexts/CriticalAlertContext";
import { CRITICAL_ALARM_MIN_DURATION_MS } from "@/lib/criticalAlerts";

interface CriticalAlertOverlayProps {
  alert: CriticalAlertState;
  elapsedMs: number;
  canAcknowledge: boolean;
  onAcknowledge: () => void;
}

function formatCountdown(elapsedMs: number): string {
  const remaining = Math.max(0, CRITICAL_ALARM_MIN_DURATION_MS - elapsedMs);
  const seconds = Math.ceil(remaining / 1000);
  return `${seconds}s`;
}

export default function CriticalAlertOverlay({
  alert,
  elapsedMs,
  canAcknowledge,
  onAcknowledge,
}: CriticalAlertOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-red-950/85 animate-pulse" />
      <div className="relative w-full max-w-2xl rounded-2xl border-4 border-red-500 bg-red-600 text-white shadow-2xl shadow-red-900/60 p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center animate-bounce">
            <Siren className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold tracking-[0.35em] uppercase text-red-100">Code Blue</p>
          <h2 className="text-3xl sm:text-4xl font-black uppercase">Patient Critical</h2>
          <p className="text-xl font-semibold">
            {alert.patientName} ({alert.patientId})
          </p>
        </div>

        <div className="rounded-xl bg-red-700/80 border border-red-400 p-4 text-left space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Medical condition worsening — immediate response required
          </div>
          <ul className="text-sm text-red-50 space-y-1 list-disc pl-5">
            {alert.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>

        <p className="text-lg font-bold animate-pulse">
          Hospital-wide critical alarm sounding — doctors respond now
        </p>

        <div className="text-sm text-red-100">
          {canAcknowledge ? (
            <span>Alarm minimum duration reached. Acknowledge when medical team is responding.</span>
          ) : (
            <span>Alarm will continue for at least {formatCountdown(elapsedMs)} more</span>
          )}
        </div>

        <Button
          size="lg"
          variant="secondary"
          className="w-full sm:w-auto min-w-[240px] font-bold text-red-700"
          disabled={!canAcknowledge}
          onClick={onAcknowledge}
        >
          {canAcknowledge ? "Acknowledge & Silence Alarm" : `Alarm active (${formatCountdown(elapsedMs)})`}
        </Button>
      </div>
    </div>
  );
}
