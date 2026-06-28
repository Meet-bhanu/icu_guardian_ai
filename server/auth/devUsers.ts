import type { User } from "../../drizzle/schema";

/** Active when DATABASE_URL is not set — allows local login without MySQL */
export const DEV_MODE = !process.env.DATABASE_URL;

type DevAccount = {
  id: number;
  openId: string;
  username: string;
  password: string;
  role: "super_admin" | "doctor" | "patient";
  name: string;
  email: string;
};

const DEV_ACCOUNTS: DevAccount[] = [
  {
    id: 1,
    openId: "dev_super_admin",
    username: "superadmin",
    password: "SuperAdmin@2026",
    role: "super_admin",
    name: "Super Admin",
    email: "admin@healthhalo.com",
  },
  {
    id: 2,
    openId: "dev_doctor",
    username: "doc0001",
    password: "Doctor@2026",
    role: "doctor",
    name: "Dr. Sarah Chen",
    email: "doctor@healthhalo.com",
  },
  {
    id: 3,
    openId: "dev_patient",
    username: "icu0001",
    password: "Patient@2026",
    role: "patient",
    name: "John Smith",
    email: "patient@healthhalo.com",
  },
];

const now = new Date();

function toUser(account: DevAccount): User {
  return {
    id: account.id,
    openId: account.openId,
    username: account.username,
    passwordHash: null,
    name: account.name,
    email: account.email,
    phone: null,
    loginMethod: "dev",
    role: account.role,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

export function findDevUser(
  username: string,
  password: string,
  expectedRole: string
): User | null {
  if (!DEV_MODE) return null;

  const account = DEV_ACCOUNTS.find(
    (a) =>
      a.username.toLowerCase() === username.trim().toLowerCase() &&
      a.password === password &&
      (a.role === expectedRole ||
        (expectedRole === "super_admin" && a.role === "super_admin"))
  );

  return account ? toUser(account) : null;
}

export function getDevUserById(id: number): User | null {
  if (!DEV_MODE) return null;
  const account = DEV_ACCOUNTS.find((a) => a.id === id);
  return account ? toUser(account) : null;
}

export function listDevCredentials() {
  return DEV_ACCOUNTS.map(({ username, password, role, name }) => ({
    role,
    name,
    username,
    password,
  }));
}
