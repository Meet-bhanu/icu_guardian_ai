import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useCallSocket } from "@/hooks/useCallSocket";
import { getCallSocketToken } from "@/hooks/useCallSocket";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import type { CallSocketEvent } from "../../../shared/calls";

interface CameraStreamContextProps {
  isBroadcasting: boolean;
  isViewing: boolean;
  remoteStream: MediaStream | null;
  startBroadcast: (stream: MediaStream, patientId: string) => void;
  stopBroadcast: () => void;
  startViewing: (patientId: string) => void;
  stopViewing: () => void;
}

const CameraStreamContext = createContext<CameraStreamContextProps | null>(null);

export function CameraStreamProvider({ children }: { children: React.ReactNode }) {
  const { isPatient, session } = usePatientAuth();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const currentPatientIdRef = useRef<string | null>(null);
  const isAdmin = typeof window !== "undefined" && sessionStorage.getItem("icu-admin-logged-in") === "true";

  const socketToken = getCallSocketToken(isPatient, session?.patientId, isAdmin);

  const handleSocketEvent = useCallback((event: CallSocketEvent) => {
    switch (event.type) {
      case "camera-offer":
        if (isAdmin && peerConnectionRef.current) {
          peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(event.offer))
            .then(() => peerConnectionRef.current?.createAnswer())
            .then(answer => peerConnectionRef.current?.setLocalDescription(answer))
            .then(() => {
              if (peerConnectionRef.current?.localDescription) {
                sendSocketMessage({
                  type: "camera-answer",
                  patientId: event.patientId,
                  answer: peerConnectionRef.current.localDescription,
                  socketId: "admin",
                });
              }
            })
            .catch(err => console.error("[CameraStream] Error handling offer:", err));
        }
        break;

      case "camera-answer":
        if (isPatient && peerConnectionRef.current) {
          peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(event.answer))
            .catch(err => console.error("[CameraStream] Error handling answer:", err));
        }
        break;

      case "camera-ice-candidate":
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(event.candidate))
            .catch(err => console.error("[CameraStream] Error adding ICE candidate:", err));
        }
        break;

      case "camera-stream-started":
        if (isAdmin) {
          console.log("[CameraStream] Camera stream started for patient:", event.patientId);
        }
        break;

      case "camera-stream-stopped":
        if (isAdmin) {
          console.log("[CameraStream] Camera stream stopped for patient:", event.patientId);
          stopViewing();
        }
        break;
    }
  }, [isAdmin, isPatient]);

  useCallSocket(socketToken, handleSocketEvent);

  const sendSocketMessage = useCallback((message: CallSocketEvent) => {
    const ws = (window as any).callSocket;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        // Free TURN servers for cross-network connectivity
        { 
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject"
        },
        { 
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject"
        },
      ],
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate && currentPatientIdRef.current) {
        sendSocketMessage({
          type: "camera-ice-candidate",
          patientId: currentPatientIdRef.current,
          candidate: event.candidate,
          socketId: isPatient ? "patient" : "admin",
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[CameraStream] Connection state:", pc.connectionState);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        if (isPatient) {
          stopBroadcast();
        } else {
          stopViewing();
        }
      }
    };

    return pc;
  }, [isPatient, sendSocketMessage]);

  const startBroadcast = useCallback((stream: MediaStream, patientId: string) => {
    if (isBroadcasting) return;

    const pc = createPeerConnection();
    peerConnectionRef.current = pc;
    localStreamRef.current = stream;
    currentPatientIdRef.current = patientId;

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        if (pc.localDescription) {
          sendSocketMessage({
            type: "camera-offer",
            patientId,
            offer: pc.localDescription,
            socketId: "patient",
          });
          sendSocketMessage({
            type: "camera-stream-started",
            patientId,
          });
        }
      })
      .then(() => setIsBroadcasting(true))
      .catch(err => {
        console.error("[CameraStream] Error starting broadcast:", err);
        stopBroadcast();
      });
  }, [isBroadcasting, createPeerConnection, sendSocketMessage]);

  const stopBroadcast = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (currentPatientIdRef.current) {
      sendSocketMessage({
        type: "camera-stream-stopped",
        patientId: currentPatientIdRef.current,
      });
    }

    currentPatientIdRef.current = null;
    setIsBroadcasting(false);
  }, [sendSocketMessage]);

  const startViewing = useCallback((patientId: string) => {
    if (isViewing) return;

    const pc = createPeerConnection();
    peerConnectionRef.current = pc;
    currentPatientIdRef.current = patientId;
    setIsViewing(true);
  }, [isViewing, createPeerConnection]);

  const stopViewing = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setRemoteStream(null);
    currentPatientIdRef.current = null;
    setIsViewing(false);
  }, []);

  useEffect(() => {
    return () => {
      stopBroadcast();
      stopViewing();
    };
  }, [stopBroadcast, stopViewing]);

  return (
    <CameraStreamContext.Provider
      value={{
        isBroadcasting,
        isViewing,
        remoteStream,
        startBroadcast,
        stopBroadcast,
        startViewing,
        stopViewing,
      }}
    >
      {children}
    </CameraStreamContext.Provider>
  );
}

export function useCameraStream() {
  const ctx = useContext(CameraStreamContext);
  if (!ctx) {
    throw new Error("useCameraStream must be used within CameraStreamProvider");
  }
  return ctx;
}
