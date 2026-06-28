import { ROLE_DASHBOARD, type AuthRole } from "@shared/const";

export type SafeUser = {
  id: number;
  openId: string;
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  loginMethod: string | null;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
  patient?: Record<string, unknown>;
  doctor?: Record<string, unknown>;
};

export type LoginCredentials = {
  username: string;
  password: string;
  role: "admin" | "doctor" | "patient";
  rememberMe?: boolean;
};

export type CreatedCredentials = {
  patientId?: string;
  doctorId?: string;
  username: string;
  temporaryPassword: string;
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });
  } catch {
    throw new Error("Cannot reach server. Run: npm run dev");
  }

  let data: Record<string, unknown> = {};
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(res.ok ? "Invalid server response" : `Request failed (${res.status})`);
    }
  }

  if (!res.ok) {
    throw new Error((data.error as string) ?? `Request failed (${res.status})`);
  }

  return data as T;
}

export async function loginApi(credentials: LoginCredentials): Promise<{ user: SafeUser }> {
  return apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function logoutApi(): Promise<void> {
  await apiFetch("/api/logout", { method: "POST" });
}

export async function getMeApi(): Promise<{ user: SafeUser }> {
  return apiFetch("/api/me");
}

export async function createPatientApi(data: Record<string, unknown>): Promise<{
  credentials: CreatedCredentials;
}> {
  return apiFetch("/api/admin/create-patient", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createDoctorApi(data: Record<string, unknown>): Promise<{
  credentials: CreatedCredentials;
}> {
  return apiFetch("/api/admin/create-doctor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listPatientsApi(): Promise<{ patients: unknown[] }> {
  return apiFetch("/api/admin/patients");
}

export async function listDoctorsApi(): Promise<{ doctors: unknown[] }> {
  return apiFetch("/api/admin/doctors");
}

export async function resetPasswordApi(userId: number): Promise<CreatedCredentials> {
  return apiFetch(`/api/admin/reset-password/${userId}`, { method: "POST" });
}

export async function toggleUserStatusApi(userId: number, isActive: boolean): Promise<void> {
  await apiFetch(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function deleteUserApi(userId: number): Promise<void> {
  await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
}

export async function updatePatientApi(id: number, data: Record<string, unknown>): Promise<void> {
  await apiFetch(`/api/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getAuditLogsApi(): Promise<{ logs: unknown[] }> {
  return apiFetch("/api/admin/audit-logs");
}

export function getDashboardForRole(role: string): string {
  if (role === "admin") return ROLE_DASHBOARD.super_admin;
  if (role === "doctor") return ROLE_DASHBOARD.doctor;
  if (role === "patient") return ROLE_DASHBOARD.patient;
  return "/login";
}

export function isAdminRole(role: string | undefined): boolean {
  return role === "admin";
}

export function canAccessRoute(role: string | undefined, path: string): boolean {
  if (!role) return false;
  if (isAdminRole(role)) return true;

  if (path.startsWith("/dashboard")) return false;
  if (path.startsWith("/doctor")) return role === "doctor";
  if (path.startsWith("/patient")) return role === "patient";

  return true;
}
