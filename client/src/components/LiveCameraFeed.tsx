import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LiveCameraFeedProps {
  className?: string;
  label?: string;
  autoStart?: boolean;
}

export default function LiveCameraFeed({
  className,
  label = "Patient Camera",
  autoStart = true,
}: LiveCameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setError("Camera access denied. Please allow camera permission in your browser.");
      setActive(false);
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => stopCamera();
  }, [autoStart, startCamera, stopCamera]);

  useEffect(() => {
    const tick = () => {
      setTimestamp(
        new Date().toLocaleTimeString("en-US", { hour12: false })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-gray-900", className)}>
      <div className="relative aspect-video">
        {active ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-center px-6">
            <CameraOff className="w-12 h-12 text-white/40 mb-3" />
            <p className="text-white/70 text-sm">
              {error ?? "Camera is off"}
            </p>
          </div>
        )}

        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">
          {timestamp}
        </div>
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {label}
        </div>
        {active && (
          <Badge className="absolute bottom-3 left-3 bg-red-500 hover:bg-red-500 text-white gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </Badge>
        )}
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2">
        {active ? (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 bg-black/60 text-white hover:bg-black/80 border-0"
            onClick={stopCamera}
          >
            <CameraOff className="w-3.5 h-3.5 mr-1" />
            Stop
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="h-8 bg-black/60 text-white hover:bg-black/80 border-0"
            onClick={startCamera}
          >
            <Camera className="w-3.5 h-3.5 mr-1" />
            Start
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          className="h-8 bg-black/60 text-white hover:bg-black/80 border-0"
          onClick={startCamera}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
