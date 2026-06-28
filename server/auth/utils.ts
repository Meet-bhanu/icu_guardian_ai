import { nanoid } from "nanoid";
import * as db from "../db";

const YEAR = new Date().getFullYear();

export async function generatePatientPublicId(): Promise<string> {
  const count = await db.getPatientCount();
  const seq = String(count + 1).padStart(4, "0");
  return `ICU-${YEAR}-${seq}`;
}

export async function generateDoctorPublicId(): Promise<string> {
  const count = await db.getDoctorCount();
  const seq = String(count + 1).padStart(4, "0");
  return `DOC-${YEAR}-${seq}`;
}

export async function generateUsername(prefix: "ICU" | "DOC"): Promise<string> {
  if (prefix === "ICU") {
    const count = await db.getPatientCount();
    return `${prefix}${String(count + 1).padStart(4, "0")}`;
  }
  const count = await db.getDoctorCount();
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export function generateOpenId(): string {
  return `cred_${nanoid(24)}`;
}

export function getClientIp(req: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded[0]) return forwarded[0].split(",")[0].trim();
  return req.ip ?? "unknown";
}
