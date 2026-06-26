import { useEffect, useRef, useCallback } from "react";
import type { CallSocketEvent } from "../../../shared/calls";
import { DEMO_ADMIN_TOKEN, demoPatientToken } from "../../../shared/calls";

function getWebSocketUrl(token: string): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/calls?token=${encodeURIComponent(token)}`;
}

export function useCallSocket(
  token: string | null,
  onEvent: (event: CallSocketEvent) => void
) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (!token) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(getWebSocketUrl(token));
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as CallSocketEvent;
        onEventRef.current(data);
      } catch {
        console.warn("[CallSocket] Failed to parse message");
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (token) {
        reconnectTimer.current = window.setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return { connected: wsRef.current?.readyState === WebSocket.OPEN };
}

export function getCallSocketToken(
  isPatient: boolean,
  patientId: string | undefined,
  isAdmin: boolean
): string | null {
  if (isPatient && patientId) {
    return demoPatientToken(patientId);
  }
  if (isAdmin) {
    return DEMO_ADMIN_TOKEN;
  }
  return null;
}
