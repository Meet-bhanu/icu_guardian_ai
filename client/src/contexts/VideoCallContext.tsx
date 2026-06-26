import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { getPatientById } from "@/lib/patientData";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { trpc } from "@/lib/trpc";
import { getCallSocketToken, useCallSocket } from "@/hooks/useCallSocket";
import type { CallPayload, CallSocketEvent } from "../../../shared/calls";

export type CallState = CallPayload;

interface VideoCallContextProps {
  call: CallState | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoMuted: boolean;
  isIncoming: boolean;
  isOutgoing: boolean;
  isConnected: boolean;
  micVolume: number;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  startCall: (patientId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideoMute: () => void;
}

const VideoCallContext = createContext<VideoCallContextProps | null>(null);

// Audio synthesizer for call sounds using Web Audio API
class CallSoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private intervalId: number | null = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playRingback() {
    this.stop();
    this.init();
    if (!this.audioCtx) return;

    const playBeep = () => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.type = "sine";

      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime + 1.2);
      gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 1.4);
    };

    playBeep();
    this.intervalId = window.setInterval(playBeep, 3000);
  }

  playRingtone() {
    this.stop();
    this.init();
    if (!this.audioCtx) return;

    const playRing = () => {
      if (!this.audioCtx) return;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.frequency.setValueAtTime(853, this.audioCtx.currentTime);
      osc2.frequency.setValueAtTime(960, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, this.audioCtx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0.15, this.audioCtx.currentTime + 0.8);
      gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.audioCtx.currentTime + 1.1);
      osc2.stop(this.audioCtx.currentTime + 1.1);
    };

    playRing();
    this.intervalId = window.setInterval(playRing, 2000);
  }

  playConnect() {
    this.stop();
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.audioCtx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.5);
  }

  playDisconnect() {
    this.stop();
    this.init();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.55);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

const sounds = new CallSoundSynthesizer();

function applySocketEvent(
  event: CallSocketEvent,
  setCall: React.Dispatch<React.SetStateAction<CallState | null>>,
  isPatient: boolean,
  isAdmin: boolean,
  patientId: string | undefined
) {
  switch (event.type) {
    case "call-request":
      setCall(event.call);
      break;
    case "call-accepted":
    case "call-declined":
    case "call-ended":
    case "call-updated":
      setCall(event.call.status === "ended" ? event.call : event.call);
      break;
    case "pending-calls": {
      const incoming = event.calls.find(
        c => c.status === "calling" && c.caller === "patient"
      );
      if (incoming && isAdmin) {
        setCall(incoming);
      }
      break;
    }
  }

  if (event.type === "call-request" && isAdmin && event.call.caller === "patient") {
    toast.info(`Incoming call from ${event.call.patientName}`);
  }
}

export function VideoCallProvider({ children }: { children: React.ReactNode }) {
  const { isPatient, session } = usePatientAuth();
  const [location] = useLocation();
  const [isAdmin, setIsAdmin] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("icu-admin-logged-in") === "true"
  );
  const [call, setCall] = useState<CallState | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(0);

  const initiateMutation = trpc.calls.initiate.useMutation();
  const acceptMutation = trpc.calls.accept.useMutation();
  const declineMutation = trpc.calls.decline.useMutation();
  const endMutation = trpc.calls.end.useMutation();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const checkAdmin = () => {
      setIsAdmin(sessionStorage.getItem("icu-admin-logged-in") === "true");
    };
    checkAdmin();
    window.addEventListener("focus", checkAdmin);
    return () => window.removeEventListener("focus", checkAdmin);
  }, [location]);

  const socketToken = getCallSocketToken(isPatient, session?.patientId, isAdmin);

  const handleSocketEvent = useCallback(
    (event: CallSocketEvent) => {
      applySocketEvent(event, setCall, isPatient, isAdmin, session?.patientId);
    },
    [isPatient, isAdmin, session?.patientId]
  );

  useCallSocket(socketToken, handleSocketEvent);

  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setMicVolume(0);
  }, [localStream]);

  const stopRemoteStream = useCallback(() => {
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }
  }, [remoteStream]);

  const startLocalStream = useCallback(async (videoEnabled = true, audioEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } : false,
        audio: audioEnabled,
      });

      setLocalStream(stream);

      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoMuted;
      });

      if (audioEnabled) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          audioCtxRef.current = audioCtx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setMicVolume(Math.min(100, Math.round((average / 255) * 100 * 2.5)));

            animationFrameIdRef.current = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        } catch (e) {
          console.warn("Failed to initialize audio analyser context:", e);
        }
      }

      return stream;
    } catch (err) {
      console.warn("Failed to capture local media stream, using fallback:", err);
      return null;
    }
  }, [isMuted, isVideoMuted]);

  useEffect(() => {
    if (!call) {
      sounds.stop();
      stopLocalStream();
      stopRemoteStream();
      return;
    }

    const currentPatientId = isPatient ? session?.patientId?.toUpperCase() : null;

    if (call.status === "calling") {
      if (call.caller === "admin" && isAdmin) {
        sounds.playRingback();
        startLocalStream();
      } else if (call.caller === "admin" && isPatient && call.patientId === currentPatientId) {
        sounds.playRingtone();
      } else if (call.caller === "patient" && isPatient && call.patientId === currentPatientId) {
        sounds.playRingback();
        startLocalStream();
      } else if (call.caller === "patient" && isAdmin) {
        sounds.playRingtone();
      }
    } else if (call.status === "connected") {
      sounds.stop();
      if (!localStream) {
        sounds.playConnect();
        startLocalStream();
      }

      if (!remoteStream) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => setRemoteStream(stream))
          .catch(() => {});
      }
    } else if (call.status === "ended") {
      sounds.playDisconnect();
      const id = setTimeout(() => {
        setCall(null);
      }, 1000);
      return () => clearTimeout(id);
    }
  }, [call, isPatient, isAdmin, session?.patientId, startLocalStream, stopLocalStream, stopRemoteStream, localStream, remoteStream]);

  const startCall = async (patientId: string) => {
    if (call) return;

    const patient = getPatientById(patientId);
    const patientName = patient?.name ?? "Patient";
    const caller = isPatient ? "patient" as const : "admin" as const;

    try {
      const result = await initiateMutation.mutateAsync({
        patientId,
        patientName,
        caller,
      });
      setCall(result.call);
      toast.info(`Calling ${patientName}...`);
    } catch {
      toast.error("Failed to start call. Please try again.");
    }
  };

  const acceptCall = async () => {
    if (!call) return;

    try {
      const result = await acceptMutation.mutateAsync({ patientId: call.patientId });
      setCall(result.call);
      sounds.playConnect();
      toast.success("Call connected");
    } catch {
      toast.error("Failed to accept call");
    }
  };

  const declineCall = () => {
    if (!call) return;

    declineMutation.mutate(
      { patientId: call.patientId },
      {
        onSuccess: (result) => {
          setCall(result.call);
          toast.error("Call declined");
        },
      }
    );
  };

  const endCall = () => {
    if (!call) return;

    endMutation.mutate(
      { patientId: call.patientId },
      {
        onSuccess: (result) => {
          setCall(result.call);
          stopLocalStream();
          stopRemoteStream();
          toast.info("Call ended");
        },
      }
    );
  };

  const toggleMute = () => {
    if (!call) return;

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !nextMuted;
      });
    }

    setCall({
      ...call,
      adminMuted: !isPatient ? nextMuted : call.adminMuted,
      patientMuted: isPatient ? nextMuted : call.patientMuted,
    });
  };

  const toggleVideoMute = () => {
    if (!call) return;

    const nextVideoMuted = !isVideoMuted;
    setIsVideoMuted(nextVideoMuted);

    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !nextVideoMuted;
      });
    }

    setCall({
      ...call,
      adminVideoMuted: !isPatient ? nextVideoMuted : call.adminVideoMuted,
      patientVideoMuted: isPatient ? nextVideoMuted : call.patientVideoMuted,
    });
  };

  const isIncoming = call !== null && call.status === "calling" && (
    (call.caller === "admin" && isPatient && call.patientId === session?.patientId?.toUpperCase()) ||
    (call.caller === "patient" && isAdmin)
  );

  const isOutgoing = call !== null && call.status === "calling" && (
    (call.caller === "admin" && isAdmin) ||
    (call.caller === "patient" && isPatient)
  );

  const isConnected = call !== null && call.status === "connected";

  return (
    <VideoCallContext.Provider
      value={{
        call,
        localStream,
        remoteStream,
        isMuted,
        isVideoMuted,
        isIncoming,
        isOutgoing,
        isConnected,
        micVolume,
        analyserRef,
        startCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleVideoMute,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
}

export function useVideoCall() {
  const ctx = useContext(VideoCallContext);
  if (!ctx) {
    throw new Error("useVideoCall must be used within VideoCallProvider");
  }
  return ctx;
}
