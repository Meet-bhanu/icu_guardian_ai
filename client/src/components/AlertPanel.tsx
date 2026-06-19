import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Alert {
  id: number;
  alertType: string;
  severity: "warning" | "critical" | "emergency";
  vitalValue?: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  status: "active" | "acknowledged" | "resolved" | "false_alarm";
  notes?: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: number) => void;
  onResolve?: (alertId: number, notes?: string) => void;
  onDismiss?: (alertId: number) => void;
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  critical_heart_rate: "Critical Heart Rate",
  critical_spo2: "Critical Oxygen Level",
  critical_bp: "Critical Blood Pressure",
  critical_temperature: "Critical Temperature",
  fall_detection: "Fall Detected",
  bed_exit: "Bed Exit Detected",
  medication_missed: "Missed Medication",
};

const SEVERITY_COLORS = {
  warning: "border-yellow-300 bg-yellow-50",
  critical: "border-orange-300 bg-orange-50",
  emergency: "border-red-300 bg-red-50",
};

const SEVERITY_ICONS = {
  warning: "text-yellow-600",
  critical: "text-orange-600",
  emergency: "text-red-600",
};

const SEVERITY_BADGES = {
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800",
};

export default function AlertPanel({
  alerts,
  onAcknowledge,
  onResolve,
  onDismiss,
}: AlertPanelProps) {
  const [expandedAlertId, setExpandedAlertId] = useState<number | null>(null);
  const [resolveNotes, setResolveNotes] = useState<Record<number, string>>({});

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const acknowledgedAlerts = alerts.filter((a) => a.status === "acknowledged");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  const handleAcknowledge = (alertId: number) => {
    onAcknowledge?.(alertId);
  };

  const handleResolve = (alertId: number) => {
    onResolve?.(alertId, resolveNotes[alertId]);
    setResolveNotes((prev) => {
      const newNotes = { ...prev };
      delete newNotes[alertId];
      return newNotes;
    });
  };

  const handleDismiss = (alertId: number) => {
    onDismiss?.(alertId);
  };

  const renderAlertItem = (alert: Alert) => (
    <div
      key={alert.id}
      className={cn("p-4 border-l-4 rounded-lg", SEVERITY_COLORS[alert.severity])}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className={cn("w-5 h-5 mt-0.5 flex-shrink-0", SEVERITY_ICONS[alert.severity])} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">
                {ALERT_TYPE_LABELS[alert.alertType] || alert.alertType}
              </h4>
              <span className={cn("text-xs font-medium px-2 py-1 rounded", SEVERITY_BADGES[alert.severity])}>
                {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
              </span>
            </div>
            {alert.vitalValue && <p className="text-sm text-gray-600">Value: {alert.vitalValue}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {new Date(alert.triggeredAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {alert.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAcknowledge(alert.id)}
              className="gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Acknowledge
            </Button>
          )}

          {alert.status === "acknowledged" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResolve(alert.id)}
              className="gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </Button>
          )}

          {(alert.status === "active" || alert.status === "acknowledged") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDismiss(alert.id)}
              className="gap-1"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expandedAlertId === alert.id && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          {alert.notes && (
            <div>
              <p className="text-xs font-medium text-gray-600">Notes:</p>
              <p className="text-sm text-gray-700">{alert.notes}</p>
            </div>
          )}

          {alert.status === "acknowledged" && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">
                Resolution Notes:
              </label>
              <textarea
                value={resolveNotes[alert.id] || ""}
                onChange={(e) =>
                  setResolveNotes((prev) => ({
                    ...prev,
                    [alert.id]: e.target.value,
                  }))
                }
                placeholder="Enter resolution details..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
              />
            </div>
          )}
        </div>
      )}

      {/* Expand Button */}
      <button
        onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
        className="text-xs text-primary hover:underline mt-2"
      >
        {expandedAlertId === alert.id ? "Hide details" : "Show details"}
      </button>
    </div>
  );

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            Active Alerts ({activeAlerts.length})
          </h4>
          <div className="space-y-2">{activeAlerts.map(renderAlertItem)}</div>
        </div>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            Acknowledged ({acknowledgedAlerts.length})
          </h4>
          <div className="space-y-2">{acknowledgedAlerts.map(renderAlertItem)}</div>
        </div>
      )}

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Resolved ({resolvedAlerts.length})
          </h4>
          <div className="space-y-2 opacity-75">{resolvedAlerts.map(renderAlertItem)}</div>
        </div>
      )}

      {/* No Alerts */}
      {alerts.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-gray-600">No alerts at this time</p>
        </div>
      )}
    </Card>
  );
}
