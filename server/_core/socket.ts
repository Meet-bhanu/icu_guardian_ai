import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { nanoid } from "nanoid";
import type { CallPayload, CallSocketEvent } from "../../shared/calls";
import { parseDemoToken } from "../../shared/calls";

type ClientInfo = { role: "admin" } | { role: "patient"; patientId: string };

const adminSockets = new Set<WebSocket>();
const patientSockets = new Map<string, Set<WebSocket>>();
const socketClients = new WeakMap<WebSocket, ClientInfo>();
const activeCalls = new Map<string, CallPayload>();

function send(ws: WebSocket, event: CallSocketEvent) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

function broadcastToAdmins(event: CallSocketEvent) {
  for (const ws of Array.from(adminSockets)) {
    send(ws, event);
  }
}

function broadcastToPatient(patientId: string, event: CallSocketEvent) {
  const normalizedId = patientId.toUpperCase();
  const sockets = patientSockets.get(normalizedId);
  if (!sockets) return;
  for (const ws of Array.from(sockets)) {
    send(ws, event);
  }
}

function sendPendingCallsToAdmin(ws: WebSocket) {
  const pending = Array.from(activeCalls.values()).filter(c => c.status === "calling");
  if (pending.length > 0) {
    send(ws, { type: "pending-calls", calls: pending });
  }
}

function registerSocket(ws: WebSocket, client: ClientInfo) {
  socketClients.set(ws, client);

  if (client.role === "admin") {
    adminSockets.add(ws);
    sendPendingCallsToAdmin(ws);
  } else {
    const id = client.patientId.toUpperCase();
    if (!patientSockets.has(id)) {
      patientSockets.set(id, new Set());
    }
    patientSockets.get(id)!.add(ws);

    const existing = activeCalls.get(id);
    if (existing && existing.status !== "ended") {
      send(ws, { type: "call-updated", call: existing });
    }
  }
}

function unregisterSocket(ws: WebSocket) {
  const client = socketClients.get(ws);
  if (!client) return;

  if (client.role === "admin") {
    adminSockets.delete(ws);
  } else {
    const id = client.patientId.toUpperCase();
    const sockets = patientSockets.get(id);
    if (sockets) {
      sockets.delete(ws);
      if (sockets.size === 0) {
        patientSockets.delete(id);
      }
    }
  }

  socketClients.delete(ws);
}

function createCallPayload(
  patientId: string,
  patientName: string,
  caller: "admin" | "patient",
  status: CallPayload["status"] = "calling"
): CallPayload {
  return {
    callId: nanoid(),
    patientId: patientId.toUpperCase(),
    patientName,
    status,
    caller,
    adminMuted: false,
    patientMuted: false,
    adminVideoMuted: false,
    patientVideoMuted: false,
    timestamp: Date.now(),
  };
}

export function initiatePatientCall(patientId: string, patientName: string): CallPayload {
  const normalizedId = patientId.toUpperCase();
  const existing = activeCalls.get(normalizedId);
  if (existing && existing.status === "calling") {
    return existing;
  }

  const call = createCallPayload(normalizedId, patientName, "patient", "calling");
  activeCalls.set(normalizedId, call);
  broadcastToAdmins({ type: "call-request", call });
  broadcastToPatient(normalizedId, { type: "call-updated", call });
  return call;
}

export function initiateAdminCall(patientId: string, patientName: string): CallPayload {
  const normalizedId = patientId.toUpperCase();
  const existing = activeCalls.get(normalizedId);
  if (existing && existing.status === "calling") {
    return existing;
  }

  const call = createCallPayload(normalizedId, patientName, "admin", "calling");
  activeCalls.set(normalizedId, call);
  broadcastToPatient(normalizedId, { type: "call-request", call });
  broadcastToAdmins({ type: "call-updated", call });
  return call;
}

export function acceptCall(patientId: string): CallPayload | null {
  const normalizedId = patientId.toUpperCase();
  const call = activeCalls.get(normalizedId);
  if (!call || call.status !== "calling") return null;

  const updated: CallPayload = { ...call, status: "connected", timestamp: Date.now() };
  activeCalls.set(normalizedId, updated);
  broadcastToAdmins({ type: "call-accepted", call: updated });
  broadcastToPatient(normalizedId, { type: "call-accepted", call: updated });
  return updated;
}

export function declineCall(patientId: string): CallPayload | null {
  const normalizedId = patientId.toUpperCase();
  const call = activeCalls.get(normalizedId);
  if (!call || call.status !== "calling") return null;

  const updated: CallPayload = { ...call, status: "ended", timestamp: Date.now() };
  activeCalls.set(normalizedId, updated);
  broadcastToAdmins({ type: "call-declined", call: updated });
  broadcastToPatient(normalizedId, { type: "call-declined", call: updated });

  setTimeout(() => activeCalls.delete(normalizedId), 2000);
  return updated;
}

export function endCall(patientId: string): CallPayload | null {
  const normalizedId = patientId.toUpperCase();
  const call = activeCalls.get(normalizedId);
  if (!call || call.status === "ended") return null;

  const updated: CallPayload = { ...call, status: "ended", timestamp: Date.now() };
  activeCalls.set(normalizedId, updated);
  broadcastToAdmins({ type: "call-ended", call: updated });
  broadcastToPatient(normalizedId, { type: "call-ended", call: updated });

  setTimeout(() => activeCalls.delete(normalizedId), 2000);
  return updated;
}

export function getActiveCall(patientId: string): CallPayload | undefined {
  return activeCalls.get(patientId.toUpperCase());
}

/** Initialise WS server – called from `index.ts` */
export function initWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/calls" });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host ?? "localhost"}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(4401, "Unauthenticated");
      return;
    }

    const parsed = parseDemoToken(token);
    if (!parsed) {
      ws.close(4401, "Unauthenticated");
      return;
    }

    registerSocket(ws, parsed);

    ws.on("close", () => unregisterSocket(ws));
    ws.on("error", () => unregisterSocket(ws));
  });

  console.log("[WebSocket] Call signaling server ready at /ws/calls");
}
