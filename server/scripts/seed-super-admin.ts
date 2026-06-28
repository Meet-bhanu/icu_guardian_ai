import "dotenv/config";
import { hashPassword } from "../auth/password";
import { generateOpenId } from "../auth/utils";
import * as db from "../db";

async function seedSuperAdmin() {
  const username = process.env.SUPER_ADMIN_USERNAME ?? "superadmin";
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "SuperAdmin@2026";
  const name = process.env.SUPER_ADMIN_NAME ?? "Super Admin";
  const email = process.env.SUPER_ADMIN_EMAIL ?? "admin@healthhalo.com";

  const existing = await db.getUserByUsername(username);
  if (existing) {
    console.log(`Super admin "${username}" already exists (id: ${existing.id})`);
    return;
  }

  const database = await db.getDb();
  if (!database) {
    console.error("DATABASE_URL is not configured. Set it in .env and run migrations first.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const userId = await db.createCredentialUser({
    openId: generateOpenId(),
    username,
    passwordHash,
    name,
    email,
    role: "super_admin",
    loginMethod: "credentials",
  });

  console.log("Super Admin created successfully!");
  console.log(`  User ID:  ${userId}`);
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);
  console.log("  ⚠ Change the password after first login.");
}

seedSuperAdmin().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
