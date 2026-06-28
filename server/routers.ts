import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";
import * as db from "./db";
import {
  initiatePatientCall,
  initiateAdminCall,
  acceptCall,
  declineCall,
  endCall,
} from "./_core/socket";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    setRole: protectedProcedure
      .input(z.object({ role: z.enum(["doctor", "patient", "operator"]) }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Update user role in database if available
          const userDb = await db.getDb();
          if (userDb) {
            await db.upsertUser({
              openId: ctx.user!.openId,
              role: input.role,
            });
          }
          return { success: true, role: input.role };
        } catch (error) {
          console.error("Failed to set role:", error);
          throw error;
        }
      }),
  }),

  // Patient management procedures
  patients: router({
    getByUserId: protectedProcedure.query(async ({ ctx }) => {
      return await db.getPatientByUserId(ctx.user!.id);
    }),
    
    getAssignedPatients: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user!.role !== "doctor") {
        throw new Error("Only doctors can view assigned patients");
      }
      return await db.getPatientsByDoctorId(ctx.user!.id);
    }),

    create: protectedProcedure
      .input(z.object({
        bedNumber: z.string().optional(),
        medicalRecordNumber: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user!.role !== "patient") {
          throw new Error("Only patients can create patient records");
        }
        
        return await db.createPatient({
          userId: ctx.user!.id,
          bedNumber: input.bedNumber,
          medicalRecordNumber: input.medicalRecordNumber,
          status: "monitoring",
        });
      }),

    update: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        bedNumber: z.string().optional(),
        status: z.enum(["admitted", "monitoring", "critical", "discharged", "transferred"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user!.role !== "doctor") {
          throw new Error("Only doctors can update patient records");
        }

        return await db.updatePatient(input.patientId, {
          bedNumber: input.bedNumber,
          status: input.status,
        });
      }),
  }),

  // Vital signs procedures
  vitals: router({
    getLatest: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getLatestVitalsByPatientId(input.patientId);
      }),

    getHistory: protectedProcedure
      .input(z.object({ patientId: z.number(), limit: z.number().default(100) }))
      .query(async ({ ctx, input }) => {
        return await db.getVitalHistoryByPatientId(input.patientId, input.limit);
      }),

    create: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        heartRate: z.number().optional(),
        spO2: z.number().optional(),
        systolicBP: z.number().optional(),
        diastolicBP: z.number().optional(),
        temperature: z.number().optional(),
        respiratoryRate: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is doctor or operator assigned to this patient
        if (ctx.user!.role !== "doctor" && ctx.user!.role !== "operator") {
          throw new Error("Unauthorized to record vitals");
        }

        return await db.createVital({
          patientId: input.patientId,
          heartRate: input.heartRate,
          spO2: input.spO2 ? (input.spO2.toString() as any) : undefined,
          systolicBP: input.systolicBP,
          diastolicBP: input.diastolicBP,
          temperature: input.temperature ? (input.temperature.toString() as any) : undefined,
          respiratoryRate: input.respiratoryRate,
          recordedAt: new Date(),
        });
      }),
  }),

  // Alert procedures
  alerts: router({
    getActive: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getActiveAlertsByPatientId(input.patientId);
      }),

    getHistory: protectedProcedure
      .input(z.object({ patientId: z.number(), limit: z.number().default(100) }))
      .query(async ({ ctx, input }) => {
        return await db.getAllAlertsByPatientId(input.patientId, input.limit);
      }),

    create: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        alertType: z.enum(["critical_heart_rate", "critical_spo2", "critical_bp", "critical_temperature", "fall_detection", "bed_exit", "medication_missed"]),
        severity: z.enum(["warning", "critical", "emergency"]),
        vitalValue: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createAlert({
          patientId: input.patientId,
          alertType: input.alertType,
          severity: input.severity,
          vitalValue: input.vitalValue,
          status: "active",
          triggeredAt: new Date(),
        });
      }),

    acknowledge: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateAlert(input.alertId, {
          status: "acknowledged",
          acknowledgedAt: new Date(),
          acknowledgedBy: ctx.user!.id,
        });
      }),

    resolve: protectedProcedure
      .input(z.object({ alertId: z.number(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateAlert(input.alertId, {
          status: "resolved",
          resolvedAt: new Date(),
          notes: input.notes,
        });
      }),
  }),

  // Medication procedures
  medications: router({
    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getMedicationsByPatientId(input.patientId);
      }),

    create: protectedProcedure
      .input(z.object({
        patientId: z.number(),
        medicationName: z.string(),
        dosage: z.string().optional(),
        frequency: z.enum(["once_daily", "twice_daily", "three_times_daily", "four_times_daily", "every_6_hours", "every_8_hours", "every_12_hours", "as_needed"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user!.role !== "doctor") {
          throw new Error("Only doctors can prescribe medications");
        }

        return await db.createMedication({
          patientId: input.patientId,
          medicationName: input.medicationName,
          dosage: input.dosage,
          frequency: input.frequency,
          prescribedBy: ctx.user!.id,
          notes: input.notes,
          status: "active",
          startDate: new Date(),
        });
      }),
  }),

  // Medication reminder procedures
  medicationReminders: router({
    getPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user!.role !== "operator" && ctx.user!.role !== "doctor") {
        throw new Error("Unauthorized");
      }
      return await db.getPendingMedicationReminders();
    }),

    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getMedicationRemindersByPatientId(input.patientId);
      }),

    acknowledge: protectedProcedure
      .input(z.object({ reminderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateMedicationReminder(input.reminderId, {
          status: "acknowledged",
          acknowledgedAt: new Date(),
          acknowledgedBy: ctx.user!.id,
        });
      }),

    markMissed: protectedProcedure
      .input(z.object({ reminderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateMedicationReminder(input.reminderId, {
          status: "missed",
        });
      }),
  }),

  // Compliance procedures
  compliance: router({
    getByPatientAndMedication: protectedProcedure
      .input(z.object({ patientId: z.number(), medicationId: z.number(), date: z.date() }))
      .query(async ({ ctx, input }) => {
        return await db.getComplianceByPatientAndMedication(input.patientId, input.medicationId, input.date);
      }),
  }),

  // Real-time video call signaling (works across devices)
  calls: router({
    initiate: publicProcedure
      .input(z.object({
        patientId: z.string(),
        patientName: z.string(),
        caller: z.enum(["patient", "admin"]),
      }))
      .mutation(({ input }) => {
        const call = input.caller === "patient"
          ? initiatePatientCall(input.patientId, input.patientName)
          : initiateAdminCall(input.patientId, input.patientName);
        return { success: true, call };
      }),

    accept: publicProcedure
      .input(z.object({ patientId: z.string() }))
      .mutation(({ input }) => {
        const call = acceptCall(input.patientId);
        if (!call) {
          throw new Error("No active call to accept");
        }
        return { success: true, call };
      }),

    decline: publicProcedure
      .input(z.object({ patientId: z.string() }))
      .mutation(({ input }) => {
        const call = declineCall(input.patientId);
        if (!call) {
          throw new Error("No active call to decline");
        }
        return { success: true, call };
      }),

    end: publicProcedure
      .input(z.object({ patientId: z.string() }))
      .mutation(({ input }) => {
        const call = endCall(input.patientId);
        if (!call) {
          throw new Error("No active call to end");
        }
        return { success: true, call };
      }),
  }),

  // Market Validation & Feedback Router
  feedback: router({
    submit: publicProcedure
      .input(z.object({
        fullName: z.string().min(1, "Full name is required"),
        email: z.string().email("Invalid email format"),
        userRole: z.string().min(1, "User role is required"),
        overallExperience: z.number().min(1).max(5),
        easeOfUse: z.number().min(1).max(5),
        aiAccuracy: z.number().min(1).max(5),
        uiDesign: z.number().min(1).max(5),
        recommend: z.enum(["Yes", "Maybe", "No"]),
        useInHospital: z.enum(["Yes", "No"]),
        likeMost: z.string().optional(),
        problemsFaced: z.string().optional(),
        suggestions: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.createFeedback({
          ...input,
          createdAt: new Date(),
        });
        return { success: true, feedback: result };
      }),

    getAll: publicProcedure.query(async () => {
      return await db.getAllFeedback();
    }),

    getStats: publicProcedure.query(async () => {
      const allFeedback = await db.getAllFeedback();
      const count = allFeedback.length;
      if (count === 0) {
        return {
          totalCount: 0,
          avgOverall: 0,
          avgEaseOfUse: 0,
          avgAiAccuracy: 0,
          avgUiDesign: 0,
          recommendRate: 0,
          hospitalAdoptionRate: 0,
          byRole: {},
          byRating: [],
        };
      }

      let sumOverall = 0;
      let sumEaseOfUse = 0;
      let sumAiAccuracy = 0;
      let sumUiDesign = 0;
      let recommendYesOrMaybeCount = 0;
      let hospitalUseYesCount = 0;
      const byRole: Record<string, number> = {};
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      allFeedback.forEach((f) => {
        sumOverall += f.overallExperience;
        sumEaseOfUse += f.easeOfUse;
        sumAiAccuracy += f.aiAccuracy;
        sumUiDesign += f.uiDesign;

        if (f.recommend === "Yes" || f.recommend === "Maybe") {
          recommendYesOrMaybeCount++;
        }
        if (f.useInHospital === "Yes") {
          hospitalUseYesCount++;
        }

        byRole[f.userRole] = (byRole[f.userRole] || 0) + 1;
        const rating = f.overallExperience as 1 | 2 | 3 | 4 | 5;
        if (ratingCounts[rating] !== undefined) {
          ratingCounts[rating]++;
        }
      });

      return {
        totalCount: count,
        avgOverall: Number((sumOverall / count).toFixed(1)),
        avgEaseOfUse: Number((sumEaseOfUse / count).toFixed(1)),
        avgAiAccuracy: Number((sumAiAccuracy / count).toFixed(1)),
        avgUiDesign: Number((sumUiDesign / count).toFixed(1)),
        recommendRate: Math.round((recommendYesOrMaybeCount / count) * 100),
        hospitalAdoptionRate: Math.round((hospitalUseYesCount / count) * 100),
        byRole,
        byRating: Object.entries(ratingCounts).map(([rating, val]) => ({
          rating: Number(rating),
          count: val,
        })),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
