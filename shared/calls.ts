export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended";

export interface CallPayload {
  callId: string;
  patientId: string;
  patientName: string;
  status: CallStatus;
  caller: "admin" | "patient";
  adminMuted: boolean;
  patientMuted: boolean;
  adminVideoMuted: boolean;
  patientVideoMuted: boolean;
  timestamp: number;
}

export type CallSocketEvent =
  | { type: "call-request"; call: CallPayload }
  | { type: "call-accepted"; call: CallPayload }
  | { type: "call-declined"; call: CallPayload }
  | { type: "call-ended"; call: CallPayload }
  | { type: "call-updated"; call: CallPayload }
  | { type: "pending-calls"; calls: CallPayload[] };

export const DEMO_ADMIN_TOKEN = "demo-admin";

export function demoPatientToken(patientId: string): string {
  return `demo-patient-${patientId.toUpperCase()}`;
}

export function parseDemoToken(token: string): { role: "admin" } | { role: "patient"; patientId: string } | null {
  if (token === DEMO_ADMIN_TOKEN) {
    return { role: "admin" };
  }
  const match = /^demo-patient-([A-Za-z0-9]+)$/.exec(token);
  if (match) {
    return { role: "patient", patientId: match[1].toUpperCase() };
  }
  return null;
}
