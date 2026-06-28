export const COOKIE_NAME = "app_session_id";
export const ICU_AUTH_COOKIE = "icu_auth_session";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const SESSION_MS = 1000 * 60 * 60 * 24; // 24 hours
export const REMEMBER_ME_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

export type AuthRole = "super_admin" | "admin" | "doctor" | "patient";

export const ROLE_DASHBOARD: Record<AuthRole, string> = {
  super_admin: "/dashboard",
  admin: "/dashboard",
  doctor: "/doctor/dashboard",
  patient: "/patient/dashboard",
};
