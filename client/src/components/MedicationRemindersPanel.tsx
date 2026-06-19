import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicationReminder {
  id: number;
  medicationName: string;
  dosage?: string;
  scheduledTime: string;
  reminderDate: Date;
  status: "pending" | "sent" | "acknowledged" | "missed" | "completed";
  sentAt?: Date;
  acknowledgedAt?: Date;
}

interface MedicationRemindersPanelProps {
  reminders: MedicationReminder[];
  onAcknowledge?: (reminderId: number) => void;
  onMarkMissed?: (reminderId: number) => void;
}

const STATUS_COLORS = {
  pending: "bg-gray-50 border-gray-300",
  sent: "bg-blue-50 border-blue-300",
  acknowledged: "bg-green-50 border-green-300",
  missed: "bg-red-50 border-red-300",
  completed: "bg-green-50 border-green-300",
};

const STATUS_ICONS = {
  pending: <Clock className="w-5 h-5 text-gray-600" />,
  sent: <Pill className="w-5 h-5 text-blue-600" />,
  acknowledged: <CheckCircle className="w-5 h-5 text-green-600" />,
  missed: <AlertCircle className="w-5 h-5 text-red-600" />,
  completed: <CheckCircle className="w-5 h-5 text-green-600" />,
};

const STATUS_LABELS = {
  pending: "Pending",
  sent: "Reminder Sent",
  acknowledged: "Acknowledged",
  missed: "Missed",
  completed: "Completed",
};

export default function MedicationRemindersPanel({
  reminders,
  onAcknowledge,
  onMarkMissed,
}: MedicationRemindersPanelProps) {
  // Group reminders by status
  const pendingReminders = reminders.filter((r) => r.status === "pending");
  const sentReminders = reminders.filter((r) => r.status === "sent");
  const acknowledgedReminders = reminders.filter((r) => r.status === "acknowledged" || r.status === "completed");
  const missedReminders = reminders.filter((r) => r.status === "missed");

  const renderReminderItem = (reminder: MedicationReminder) => {
    const reminderDate = new Date(reminder.reminderDate);
    const isOverdue = reminderDate < new Date() && reminder.status === "pending";

    return (
      <div
        key={reminder.id}
        className={cn(
          "p-4 border-l-4 rounded-lg flex items-start justify-between gap-4",
          STATUS_COLORS[reminder.status],
          isOverdue && "border-red-500 bg-red-50"
        )}
      >
        <div className="flex items-start gap-3 flex-1">
          {STATUS_ICONS[reminder.status]}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{reminder.medicationName}</h4>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                {STATUS_LABELS[reminder.status]}
              </span>
            </div>
            {reminder.dosage && <p className="text-sm text-gray-600">Dosage: {reminder.dosage}</p>}
            <div className="flex gap-4 text-xs text-gray-500 mt-1">
              <span>Scheduled: {reminder.scheduledTime}</span>
              <span>{reminderDate.toLocaleDateString()}</span>
            </div>
            {isOverdue && (
              <p className="text-xs text-red-600 font-medium mt-2">⚠️ This reminder is overdue</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {(reminder.status === "sent" || reminder.status === "pending") && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onAcknowledge?.(reminder.id)}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Taken
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkMissed?.(reminder.id)}
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                Missed
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Pill className="w-5 h-5 text-primary" />
        Medication Reminders
      </h3>

      {/* Pending Reminders */}
      {pendingReminders.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Pending ({pendingReminders.length})
          </h4>
          <div className="space-y-2">{pendingReminders.map(renderReminderItem)}</div>
        </div>
      )}

      {/* Sent Reminders */}
      {sentReminders.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Awaiting Action ({sentReminders.length})
          </h4>
          <div className="space-y-2">{sentReminders.map(renderReminderItem)}</div>
        </div>
      )}

      {/* Acknowledged Reminders */}
      {acknowledgedReminders.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Completed ({acknowledgedReminders.length})
          </h4>
          <div className="space-y-2 opacity-75">{acknowledgedReminders.map(renderReminderItem)}</div>
        </div>
      )}

      {/* Missed Reminders */}
      {missedReminders.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 text-red-600">
            Missed ({missedReminders.length})
          </h4>
          <div className="space-y-2">{missedReminders.map(renderReminderItem)}</div>
        </div>
      )}

      {/* No Reminders */}
      {reminders.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-gray-600">No medication reminders at this time</p>
        </div>
      )}
    </Card>
  );
}
