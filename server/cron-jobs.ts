import * as db from "./db";
import { notifyOwner } from "./_core/notification";

/**
 * Medication reminder cron job handler
 * Called by Heartbeat scheduler every hour
 */
export async function handleMedicationReminders() {
  try {
    console.log("[Cron] Checking for medication reminders...");
    
    const reminders = await db.getPendingMedicationReminders();
    
    if (reminders.length === 0) {
      console.log("[Cron] No pending medication reminders");
      return;
    }

    let sentCount = 0;

    for (const reminder of reminders) {
      // Check if reminder time has arrived
      const now = new Date();
      const reminderTime = new Date(reminder.reminderDate);
      
      // Only send if within the current hour
      if (reminderTime <= now && reminderTime.getTime() + 3600000 > now.getTime()) {
        // Update reminder status to sent
        await db.updateMedicationReminder(reminder.id, {
          status: "sent",
          sentAt: new Date(),
        });

        // Get medication details
        const medications = await db.getMedicationsByPatientId(reminder.patientId);
        const medication = medications.find(m => m.id === reminder.medicationId);

        if (medication) {
          // Send notification to project owner
          await notifyOwner({
            title: "Medication Reminder",
            content: `Patient ID ${reminder.patientId}: Time to take ${medication.medicationName}${medication.dosage ? ` (${medication.dosage})` : ""}`,
          });

          sentCount++;
          console.log(`[Cron] Sent medication reminder for patient ${reminder.patientId}: ${medication.medicationName}`);
        }
      }
    }

    console.log(`[Cron] Processed ${sentCount} medication reminder(s)`);
  } catch (error) {
    console.error("[Cron] Error checking medication reminders:", error);
  }
}

/**
 * Daily compliance update cron job handler
 * Called by Heartbeat scheduler daily at midnight UTC
 */
export async function handleDailyCompliance() {
  try {
    console.log("[Cron] Updating daily compliance records...");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all medication reminders from today
    const reminders = await db.getPendingMedicationReminders();
    
    // Group by patient and medication
    const complianceMap = new Map<string, { 
      patientId: number; 
      medicationId: number; 
      total: number; 
      acknowledged: number; 
      missed: number 
    }>();

    for (const reminder of reminders) {
      const key = `${reminder.patientId}-${reminder.medicationId}`;
      
      if (!complianceMap.has(key)) {
        complianceMap.set(key, {
          patientId: reminder.patientId,
          medicationId: reminder.medicationId,
          total: 0,
          acknowledged: 0,
          missed: 0,
        });
      }

      const record = complianceMap.get(key)!;
      record.total++;

      if (reminder.status === "acknowledged" || reminder.status === "completed") {
        record.acknowledged++;
      } else if (reminder.status === "missed") {
        record.missed++;
      }
    }

    // Update or create compliance records
    let updatedCount = 0;
    const complianceArray = Array.from(complianceMap.values());
    
    for (const compliance of complianceArray) {
      const existingRecord = await db.getComplianceByPatientAndMedication(
        compliance.patientId,
        compliance.medicationId,
        today
      );

      const compliancePercentage = compliance.total > 0 
        ? Math.round((compliance.acknowledged / compliance.total) * 100)
        : 0;

      if (existingRecord) {
        await db.updateComplianceRecord(existingRecord.id, {
          totalReminders: compliance.total,
          acknowledgedReminders: compliance.acknowledged,
          missedReminders: compliance.missed,
          compliancePercentage: compliancePercentage.toString(),
        });
      } else {
        await db.createComplianceRecord({
          patientId: compliance.patientId,
          medicationId: compliance.medicationId,
          date: today,
          totalReminders: compliance.total,
          acknowledgedReminders: compliance.acknowledged,
          missedReminders: compliance.missed,
          compliancePercentage: compliancePercentage.toString(),
        });
      }
      updatedCount++;
    }

    console.log(`[Cron] Updated compliance records for ${updatedCount} medication(s)`);
  } catch (error) {
    console.error("[Cron] Error updating compliance:", error);
  }
}

/**
 * Alert escalation cron job handler
 * Called by Heartbeat scheduler every 5 minutes
 */
export async function handleAlertEscalation() {
  try {
    console.log("[Cron] Checking for alerts to escalate...");
    
    // This would typically query for active critical alerts
    // and escalate them if they haven't been acknowledged within a certain time
    // For now, this is a placeholder for the escalation logic
    
    console.log("[Cron] Alert escalation check complete");
  } catch (error) {
    console.error("[Cron] Error escalating alerts:", error);
  }
}
