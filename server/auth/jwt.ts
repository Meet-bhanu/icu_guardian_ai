import { SignJWT, jwtVerify } from "jose";
import { ENV } from "../_core/env";
import { REMEMBER_ME_MS, SESSION_MS } from "@shared/const";

export type IcuAuthPayload = {
  userId: number;
  role: string;
  username: string;
  type: "icu_auth";
};

function getSecret() {
  const secret = ENV.cookieSecret || "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(
  payload: Omit<IcuAuthPayload, "type">,
  rememberMe = false
): Promise<string> {
  const expiresInMs = rememberMe ? REMEMBER_ME_MS : SESSION_MS;
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

  return new SignJWT({ ...payload, type: "icu_auth" as const })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(getSecret());
}

export async function verifyAuthToken(token: string): Promise<IcuAuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const { userId, role, username, type } = payload as Record<string, unknown>;

    if (type !== "icu_auth" || typeof userId !== "number" || typeof role !== "string" || typeof username !== "string") {
      return null;
    }

    return { userId, role, username, type: "icu_auth" };
  } catch {
    return null;
  }
}
