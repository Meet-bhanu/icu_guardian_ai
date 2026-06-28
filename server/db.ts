import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  patients,
  doctors,
  auditLogs,
  vitals,
  medications,
  alerts,
  medicationReminders,
  complianceRecords,
  feedback,
  Feedback,
  InsertFeedback,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Patient queries
export async function getPatientByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(patients).where(eq(patients.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPatientsByDoctorId(doctorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(patients).where(eq(patients.assignedDoctorId, doctorId));
}

export async function createPatient(patientData: typeof patients.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(patients).values(patientData);
  return result;
}

export async function updatePatient(patientId: number, updates: Partial<typeof patients.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(patients).set(updates).where(eq(patients.id, patientId));
}

// Vital signs queries
export async function getLatestVitalsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(vitals)
    .where(eq(vitals.patientId, patientId))
    .orderBy(vitals.recordedAt)
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getVitalHistoryByPatientId(patientId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(vitals)
    .where(eq(vitals.patientId, patientId))
    .orderBy(vitals.recordedAt)
    .limit(limit);
}

export async function createVital(vitalData: typeof vitals.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(vitals).values(vitalData);
}

// Alert queries
export async function getActiveAlertsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(alerts)
    .where(and(eq(alerts.patientId, patientId), eq(alerts.status, "active")));
}

export async function getAllAlertsByPatientId(patientId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(alerts)
    .where(eq(alerts.patientId, patientId))
    .orderBy(alerts.triggeredAt)
    .limit(limit);
}

export async function createAlert(alertData: typeof alerts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(alerts).values(alertData);
}

export async function updateAlert(alertId: number, updates: Partial<typeof alerts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(alerts).set(updates).where(eq(alerts.id, alertId));
}

// Medication queries
export async function getMedicationsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(medications)
    .where(and(eq(medications.patientId, patientId), eq(medications.status, "active")));
}

export async function createMedication(medData: typeof medications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(medications).values(medData);
}

// Medication reminder queries
export async function getPendingMedicationReminders() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(medicationReminders)
    .where(eq(medicationReminders.status, "pending"));
}

export async function getMedicationRemindersByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(medicationReminders)
    .where(eq(medicationReminders.patientId, patientId))
    .orderBy(medicationReminders.reminderDate);
}

export async function createMedicationReminder(reminderData: typeof medicationReminders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(medicationReminders).values(reminderData);
}

export async function updateMedicationReminder(reminderId: number, updates: Partial<typeof medicationReminders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(medicationReminders).set(updates).where(eq(medicationReminders.id, reminderId));
}

// Compliance queries
export async function getComplianceByPatientAndMedication(patientId: number, medicationId: number, date: Date) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(complianceRecords)
    .where(and(
      eq(complianceRecords.patientId, patientId),
      eq(complianceRecords.medicationId, medicationId),
      eq(complianceRecords.date, date)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createComplianceRecord(complianceData: typeof complianceRecords.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(complianceRecords).values(complianceData);
}

export async function updateComplianceRecord(complianceId: number, updates: Partial<typeof complianceRecords.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(complianceRecords).set(updates).where(eq(complianceRecords.id, complianceId));
}

// ─── Auth & user management ─────────────────────────────────────────────────

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCredentialUser(data: {
  openId: string;
  username: string;
  passwordHash: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "patient" | "doctor" | "super_admin";
  loginMethod?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values({
    openId: data.openId,
    username: data.username,
    passwordHash: data.passwordHash,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    role: data.role,
    loginMethod: data.loginMethod ?? "credentials",
    isActive: true,
    lastSignedIn: new Date(),
  });

  return Number(result[0].insertId);
}

export async function updateUser(userId: number, updates: Partial<typeof users.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(users).set(updates).where(eq(users.id, userId));
}

export async function deactivateUser(userId: number) {
  return updateUser(userId, { isActive: false });
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, userId));
}

export async function getPatientCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(patients);
  return Number(result[0]?.count ?? 0);
}

export async function getDoctorCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(doctors);
  return Number(result[0]?.count ?? 0);
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPatientRecord(data: typeof patients.$inferInsert): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(patients).values(data);
  return Number(result[0].insertId);
}

export async function deletePatient(patientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(patients).where(eq(patients.id, patientId));
}

export async function getDoctorByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(doctors).where(eq(doctors.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDoctorRecord(data: typeof doctors.$inferInsert): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(doctors).values(data);
  return Number(result[0].insertId);
}

export async function getAllPatientsWithUsers() {
  const db = await getDb();
  if (!db) return [];

  const allPatients = await db.select().from(patients).orderBy(desc(patients.createdAt));
  const result = [];

  for (const patient of allPatients) {
    const user = await getUserById(patient.userId);
    let doctorName: string | null = null;
    if (patient.assignedDoctorId) {
      const docUser = await getUserById(patient.assignedDoctorId);
      doctorName = docUser?.name ?? null;
    }
    result.push({ ...patient, user: user ? { id: user.id, name: user.name, email: user.email, username: user.username, isActive: user.isActive } : null, doctorName });
  }

  return result;
}

export async function getAllDoctorsWithUsers() {
  const db = await getDb();
  if (!db) return [];

  const allDoctors = await db.select().from(doctors).orderBy(desc(doctors.createdAt));
  const result = [];

  for (const doctor of allDoctors) {
    const user = await getUserById(doctor.userId);
    result.push({ ...doctor, user: user ? { id: user.id, name: user.name, email: user.email, username: user.username, isActive: user.isActive } : null });
  }

  return result;
}

export async function createAuditLog(data: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

// In-memory feedback storage fallback (pre-populated with realistic hackathon demo data)
const inMemoryFeedback: Feedback[] = [
  {
    id: 1,
    fullName: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@stjude.org",
    userRole: "Doctor",
    overallExperience: 5,
    easeOfUse: 5,
    aiAccuracy: 5,
    uiDesign: 4,
    recommend: "Yes",
    useInHospital: "Yes",
    likeMost: "The real-time vitals monitoring is exceptionally responsive, and the alarm triage logic saves valuable minutes.",
    problemsFaced: "The high frequency alerts can sometimes cause alarm fatigue if thresholds are set too narrow.",
    suggestions: "Allow custom per-patient alert threshold customization directly from the patient details panel.",
    createdAt: new Date(Date.now() - 36 * 3600 * 1000),
  },
  {
    id: 2,
    fullName: "Robert Chen, RN",
    email: "robert.chen@sfgeneral.org",
    userRole: "Nurse",
    overallExperience: 4,
    easeOfUse: 5,
    aiAccuracy: 4,
    uiDesign: 5,
    recommend: "Yes",
    useInHospital: "Yes",
    likeMost: "Clean, elegant layout. The color-coding for warning, critical, and emergency states is intuitive and clear.",
    problemsFaced: "Connecting to legacy telemetry monitors took a few tries during setup.",
    suggestions: "Include a step-by-step connection wizard for standard hospital telemetry hardware.",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000),
  },
  {
    id: 3,
    fullName: "Dr. Emily Rostova",
    email: "emily.rostova@mayoclinic.edu",
    userRole: "Doctor",
    overallExperience: 5,
    easeOfUse: 4,
    aiAccuracy: 5,
    uiDesign: 5,
    recommend: "Yes",
    useInHospital: "Yes",
    likeMost: "AI prediction metrics for vitals anomalies are spot on. It predicted a sudden oxygen desaturation event 10 minutes prior.",
    problemsFaced: "Nothing critical. The interface performs beautifully on desktop and tablet.",
    suggestions: "Add a dark mode toggle specifically for night shifts in the ICU wards.",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000),
  },
  {
    id: 4,
    fullName: "David Goldstein",
    email: "d.goldstein@mountsinai.org",
    userRole: "Hospital Admin",
    overallExperience: 5,
    easeOfUse: 4,
    aiAccuracy: 4,
    uiDesign: 5,
    recommend: "Yes",
    useInHospital: "Yes",
    likeMost: "The compliance dashboard and automated medication reminders provide a clear pathway for reducing clinical errors.",
    problemsFaced: "Need more extensive documentation on HIPAA compliance and data storage policies.",
    suggestions: "Provide a downloadable security and compliance whitepaper for hospital compliance boards.",
    createdAt: new Date(Date.now() - 8 * 3600 * 1000),
  },
  {
    id: 5,
    fullName: "Marcus Aurelius",
    email: "marcus.aurelius@gmail.com",
    userRole: "Patient",
    overallExperience: 5,
    easeOfUse: 5,
    aiAccuracy: 5,
    uiDesign: 5,
    recommend: "Yes",
    useInHospital: "No",
    likeMost: "Having a direct medication schedule on my dashboard gave me complete visibility into my treatment.",
    problemsFaced: "The alerts were a bit loud when I was trying to rest, but the nursing staff adjusted them.",
    suggestions: "Include a night-mode or sleep mode for the patient bedside screen.",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000),
  },
];

export async function createFeedback(feedbackData: InsertFeedback) {
  const db = await getDb();
  if (!db) {
    const newFeedback: Feedback = {
      ...feedbackData,
      id: inMemoryFeedback.length + 1,
      createdAt: feedbackData.createdAt || new Date(),
    } as Feedback;
    inMemoryFeedback.push(newFeedback);
    return newFeedback;
  }

  const result = await db.insert(feedback).values(feedbackData);
  return result;
}

export async function getAllFeedback() {
  const db = await getDb();
  if (!db) {
    return inMemoryFeedback;
  }

  try {
    const dbResults = await db.select().from(feedback);
    if (dbResults.length === 0) {
      return inMemoryFeedback;
    }
    return dbResults;
  } catch (error) {
    console.error("[Database] Failed to query feedback from database, using fallback:", error);
    return inMemoryFeedback;
  }
}
