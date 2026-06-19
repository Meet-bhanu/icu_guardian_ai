/**
 * Demo data seeding script for ICU Guardian AI
 * This script populates the database with sample patients, medications, and vital signs
 * for testing and demonstration purposes.
 * 
 * Usage: node --loader tsx server/seed-demo-data.ts
 */

import * as db from "./db";

async function seedDemoData() {
  try {
    console.log("[Seed] Starting demo data seeding...");

    // Create demo patients
    const patient1 = await db.createPatient({
      userId: 1, // Assuming user ID 1 exists
      bedNumber: "ICU-101",
      medicalRecordNumber: "MRN-2026-001",
      status: "monitoring",
      assignedDoctorId: 2,
    });

    const patient2 = await db.createPatient({
      userId: 2,
      bedNumber: "ICU-102",
      medicalRecordNumber: "MRN-2026-002",
      status: "critical",
      assignedDoctorId: 2,
    });

    console.log("[Seed] Created 2 demo patients");

    // Create demo medications
    const med1 = await db.createMedication({
      patientId: 1,
      medicationName: "Lisinopril",
      dosage: "10mg",
      frequency: "once_daily",
      prescribedBy: 2,
      notes: "For hypertension management",
      status: "active",
      startDate: new Date(),
    });

    const med2 = await db.createMedication({
      patientId: 1,
      medicationName: "Metformin",
      dosage: "500mg",
      frequency: "twice_daily",
      prescribedBy: 2,
      notes: "For diabetes management",
      status: "active",
      startDate: new Date(),
    });

    const med3 = await db.createMedication({
      patientId: 2,
      medicationName: "Amoxicillin",
      dosage: "500mg",
      frequency: "three_times_daily",
      prescribedBy: 2,
      notes: "Antibiotic for infection",
      status: "active",
      startDate: new Date(),
    });

    console.log("[Seed] Created 3 demo medications");

    // Create demo vital signs
    const now = new Date();
    
    // Patient 1 vitals (normal)
    await db.createVital({
      patientId: 1,
      heartRate: 72,
      spO2: "98" as any,
      systolicBP: 120,
      diastolicBP: 80,
      temperature: "37.2" as any,
      respiratoryRate: 16,
      recordedAt: new Date(now.getTime() - 3600000),
    });

    await db.createVital({
      patientId: 1,
      heartRate: 75,
      spO2: "97" as any,
      systolicBP: 118,
      diastolicBP: 78,
      temperature: "37.1" as any,
      respiratoryRate: 15,
      recordedAt: now,
    });

    // Patient 2 vitals (critical)
    await db.createVital({
      patientId: 2,
      heartRate: 120,
      spO2: "88" as any,
      systolicBP: 95,
      diastolicBP: 60,
      temperature: "39.2" as any,
      respiratoryRate: 28,
      recordedAt: new Date(now.getTime() - 1800000),
    });

    await db.createVital({
      patientId: 2,
      heartRate: 118,
      spO2: "87" as any,
      systolicBP: 92,
      diastolicBP: 58,
      temperature: "39.5" as any,
      respiratoryRate: 30,
      recordedAt: now,
    });

    console.log("[Seed] Created demo vital signs");

    // Create demo alerts
    await db.createAlert({
      patientId: 2,
      alertType: "critical_heart_rate",
      severity: "critical",
      vitalValue: "120 bpm",
      status: "active",
      triggeredAt: new Date(now.getTime() - 600000),
    });

    await db.createAlert({
      patientId: 2,
      alertType: "critical_spo2",
      severity: "emergency",
      vitalValue: "87%",
      status: "active",
      triggeredAt: new Date(now.getTime() - 300000),
    });

    console.log("[Seed] Created demo alerts");

    // Create demo medication reminders
    const today = new Date();
    today.setHours(9, 0, 0, 0);

    await db.createMedicationReminder({
      medicationId: 1,
      patientId: 1,
      scheduledTime: "09:00",
      reminderDate: today,
      status: "pending",
    });

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await db.createMedicationReminder({
      medicationId: 2,
      patientId: 1,
      scheduledTime: "09:00",
      reminderDate: tomorrow,
      status: "pending",
    });

    console.log("[Seed] Created demo medication reminders");

    console.log("[Seed] Demo data seeding completed successfully!");
  } catch (error) {
    console.error("[Seed] Error seeding demo data:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDemoData().then(() => {
  process.exit(0);
});
