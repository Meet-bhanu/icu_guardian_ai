import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { getPatientById } from "@/lib/patientData";
import { usePatientAuth } from "@/hooks/usePatientAuth";

export interface CallState {
  patientId: string;
  patientName: string;
  status: "idle" | "calling" | "ringing" | "connected" | "ended";
  caller: "admin" | "patient";
  adminMuted: boolean;
  patientMuted: boolean;
  adminVideoMuted: boolean;
  patientVideoMuted: boolean;
  timestamp: number;
}

interface VideoCallContextProps {
  call: CallState | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoMuted: boolean;
  isIncoming: boolean;
  isOutgoing: boolean;
  isConnected: boolean;
  micVolume: number; // 0 to 100 representing mic activity
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  startCall: (patientId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideoMute: () => void;
}

const STORAGE_KEY = "icu-active-call";
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

      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime); // Standard ringback
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

    // Play every 3 seconds
    playBeep();
    this.intervalId = window.setInterval(playBeep, 3000);
  }

  playRingtone() {
    this.stop();
    this.init();
    if (!this.audioCtx) return;

    const playRing = () => {
      if (!this.audioCtx) return;
      // High-low dual frequency ring
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

export function VideoCallProvider({ children }: { children: React.ReactNode }) {
  const { isPatient, session } = usePatientAuth();
  const [call, setCall] = useState<CallState | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [micVolume, setMicVolume] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Sync state helpers
  const saveCallState = (newState: CallState | null) => {
    if (newState) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setCall(newState);
  };

  // Stop media tracks
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

  // Start local camera & microphone
  const startLocalStream = useCallback(async (videoEnabled = true, audioEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } : false,
        audio: audioEnabled,
      });

      setLocalStream(stream);

      // Set initial mute states
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoMuted;
      });

      // Initialize real-time audio visualizer analyzer
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
            
            // Calculate average volume level
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setMicVolume(Math.min(100, Math.round((average / 255) * 100 * 2.5))); // Amplified for display

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
      // Fallback: create an empty stream or return null
      return null;
    }
  }, [isMuted, isVideoMuted]);

  // Local storage changes (signaling server simulation)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const val = e.newValue ? (JSON.parse(e.newValue) as CallState) : null;
        setCall(val);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    
    // Check initial state
    const initial = localStorage.getItem(STORAGE_KEY);
    if (initial) {
      try {
        setCall(JSON.parse(initial));
      } catch {}
    }

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Manage Sound Effects based on Call Status
  useEffect(() => {
    if (!call) {
      sounds.stop();
      stopLocalStream();
      stopRemoteStream();
      return;
    }

    const currentPatientId = isPatient ? session?.patientId : null;

    if (call.status === "calling") {
      if (call.caller === "admin" && !isPatient) {
        // Outgoing call from admin
        sounds.playRingback();
        startLocalStream();
      } else if (call.caller === "admin" && isPatient && call.patientId === currentPatientId) {
        // Incoming call to patient
        sounds.playRingtone();
      } else if (call.caller === "patient" && isPatient) {
        // Outgoing call from patient
        sounds.playRingback();
        startLocalStream();
      } else if (call.caller === "patient" && !isPatient) {
        // Incoming call to admin
        sounds.playRingtone();
      }
    } else if (call.status === "connected") {
      sounds.stop();
      if (!localStream) {
        sounds.playConnect();
        startLocalStream();
      }
      
      // Simulate remote stream for local testing, or capture from local webcam as remote placeholder
      if (!remoteStream) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => setRemoteStream(stream))
          .catch(() => {});
      }
    } else if (call.status === "ended") {
      sounds.playDisconnect();
      const id = setTimeout(() => {
        saveCallState(null);
      }, 1000);
      return () => clearTimeout(id);
    }
  }, [call, isPatient, session?.patientId, startLocalStream, stopLocalStream, stopRemoteStream]);

  // Methods
  const startCall = async (patientId: string) => {
    if (call) return;
    
    const patient = getPatientById(patientId);
    const patientName = patient?.name ?? "Patient";

    const newCall: CallState = {
      patientId,
      patientName,
      status: "calling",
      caller: isPatient ? "patient" : "admin",
      adminMuted: false,
      patientMuted: false,
      adminVideoMuted: false,
      patientVideoMuted: false,
      timestamp: Date.now(),
    };

    saveCallState(newCall);
    toast.info(`Calling ${patientName}...`);
  };

  const acceptCall = async () => {
    if (!call) return;
    
    const updatedCall: CallState = {
      ...call,
      status: "connected",
      timestamp: Date.now(),
    };
    
    saveCallState(updatedCall);
    sounds.playConnect();
    toast.success("Call connected");
  };

  const declineCall = () => {
    if (!call) return;
    
    const updatedCall: CallState = {
      ...call,
      status: "ended",
    };
    
    saveCallState(updatedCall);
    toast.error("Call declined");
  };

  const endCall = () => {
    if (!call) return;

    const updatedCall: CallState = {
      ...call,
      status: "ended",
    };

    saveCallState(updatedCall);
    stopLocalStream();
    stopRemoteStream();
    toast.info("Call ended");
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

    const updatedCall: CallState = {
      ...call,
      adminMuted: !isPatient ? nextMuted : call.adminMuted,
      patientMuted: isPatient ? nextMuted : call.patientMuted,
    };
    saveCallState(updatedCall);
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

    const updatedCall: CallState = {
      ...call,
      adminVideoMuted: !isPatient ? nextVideoMuted : call.adminVideoMuted,
      patientVideoMuted: isPatient ? nextVideoMuted : call.patientVideoMuted,
    };
    saveCallState(updatedCall);
  };

  const isIncoming = call !== null && call.status === "calling" && (
    (call.caller === "admin" && isPatient && call.patientId === session?.patientId) ||
    (call.caller === "patient" && !isPatient)
  );

  const isOutgoing = call !== null && call.status === "calling" && (
    (call.caller === "admin" && !isPatient) ||
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
