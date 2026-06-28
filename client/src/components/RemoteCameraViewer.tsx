import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCameraStream } from "@/contexts/CameraStreamContext";

interface RemoteCameraViewerProps {
  patientId: string;
  patientName?: string;
  className?: string;
  autoStart?: boolean;
}

export default function RemoteCameraViewer({
  patientId,
  patientName = "Patient",
  className,
  autoStart = true,
}: RemoteCameraViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isViewing, remoteStream, startViewing, stopViewing } = useCameraStream();
  const [timestamp, setTimestamp] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      setTimestamp(new Date().toLocaleTimeString("en-US", { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remoteStream && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
      videoRef.current.play().catch(err => {
        console.error("[RemoteCameraViewer] Error playing video:", err);
        setError("Failed to play video stream");
        setConnectionStatus("error");
      });
      setConnectionStatus("connected");
      setError(null);
    }
  }, [remoteStream]);

  const handleStartViewing = () => {
    setConnectionStatus("connecting");
    setError(null);
    startViewing(patientId);
    
    // Timeout for connection
    const timeout = setTimeout(() => {
      if (connectionStatus === "connecting") {
        setConnectionStatus("error");
        setError("Connection timeout. Patient may not be broadcasting.");
      }
    }, 10000);

    return () => clearTimeout(timeout);
  };

  const handleStopViewing = () => {
    stopViewing();
    setConnectionStatus("idle");
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (autoStart && !isViewing && connectionStatus === "idle") {
      handleStartViewing();
    }
    return () => {
      if (isViewing) {
        handleStopViewing();
      }
    };
  }, [autoStart]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-gray-900", className)}>
      <div className="relative aspect-video">
        {isViewing && remoteStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : connectionStatus === "connecting" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-center px-6">
            <Loader2 className="w-12 h-12 text-blue-400 mb-3 animate-spin" />
            <p className="text-white/70 text-sm">Connecting to patient camera...</p>
            <p className="text-white/50 text-xs mt-2">Patient: {patientName} ({patientId})</p>
          </div>
        ) : connectionStatus === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-900/50 to-gray-900 text-center px-6">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-white/70 text-sm font-medium">Connection Failed</p>
            <p className="text-white/50 text-xs mt-2 max-w-sm">{error || "Unable to connect to patient camera"}</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-center px-6">
            <CameraOff className="w-12 h-12 text-white/40 mb-3" />
            <p className="text-white/70 text-sm">Camera is off</p>
            <p className="text-white/50 text-xs mt-2">Patient: {patientName} ({patientId})</p>
          </div>
        )}

        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono z-30">
          {timestamp}
        </div>
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded z-30">
          {patientName}
        </div>
        {isViewing && remoteStream && (
          <>
            <Badge className="absolute bottom-3 left-3 bg-red-500 hover:bg-red-500 text-white gap-1 z-30">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </Badge>
            <Badge className="absolute bottom-3 left-20 bg-blue-500 hover:bg-blue-500 text-white gap-1 z-30">
              REMOTE
            </Badge>
          </>
        )}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2 z-30">
        {isViewing ? (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 bg-black/60 text-white hover:bg-black/80 border-0 font-semibold"
            onClick={handleStopViewing}
          >
            <CameraOff className="w-3.5 h-3.5 mr-1" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 bg-black/60 text-white hover:bg-black/80 border-0 font-semibold"
            onClick={handleStartViewing}
          >
            <Camera className="w-3.5 h-3.5 mr-1" />
            Start
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          className="h-8 bg-black/60 text-white hover:bg-black/80 border-0"
          onClick={() => {
            if (isViewing) {
              handleStopViewing();
              setTimeout(handleStartViewing, 100);
            } else {
              handleStartViewing();
            }
          }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
