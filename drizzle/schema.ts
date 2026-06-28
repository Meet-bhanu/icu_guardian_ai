import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "doctor", "patient", "operator"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Patient table for ICU monitoring system.
 * Links patients to their assigned doctors.
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  assignedDoctorId: int("assignedDoctorId"),
  bedNumber: varchar("bedNumber", { length: 20 }),
  medicalRecordNumber: varchar("medicalRecordNumber", { length: 50 }).unique(),
  dateOfBirth: timestamp("dateOfBirth"),
  admissionDate: timestamp("admissionDate").defaultNow().notNull(),
  dischargeDateEstimated: timestamp("dischargeDateEstimated"),
  status: mysqlEnum("status", ["admitted", "monitoring", "critical", "discharged", "transferred"]).default("monitoring").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Vital signs table for real-time patient monitoring.
 * Stores heart rate, SpO2, blood pressure, and temperature readings.
 */
export const vitals = mysqlTable("vitals", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  heartRate: int("heartRate"),
  spO2: decimal("spO2", { precision: 5, scale: 2 }),
  systolicBP: int("systolicBP"),
  diastolicBP: int("diastolicBP"),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  respiratoryRate: int("respiratoryRate"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Vital = typeof vitals.$inferSelect;
export type InsertVital = typeof vitals.$inferInsert;

/**
 * Alert table for critical vital sign thresholds.
 * Tracks all alerts triggered by the system.
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  alertType: mysqlEnum("alertType", ["critical_heart_rate", "critical_spo2", "critical_bp", "critical_temperature", "fall_detection", "bed_exit", "medication_missed"]).notNull(),
  severity: mysqlEnum("severity", ["warning", "critical", "emergency"]).default("critical").notNull(),
  vitalValue: text("vitalValue"),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledgedAt"),
  acknowledgedBy: int("acknowledgedBy"),
  resolvedAt: timestamp("resolvedAt"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved", "false_alarm"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Medication table for patient medication management.
 */
export const medications = mysqlTable("medications", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  medicationName: varchar("medicationName", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }),
  frequency: mysqlEnum("frequency", ["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "every_6_hours", "every_8_hours", "every_12_hours", "as_needed"]).notNull(),
  prescribedBy: int("prescribedBy"),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  notes: text("notes"),
  status: mysqlEnum("status", ["active", "completed", "discontinued"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;

/**
 * Medication reminder table for tracking scheduled medication reminders.
 */
export const medicationReminders = mysqlTable("medicationReminders", {
  id: int("id").autoincrement().primaryKey(),
  medicationId: int("medicationId").notNull(),
  patientId: int("patientId").notNull(),
  scheduledTime: varchar("scheduledTime", { length: 5 }),
  reminderDate: timestamp("reminderDate").notNull(),
  sentAt: timestamp("sentAt"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  acknowledgedBy: int("acknowledgedBy"),
  status: mysqlEnum("status", ["pending", "sent", "acknowledged", "missed", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MedicationReminder = typeof medicationReminders.$inferSelect;
export type InsertMedicationReminder = typeof medicationReminders.$inferInsert;

/**
 * Compliance record table for tracking medication compliance.
 */
export const complianceRecords = mysqlTable("complianceRecords", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patientId").notNull(),
  medicationId: int("medicationId").notNull(),
  date: timestamp("date").notNull(),
  totalReminders: int("totalReminders").default(0).notNull(),
  acknowledgedReminders: int("acknowledgedReminders").default(0).notNull(),
  missedReminders: int("missedReminders").default(0).notNull(),
  compliancePercentage: decimal("compliancePercentage", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComplianceRecord = typeof complianceRecords.$inferSelect;
export type InsertComplianceRecord = typeof complianceRecords.$inferInsert;

/**
 * Alert log table for tracking alert history and response times.
 */
export const alertLogs = mysqlTable("alertLogs", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alertId").notNull(),
  patientId: int("patientId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  performedBy: int("performedBy"),
  responseTime: int("responseTime"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AlertLog = typeof alertLogs.$inferSelect;
export type InsertAlertLog = typeof alertLogs.$inferInsert;

/**
 * Notification preferences table for user notification settings.
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pushNotificationsEnabled: boolean("pushNotificationsEnabled").default(true).notNull(),
  emailNotificationsEnabled: boolean("emailNotificationsEnabled").default(true).notNull(),
  criticalAlertsOnly: boolean("criticalAlertsOnly").default(false).notNull(),
  quietHoursStart: varchar("quietHoursStart", { length: 5 }),
  quietHoursEnd: varchar("quietHoursEnd", { length: 5 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Feedback table for Market Validation & Product-Market Fit.
 */
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  userRole: varchar("userRole", { length: 50 }).notNull(), // Doctor, Nurse, Medical Student, Hospital Admin, Patient, General User
  overallExperience: int("overallExperience").notNull(), // 1-5 rating
  easeOfUse: int("easeOfUse").notNull(), // 1-5
  aiAccuracy: int("aiAccuracy").notNull(), // 1-5
  uiDesign: int("uiDesign").notNull(), // 1-5
  recommend: varchar("recommend", { length: 10 }).notNull(), // "Yes", "Maybe", "No"
  useInHospital: varchar("useInHospital", { length: 10 }).notNull(), // "Yes", "No"
  likeMost: text("likeMost"),
  problemsFaced: text("problemsFaced"),
  suggestions: text("suggestions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;
