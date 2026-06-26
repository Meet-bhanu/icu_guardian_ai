import { useEffect, useRef, useState } from "react";
import { useVideoCall } from "@/contexts/VideoCallContext";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { getPatientById } from "@/lib/patientData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Minimize2,
  Maximize2,
  VolumeX,
  Volume2,
  Activity,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoCallWidget() {
  const {
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
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideoMute,
  } = useVideoCall();

  const { isPatient, session } = usePatientAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [callTime, setCallTime] = useState("00:00");
  const [isAudioFeedbackMuted, setIsAudioFeedbackMuted] = useState(true); // Muted by default to prevent echo on local testing

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<number | null>(null);

  // Bind local stream to video tag
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isConnected, isOutgoing]);

  // Bind remote stream to video tag
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isConnected]);

  // Timer counter for active call
  useEffect(() => {
    if (isConnected && call?.timestamp) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - call.timestamp) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
        const secs = (elapsed % 60).toString().padStart(2, "0");
        setCallTime(`${mins}:${secs}`);
      };
      
      updateTimer();
      timerRef.current = window.setInterval(updateTimer, 1000);
    } else {
      setCallTime("00:00");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isConnected, call?.timestamp]);

  // Canvas audio oscilloscope visualizer
  useEffect(() => {
    if (!isConnected || !canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let active = true;

    const draw = () => {
      if (!active) return;
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      // Clean background
      ctx.fillStyle = "rgba(15, 23, 42, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw middle reference line
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw oscilloscope wave
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isMuted ? "rgba(239, 68, 68, 0.4)" : "#10b981"; // Green wave if talking, red if muted
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      active = false;
    };
  }, [isConnected, analyserRef, isMuted]);

  if (!call) return null;

  // Resolve display identities
  const oppositeName = isPatient
    ? "ICU Supervisor (Dr. Sarah Chen)"
    : (getPatientById(call.patientId)?.name ?? call.patientName);
  const oppositeBed = isPatient ? "Central Desk" : (getPatientById(call.patientId)?.bedNo ?? "ICU-01");
  const initials = oppositeName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  // 1. Incoming Call Dialog
  if (isIncoming) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
        <Card className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl flex flex-col items-center relative overflow-hidden">
          {/* Subtle medical heartbeat grid background animation */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,50 L20,50 L30,20 L40,80 L50,50 L100,50" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <Avatar className="w-24 h-24 border-4 border-emerald-500/30 relative">
              <AvatarFallback className="bg-slate-800 text-emerald-400 text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-full shadow-lg border-2 border-slate-900">
              <Phone className="w-4 h-4 animate-bounce" />
            </div>
          </div>

          <h2 className="text-xl font-bold mt-6 tracking-wide text-center">
            Incoming Video Call
          </h2>
          <p className="text-slate-400 text-sm mt-1 text-center font-medium">
            {oppositeName}
          </p>
          <span className="mt-3 px-3 py-1 bg-slate-800 text-emerald-400 font-semibold rounded-full text-xs tracking-wider border border-slate-700">
            {oppositeBed}
          </span>

          <div className="flex gap-4 w-full mt-8">
            <Button
              onClick={declineCall}
              variant="destructive"
              className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              Decline
            </Button>
            <Button
              onClick={acceptCall}
              className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Accept
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 2. Outgoing calling view
  if (isOutgoing) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
        <Card className="w-80 p-5 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <Avatar className="w-16 h-16 border-2 border-primary/40">
              <AvatarFallback className="bg-slate-800 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow border border-slate-900 animate-pulse">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="text-sm font-semibold mt-4 tracking-wide text-center">
            Calling Patient...
          </h3>
          <p className="text-slate-400 text-xs mt-1 text-center font-medium">
            {oppositeName}
          </p>

          <Button
            onClick={endCall}
            variant="destructive"
            size="sm"
            className="w-full mt-5 bg-red-600 hover:bg-red-700 font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            Cancel Call
          </Button>
        </Card>
      </div>
    );
  }

  // 3. Connected active call view
  if (isConnected) {
    // Minimized UI View
    if (isMinimized) {
      return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-200" onDoubleClick={() => setIsMinimized(false)}>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-950/95 border border-slate-800/80 text-white rounded-full shadow-2xl backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-xs font-semibold tracking-wide">
              {oppositeName} ({callTime})
            </div>
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2 ml-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className={cn("w-7 h-7 rounded-full text-slate-400 hover:text-white hover:bg-slate-800", isMuted && "text-red-500 hover:text-red-400")}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMinimized(false)}
                type="button"
                className="w-7 h-7 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={endCall}
                className="w-7 h-7 rounded-full text-red-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Normal Maximized Call UI View (FULL SCREEN)
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col justify-between overflow-hidden animate-in fade-in duration-300">
        {/* Fullscreen Video Viewport */}
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Main Remote Video */}
          {!call.adminVideoMuted && !isPatient && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={isAudioFeedbackMuted}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : isPatient && localStream && !isVideoMuted ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={true}
              className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
            />
          ) : (
            // Camera is off / simulated avatar
            <div className="flex flex-col items-center text-center p-6 select-none z-10">
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-slate-800/50 animate-pulse" />
                <Avatar className="w-28 h-28 border-4 border-slate-700 bg-slate-850 shadow-2xl relative">
                  <AvatarFallback className="bg-slate-800 text-slate-300 text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <p className="text-xl font-semibold text-slate-200 mt-6">{oppositeName}</p>
              <p className="text-sm text-slate-500 mt-2 bg-slate-900/60 px-4 py-1.5 rounded-full border border-slate-800/40">Video feed is paused by host</p>
            </div>
          )}
        </div>

        {/* Floating Top Header Bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-100 border border-white/10 flex items-center gap-2.5 pointer-events-auto shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Patient Call</span>
              <span className="text-xs text-white mt-0.5">{oppositeName} ({oppositeBed})</span>
            </div>
            <span className="ml-3 px-2 py-0.5 bg-slate-800 text-emerald-400 font-mono font-bold rounded-lg text-xs border border-slate-750">
              {callTime}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2.5">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsMinimized(true)}
              className="w-11 h-11 bg-slate-950/80 backdrop-blur-md text-slate-300 hover:text-white border-white/10 hover:bg-slate-900 rounded-2xl shadow-2xl"
              title="Minimize to Floating Pill"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Remote Muted Overlay indicator */}
        {((isPatient && call.adminMuted) || (!isPatient && call.patientMuted)) && (
          <div className="absolute top-24 left-6 bg-red-600/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 z-20 shadow-2xl border border-red-500/20">
            <MicOff className="w-3 h-3" />
            Remote User is Muted
          </div>
        )}

        {/* Floating PIP (Picture-In-Picture) Local Preview (Floats bottom right, above controls) */}
        <div className="absolute bottom-6 right-6 w-48 aspect-[4/3] rounded-2xl border-2 border-slate-850 bg-slate-950 shadow-2xl overflow-hidden z-20 hover:scale-105 transition-all">
          {localStream && !isVideoMuted ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-[11px] font-semibold text-slate-500 gap-1">
              <VideoOff className="w-5 h-5 opacity-40" />
              Camera Off
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-bold text-white border border-white/5">
            Your Camera
          </div>
        </div>

        {/* Floating Bottom Center Control Panel */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/85 backdrop-blur-xl border border-slate-850/80 p-4 rounded-3xl shadow-2xl z-20 flex flex-col gap-3.5 max-w-sm w-full mx-auto">
          {/* Voice Wave Osciloscape */}
          <div className="relative h-10 bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800/40">
            <canvas ref={canvasRef} width={380} height={40} className="w-full h-full block" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-emerald-400/80 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                {isMuted ? "Mic Muted" : "Voice Stream Live"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Signal: 3ms (Secure HD)
            </span>
            <button
              onClick={() => setIsAudioFeedbackMuted(!isAudioFeedbackMuted)}
              className="hover:text-white flex items-center gap-1 transition-colors"
              title="Mute local speaker to avoid audio loop howling when testing on the same PC"
            >
              {isAudioFeedbackMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-amber-500" />
                  <span>Echo Prevention: ON</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Echo Prevention: OFF</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 py-0.5">
            {/* Mic Control */}
            <Button
              size="icon"
              variant={isMuted ? "destructive" : "secondary"}
              onClick={toggleMute}
              className={cn(
                "w-11 h-11 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 border-0",
                !isMuted && "bg-slate-850 hover:bg-slate-800 text-white"
              )}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* End Call Button */}
            <Button
              size="icon"
              variant="destructive"
              onClick={endCall}
              className="w-13 h-13 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl shadow-red-600/20 transition-transform hover:scale-105 active:scale-95"
              title="End Video Call"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>

            {/* Video Camera Control */}
            <Button
              size="icon"
              variant={isVideoMuted ? "destructive" : "secondary"}
              onClick={toggleVideoMute}
              className={cn(
                "w-11 h-11 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 border-0",
                !isVideoMuted && "bg-slate-850 hover:bg-slate-800 text-white"
              )}
              title={isVideoMuted ? "Start Video" : "Stop Video"}
            >
              {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
