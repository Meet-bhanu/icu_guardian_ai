import { parse as parseCookieHeader } from "cookie";
import type { Request, Response, NextFunction } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { verifyAuthToken } from "./jwt";
import { getDevUserById } from "./devUsers";
import { ICU_AUTH_COOKIE } from "@shared/const";

export type AuthRequest = Request & { authUser?: User };

function parseCookies(req: Request): Map<string, string> {
  const parsed = parseCookieHeader(req.headers.cookie ?? "");
  return new Map(Object.entries(parsed));
}

export async function authenticateFromCookie(req: Request): Promise<User | null> {
  const cookies = parseCookies(req);
  const token = cookies.get(ICU_AUTH_COOKIE);
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload) return null;

  let user = await db.getUserById(payload.userId);
  if (!user) {
    user = getDevUserById(payload.userId) ?? undefined;
  }
  if (!user || !user.isActive) return null;

  return user;
}

export function requireAuth(allowedRoles?: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await authenticateFromCookie(req);
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      req.authUser = user;
      next();
    } catch (error) {
      console.error("[Auth Middleware]", error);
      res.status(500).json({ error: "Authentication error" });
    }
  };
}

export function isSuperAdmin(role: string): boolean {
  return role === "super_admin" || role === "admin";
}

export function canAccessPatient(user: User, patientUserId: number): boolean {
  if (isSuperAdmin(user.role)) return true;
  if (user.role === "patient" && user.id === patientUserId) return true;
  return false;
}
