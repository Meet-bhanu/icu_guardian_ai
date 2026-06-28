import "dotenv/config";
import { hashPassword } from "../auth/password";
import { generateOpenId } from "../auth/utils";
import * as db from "../db";

type SeedUser = {
  username: string;
  password: string;
  name: string;
  email: string;
  role: "super_admin" | "doctor" | "patient";
};

const DEMO_USERS: SeedUser[] = [
  {
    username: process.env.SUPER_ADMIN_USERNAME ?? "superadmin",
    password: process.env.SUPER_ADMIN_PASSWORD ?? "SuperAdmin@2026",
    name: process.env.SUPER_ADMIN_NAME ?? "Super Admin",
    email: process.env.SUPER_ADMIN_EMAIL ?? "admin@healthhalo.com",
    role: "super_admin",
  },
  {
    username: "doc0001",
    password: "Doctor@2026",
    name: "Dr. Sarah Chen",
    email: "doctor@healthhalo.com",
    role: "doctor",
  },
  {
    username: "icu0001",
    password: "Patient@2026",
    name: "John Smith",
    email: "patient@healthhalo.com",
    role: "patient",
  },
];

async function ensureUser(account: SeedUser): Promise<number> {
  const existing = await db.getUserByUsername(account.username);
  if (existing) {
    console.log(`  ✓ ${account.role} "${account.username}" already exists (id: ${existing.id})`);
    return existing.id;
  }

  const passwordHash = await hashPassword(account.password);
  const userId = await db.createCredentialUser({
    openId: generateOpenId(),
    username: account.username,
    passwordHash,
    name: account.name,
    email: account.email,
    role: account.role,
    loginMethod: "credentials",
  });

  console.log(`  ✓ Created ${account.role}: ${account.username} / ${account.password} (id: ${userId})`);
  return userId;
}

async function seedDemoUsers() {
  const database = await db.getDb();
  if (!database) {
    console.error("DATABASE_URL is not configured. Set it in .env and run: npm run db:setup");
    process.exit(1);
  }

  console.log("Seeding demo users...\n");

  const adminId = await ensureUser(DEMO_USERS[0]);
  const doctorUserId = await ensureUser(DEMO_USERS[1]);
  const patientUserId = await ensureUser(DEMO_USERS[2]);

  const existingDoctor = await db.getDoctorByUserId(doctorUserId);
  if (!existingDoctor) {
    await db.createDoctorRecord({
      userId: doctorUserId,
      doctorPublicId: "DOC-2026-0001",
      department: "Intensive Care",
      specialization: "Critical Care Medicine",
      phone: "+1-555-0100",
    });
    console.log("  ✓ Created doctor profile DOC-2026-0001");
  } else {
    console.log(`  ✓ Doctor profile exists (${existingDoctor.doctorPublicId})`);
  }

  const existingPatient = await db.getPatientByUserId(patientUserId);
  if (!existingPatient) {
    await db.createPatientRecord({
      userId: patientUserId,
      patientPublicId: "ICU-2026-0001",
      assignedDoctorId: doctorUserId,
      bedNumber: "ICU-01",
      age: 45,
      gender: "Male",
      phone: "+1-555-0200",
      address: "123 Health Street",
      bloodGroup: "O+",
      medicalHistory: "Post-operative cardiac monitoring",
      emergencyContact: "Jane Smith — +1-555-0201",
      admissionDate: new Date(),
      status: "monitoring",
    });
    console.log("  ✓ Created patient profile ICU-2026-0001");
  } else {
    console.log(`  ✓ Patient profile exists (${existingPatient.patientPublicId})`);
  }

  console.log("\n══════════════════════════════════════════");
  console.log("  LOGIN CREDENTIALS");
  console.log("══════════════════════════════════════════");
  console.log("  Super Admin → Role: Super Admin");
  console.log("    Username: superadmin");
  console.log("    Password: SuperAdmin@2026");
  console.log("    Dashboard: /dashboard");
  console.log("");
  console.log("  Doctor → Role: Doctor");
  console.log("    Username: doc0001");
  console.log("    Password: Doctor@2026");
  console.log("    Dashboard: /doctor/dashboard");
  console.log("");
  console.log("  Patient → Role: Patient");
  console.log("    Username: icu0001");
  console.log("    Password: Patient@2026");
  console.log("    Dashboard: /patient/dashboard");
  console.log("══════════════════════════════════════════\n");
}

seedDemoUsers().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
