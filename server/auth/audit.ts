import * as db from "../db";
import type { InsertAuditLog } from "../../drizzle/schema";

export async function logAudit(entry: InsertAuditLog): Promise<void> {
  try {
    await db.createAuditLog(entry);
  } catch (error) {
    console.error("[Audit] Failed to write log:", error);
  }
}
