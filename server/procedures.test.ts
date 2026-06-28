import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// In-memory data store for the mock DB operations
const mockPatients = [
  { id: 1, userId: 2, name: "John Smith", doctorId: 1, bedNumber: "ICU-01", status: "monitoring" }
];
const mockVitals: any[] = [];
const mockAlerts: any[] = [];
const mockMedications: any[] = [];
const mockReminders: any[] = [];

// Mock the db module
vi.mock("./db", () => {
  return {
    getDb: vi.fn().mockResolvedValue({}), // Mock connection
    getPatientsByDoctorId: vi.fn(async (doctorId: number) => {
      return mockPatients;
    }),
    getPatientByUserId: vi.fn(async (userId: number) => {
      return mockPatients.find(p => p.userId === userId) || null;
    }),
    createPatient: vi.fn(async (data: any) => {
      const newP = { id: mockPatients.length + 1, ...data };
      mockPatients.push(newP);
      return newP;
    }),
    updatePatient: vi.fn(async (id: number, data: any) => {
      const idx = mockPatients.findIndex(p => p.id === id);
      if (idx !== -1) {
        mockPatients[idx] = { ...mockPatients[idx], ...data };
        return mockPatients[idx];
      }
      return null;
    }),
    getLatestVitalsByPatientId: vi.fn(async (patientId: number) => {
      const patientVitals = mockVitals.filter(v => v.patientId === patientId);
      return patientVitals[patientVitals.length - 1] || null;
    }),
    getVitalHistoryByPatientId: vi.fn(async (patientId: number, limit: number) => {
      return mockVitals.filter(v => v.patientId === patientId).slice(-limit);
    }),
    createVital: vi.fn(async (data: any) => {
      const entry = { id: mockVitals.length + 1, ...data };
      mockVitals.push(entry);
      return entry;
    }),
    getActiveAlertsByPatientId: vi.fn(async (patientId: number) => {
      return mockAlerts.filter(a => a.patientId === patientId && a.status === "active");
    }),
    getAllAlertsByPatientId: vi.fn(async (patientId: number, limit: number) => {
      return mockAlerts.filter(a => a.patientId === patientId).slice(-limit);
    }),
    createAlert: vi.fn(async (data: any) => {
      const entry = { id: mockAlerts.length + 1, ...data, status: "active", triggeredAt: new Date() };
      mockAlerts.push(entry);
      return entry;
    }),
    updateAlert: vi.fn(async (id: number, data: any) => {
      const idx = mockAlerts.findIndex(a => a.id === id);
      if (idx !== -1) {
        mockAlerts[idx] = { ...mockAlerts[idx], ...data };
        return mockAlerts[idx];
      }
      return null;
    }),
    getMedicationsByPatientId: vi.fn(async (patientId: number) => {
      return mockMedications.filter(m => m.patientId === patientId);
    }),
    createMedication: vi.fn(async (data: any) => {
      const entry = { id: mockMedications.length + 1, ...data, status: "active", startDate: new Date() };
      mockMedications.push(entry);
      return entry;
    }),
    getPendingMedicationReminders: vi.fn(async () => {
      return mockReminders.filter(r => r.status === "pending");
    }),
    getMedicationRemindersByPatientId: vi.fn(async (patientId: number) => {
      return mockReminders.filter(r => r.patientId === patientId);
    }),
    updateMedicationReminder: vi.fn(async (id: number, data: any) => {
      const idx = mockReminders.findIndex(r => r.id === id);
      if (idx !== -1) {
        mockReminders[idx] = { ...mockReminders[idx], ...data };
        return mockReminders[idx];
      }
      return null;
    })
  };
});

// Helper to mock the caller contexts for doctors, patients, and operators
function createDoctorContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "manus-doctor-1",
      role: "doctor",
      name: "Dr. Sarah Chen",
      email: "sarah.chen@hospital.org"
    },
    req: {} as any,
    res: {} as any,
  };
}

function createPatientContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "manus-patient-2",
      role: "patient",
      name: "John Smith",
      email: "john.smith@gmail.com"
    },
    req: {} as any,
    res: {} as any,
  };
}

describe("tRPC Procedures Unit Tests", () => {
  describe("Patients Router", () => {
    it("allows doctor to get assigned patients", async () => {
      const ctx = createDoctorContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.patients.getAssignedPatients();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it("rejects patient from viewing doctor's assigned list", async () => {
      const ctx = createPatientContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.patients.getAssignedPatients();
        expect.fail("Should throw unauthorized");
      } catch (err: any) {
        expect(err).toBeDefined();
      }
    });

    it("allows patient to fetch their own profile", async () => {
      const ctx = createPatientContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.patients.getByUserId();
      expect(result).toBeDefined();
      expect(result?.userId).toBe(2);
    });
  });

  describe("Vitals Router", () => {
    it("allows recording and querying vitals", async () => {
      const ctx = createDoctorContext();
      const caller = appRouter.createCaller(ctx);

      // Create a test vital entry
      const vital = await caller.vitals.create({
        patientId: 1,
        heartRate: 85,
        spO2: 98,
        systolicBP: 120,
        diastolicBP: 80,
        temperature: 37.0,
        respiratoryRate: 16
      });

      expect(vital).toBeDefined();
      expect(vital.heartRate).toBe(85);

      // Fetch latest
      const latest = await caller.vitals.getLatest({ patientId: 1 });
      expect(latest).toBeDefined();
      expect(latest?.heartRate).toBe(85);

      // Fetch history
      const history = await caller.vitals.getHistory({ patientId: 1, limit: 10 });
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it("restricts patient from manually recording vitals", async () => {
      const ctx = createPatientContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.vitals.create({
          patientId: 1,
          heartRate: 85
        });
        expect.fail("Should deny patient vital logging");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe("Alerts Router", () => {
    it("handles alert workflow (create, retrieve, acknowledge, resolve)", async () => {
      const ctx = createDoctorContext();
      const caller = appRouter.createCaller(ctx);

      // 1. Create warning alert
      const alert = await caller.alerts.create({
        patientId: 1,
        alertType: "critical_heart_rate",
        severity: "critical",
        vitalValue: "135"
      });

      expect(alert).toBeDefined();
      expect(alert.alertType).toBe("critical_heart_rate");
      expect(alert.status).toBe("active");

      // 2. Query active alerts
      const activeAlerts = await caller.alerts.getActive({ patientId: 1 });
      expect(activeAlerts).toBeDefined();
      expect(activeAlerts.some(a => a.id === alert.id)).toBe(true);

      // 3. Acknowledge alert
      const acked = await caller.alerts.acknowledge({ alertId: alert.id });
      expect(acked.status).toBe("acknowledged");
      expect(acked.acknowledgedBy).toBe(ctx.user!.id);

      // 4. Resolve alert
      const resolved = await caller.alerts.resolve({
        alertId: alert.id,
        notes: "Heart rate stabilized after metoprolol dosage."
      });
      expect(resolved.status).toBe("resolved");
      expect(resolved.notes).toBe("Heart rate stabilized after metoprolol dosage.");
    });
  });

  describe("Medications & Reminders Router", () => {
    it("allows prescribing and checking medications", async () => {
      const ctx = createDoctorContext();
      const caller = appRouter.createCaller(ctx);

      const med = await caller.medications.create({
        patientId: 1,
        medicationName: "Metoprolol",
        dosage: "50mg",
        frequency: "twice_daily",
        notes: "Take after meals."
      });

      expect(med).toBeDefined();
      expect(med.medicationName).toBe("Metoprolol");
      expect(med.prescribedBy).toBe(ctx.user!.id);

      const list = await caller.medications.getByPatient({ patientId: 1 });
      expect(list).toBeDefined();
      expect(Array.isArray(list)).toBe(true);
      expect(list.some(m => m.id === med.id)).toBe(true);
    });

    it("restricts patient from prescribing medications", async () => {
      const ctx = createPatientContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.medications.create({
          patientId: 1,
          medicationName: "Aspirin",
          frequency: "once_daily"
        });
        expect.fail("Should deny patient prescription");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });
});
