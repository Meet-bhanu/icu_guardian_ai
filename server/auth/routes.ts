import type { Express, Request, Response } from "express";
import { ICU_AUTH_COOKIE } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import * as db from "../db";
import { logAudit } from "./audit";
import { signAuthToken } from "./jwt";
import { generateOpenId, generatePatientPublicId, generateDoctorPublicId, generateUsername, getClientIp } from "./utils";
import { generateSecurePassword, hashPassword, verifyPassword } from "./password";
import { authenticateFromCookie, isSuperAdmin, requireAuth, type AuthRequest } from "./middleware";
import { DEV_MODE, findDevUser } from "./devUsers";

const ROLE_MAP: Record<string, string> = {
  super_admin: "super_admin",
  admin: "super_admin",
  doctor: "doctor",
  patient: "patient",
};

function sanitizeUser(user: Awaited<ReturnType<typeof db.getUserById>>) {
  if (!user) return null;
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function registerAuthRoutes(app: Express) {
  // POST /api/login
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password, role: selectedRole, rememberMe } = req.body ?? {};

      if (!username || !password || !selectedRole) {
        res.status(400).json({ error: "Username, password, and role are required" });
        return;
      }

      const expectedRole = ROLE_MAP[selectedRole];
      if (!expectedRole) {
        res.status(400).json({ error: "Invalid role selected" });
        return;
      }

      let user = await db.getUserByUsername(String(username).trim());

      if (user?.passwordHash) {
        if (!user.isActive) {
          res.status(403).json({ error: "Account is deactivated. Contact administrator." });
          return;
        }

        const roleMatches =
          user.role === expectedRole ||
          (expectedRole === "super_admin" && isSuperAdmin(user.role));

        if (!roleMatches) {
          res.status(401).json({ error: "Invalid credentials for selected role" });
          return;
        }

        const valid = await verifyPassword(String(password), user.passwordHash);
        if (!valid) {
          res.status(401).json({ error: "Invalid credentials" });
          return;
        }

        await db.updateUser(user.id, { lastSignedIn: new Date() });
      } else {
        user = findDevUser(String(username), String(password), expectedRole) ?? undefined;
        if (!user) {
          res.status(401).json({
            error: DEV_MODE
              ? "Invalid credentials. Use superadmin / SuperAdmin@2026 for Super Admin."
              : "Invalid credentials",
          });
          return;
        }
      }

      const token = await signAuthToken(
        { userId: user.id, role: user.role, username: user.username ?? "" },
        Boolean(rememberMe)
      );

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(ICU_AUTH_COOKIE, token, {
        ...cookieOptions,
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      });

      await logAudit({
        performedBy: user.id,
        action: "LOGIN",
        entityType: "user",
        entityId: user.id,
        ipAddress: getClientIp(req),
      });

      res.json({ success: true, user: sanitizeUser(user) });
    } catch (error) {
      console.error("[Login]", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // POST /api/logout
  app.post("/api/logout", async (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(ICU_AUTH_COOKIE, { ...cookieOptions, maxAge: -1 });

    const user = await authenticateFromCookie(req);
    if (user) {
      await logAudit({
        performedBy: user.id,
        action: "LOGOUT",
        entityType: "user",
        entityId: user.id,
        ipAddress: getClientIp(req),
      });
    }

    res.json({ success: true });
  });

  // GET /api/me
  app.get("/api/me", async (req: Request, res: Response) => {
    const user = await authenticateFromCookie(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    let profile: Record<string, unknown> = { ...sanitizeUser(user) };

    if (user.role === "patient") {
      const patient = await db.getPatientByUserId(user.id);
      if (patient) {
        profile = { ...profile, patient };
      }
    } else if (user.role === "doctor") {
      const doctor = await db.getDoctorByUserId(user.id);
      if (doctor) {
        profile = { ...profile, doctor };
      }
    }

    res.json({ user: profile });
  });

  // POST /api/admin/create-patient
  app.post(
    "/api/admin/create-patient",
    requireAuth(["super_admin", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const {
          fullName,
          age,
          gender,
          phone,
          email,
          address,
          bloodGroup,
          medicalHistory,
          emergencyContact,
          assignedDoctorId,
          bedNumber,
          admissionDate,
        } = req.body ?? {};

        if (!fullName || !email) {
          res.status(400).json({ error: "Full name and email are required" });
          return;
        }

        const tempPassword = generateSecurePassword();
        const passwordHash = await hashPassword(tempPassword);
        const patientPublicId = await generatePatientPublicId();
        const username = await generateUsername("ICU");
        const openId = generateOpenId();

        const userId = await db.createCredentialUser({
          openId,
          username,
          passwordHash,
          name: fullName,
          email,
          phone: phone ?? null,
          role: "patient",
          loginMethod: "credentials",
        });

        const patientId = await db.createPatientRecord({
          userId,
          patientPublicId,
          assignedDoctorId: assignedDoctorId ? Number(assignedDoctorId) : null,
          bedNumber: bedNumber ?? null,
          age: age ? Number(age) : null,
          gender: gender ?? null,
          phone: phone ?? null,
          address: address ?? null,
          bloodGroup: bloodGroup ?? null,
          medicalHistory: medicalHistory ?? null,
          emergencyContact: emergencyContact ?? null,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          status: "admitted",
        });

        await logAudit({
          performedBy: req.authUser!.id,
          action: "CREATE_PATIENT",
          entityType: "patient",
          entityId: patientId,
          details: JSON.stringify({ patientPublicId, username }),
          ipAddress: getClientIp(req),
        });

        res.status(201).json({
          success: true,
          credentials: {
            patientId: patientPublicId,
            username,
            temporaryPassword: tempPassword,
          },
          patient: { id: patientId, patientPublicId, userId },
        });
      } catch (error) {
        console.error("[Create Patient]", error);
        res.status(500).json({ error: "Failed to create patient" });
      }
    }
  );

  // POST /api/admin/create-doctor
  app.post(
    "/api/admin/create-doctor",
    requireAuth(["super_admin", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const { doctorName, department, specialization, email, phone } = req.body ?? {};

        if (!doctorName || !email) {
          res.status(400).json({ error: "Doctor name and email are required" });
          return;
        }

        const tempPassword = generateSecurePassword();
        const passwordHash = await hashPassword(tempPassword);
        const doctorPublicId = await generateDoctorPublicId();
        const username = await generateUsername("DOC");
        const openId = generateOpenId();

        const userId = await db.createCredentialUser({
          openId,
          username,
          passwordHash,
          name: doctorName,
          email,
          phone: phone ?? null,
          role: "doctor",
          loginMethod: "credentials",
        });

        const doctorId = await db.createDoctorRecord({
          userId,
          doctorPublicId,
          department: department ?? null,
          specialization: specialization ?? null,
          phone: phone ?? null,
        });

        await logAudit({
          performedBy: req.authUser!.id,
          action: "CREATE_DOCTOR",
          entityType: "doctor",
          entityId: doctorId,
          details: JSON.stringify({ doctorPublicId, username }),
          ipAddress: getClientIp(req),
        });

        res.status(201).json({
          success: true,
          credentials: {
            doctorId: doctorPublicId,
            username,
            temporaryPassword: tempPassword,
          },
          doctor: { id: doctorId, doctorPublicId, userId },
        });
      } catch (error) {
        console.error("[Create Doctor]", error);
        res.status(500).json({ error: "Failed to create doctor" });
      }
    }
  );

  // GET /api/patients/:id
  app.get("/api/patients/:id", requireAuth(), async (req: AuthRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      const patient = await db.getPatientById(id);
      if (!patient) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }

      const user = req.authUser!;
      if (user.role === "patient" && patient.userId !== user.id) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      if (user.role === "doctor" && patient.assignedDoctorId !== user.id) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const patientUser = await db.getUserById(patient.userId);
      res.json({ patient, user: sanitizeUser(patientUser) });
    } catch (error) {
      console.error("[Get Patient]", error);
      res.status(500).json({ error: "Failed to fetch patient" });
    }
  });

  // PUT /api/patients/:id
  app.put(
    "/api/patients/:id",
    requireAuth(["super_admin", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const id = Number(req.params.id);
        const patient = await db.getPatientById(id);
        if (!patient) {
          res.status(404).json({ error: "Patient not found" });
          return;
        }

        const {
          fullName,
          age,
          gender,
          phone,
          email,
          address,
          bloodGroup,
          medicalHistory,
          emergencyContact,
          assignedDoctorId,
          bedNumber,
          admissionDate,
          status,
        } = req.body ?? {};

        await db.updatePatient(id, {
          age: age !== undefined ? Number(age) : undefined,
          gender,
          phone,
          address,
          bloodGroup,
          medicalHistory,
          emergencyContact,
          assignedDoctorId: assignedDoctorId !== undefined ? Number(assignedDoctorId) : undefined,
          bedNumber,
          admissionDate: admissionDate ? new Date(admissionDate) : undefined,
          status,
        });

        if (fullName || email || phone) {
          await db.updateUser(patient.userId, {
            name: fullName,
            email,
            phone,
          });
        }

        await logAudit({
          performedBy: req.authUser!.id,
          action: "UPDATE_PATIENT",
          entityType: "patient",
          entityId: id,
          ipAddress: getClientIp(req),
        });

        res.json({ success: true });
      } catch (error) {
        console.error("[Update Patient]", error);
        res.status(500).json({ error: "Failed to update patient" });
      }
    }
  );

  // DELETE /api/patients/:id
  app.delete(
    "/api/patients/:id",
    requireAuth(["super_admin", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const id = Number(req.params.id);
        const patient = await db.getPatientById(id);
        if (!patient) {
          res.status(404).json({ error: "Patient not found" });
          return;
        }

        await db.deletePatient(id);
        await db.deactivateUser(patient.userId);

        await logAudit({
          performedBy: req.authUser!.id,
          action: "DELETE_PATIENT",
          entityType: "patient",
          entityId: id,
          ipAddress: getClientIp(req),
        });

        res.json({ success: true });
      } catch (error) {
        console.error("[Delete Patient]", error);
        res.status(500).json({ error: "Failed to delete patient" });
      }
    }
  );

  // GET /api/admin/patients — list all patients
  app.get(
    "/api/admin/patients",
    requireAuth(["super_admin", "admin"]),
    async (_req: AuthRequest, res: Response) => {
      try {
        const patients = await db.getAllPatientsWithUsers();
        res.json({ patients });
      } catch (error) {
        console.error("[List Patients]", error);
        res.status(500).json({ error: "Failed to list patients" });
      }
    }
  );

  // GET /api/admin/doctors — list all doctors
  app.get(
    "/api/admin/doctors",
    requireAuth(["super_admin", "admin"]),
    async (_req: AuthRequest, res: Response) => {
      try {
        const doctors = await db.getAllDoctorsWithUsers();
        res.json({ doctors });
      } catch (error) {
        console.error("[List Doctors]", error);
        res.status(500).json({ error: "Failed to list doctors" });
      }
    }
  );

  // POST /api/admin/reset-password/:userId
  app.post(
    "/api/admin/reset-password/:userId",
    requireAuth(["super_admin", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = Number(req.params.userId);
        const user = await db.getUserById(userId);
        if (!user) {
          res.status(404).json({ error: "User not found" });
          return;
        }

        const tempPassword = generateSecurePassword();
        const passwordHash = await hashPassword(tempPassword);
        await db.updateUser(userId, { passwordHash });

        await logAudit({
          performedBy: req.authUser!.id,
          action: "RESET_PASSWORD",
          entityType: "user",
          entityId: userId,
          ipAddress: getClientIp(req),
        });

        res.json({ success: true, temporaryPassword: tempPassword, username: user.username });
      } catch (error) {
        console.error("[Reset Password]", error);
        res.status(500).json({ error: "Failed to reset password" });
      }
    }
  );

  // PATCH /api/admin/users/:userId/status
  app.patch(
    "/api/admin/users/:userId/status",
    requireAuth(["super_admin", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = Number(req.params.userId);
        const { isActive } = req.body ?? {};
        await db.updateUser(userId, { isActive: Boolean(isActive) });

        await logAudit({
          performedBy: req.authUser!.id,
          action: isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
          entityType: "user",
          entityId: userId,
          ipAddress: getClientIp(req),
        });

        res.json({ success: true });
      } catch (error) {
        console.error("[Toggle User Status]", error);
        res.status(500).json({ error: "Failed to update user status" });
      }
    }
  );

  // GET /api/admin/audit-logs
  app.get(
    "/api/admin/audit-logs",
    requireAuth(["super_admin", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const limit = Number(req.query.limit) || 100;
        const logs = await db.getAuditLogs(limit);
        res.json({ logs });
      } catch (error) {
        console.error("[Audit Logs]", error);
        res.status(500).json({ error: "Failed to fetch audit logs" });
      }
    }
  );

  // DELETE /api/admin/users/:userId
  app.delete(
    "/api/admin/users/:userId",
    requireAuth(["super_admin", "admin"]),
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = Number(req.params.userId);
        if (userId === req.authUser!.id) {
          res.status(400).json({ error: "Cannot delete your own account" });
          return;
        }

        await db.deleteUser(userId);

        await logAudit({
          performedBy: req.authUser!.id,
          action: "DELETE_USER",
          entityType: "user",
          entityId: userId,
          ipAddress: getClientIp(req),
        });

        res.json({ success: true });
      } catch (error) {
        console.error("[Delete User]", error);
        res.status(500).json({ error: "Failed to delete user" });
      }
    }
  );
}
