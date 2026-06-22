import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type WaveformType = "ecg" | "spo2" | "resp" | "pulse";

interface ICUMonitorWaveformProps {
  type: WaveformType;
  label: string;
  value: number;
  unit: string;
  color?: string;
  heartRate?: number;
  className?: string;
  size?: "default" | "large";
}

function ecgSample(phase: number): number {
  if (phase < 0.08) return 0.12 * Math.sin((phase / 0.08) * Math.PI);
  if (phase < 0.12) return 0;
  if (phase < 0.14) return -0.08;
  if (phase < 0.17) return 1;
  if (phase < 0.2) return -0.22;
  if (phase < 0.35) return 0;
  if (phase < 0.55) return 0.22 * Math.sin(((phase - 0.35) / 0.2) * Math.PI);
  return 0;
}

function spo2Sample(phase: number): number {
  const base = Math.sin(phase * Math.PI * 2) * 0.42 + 0.08;
  if (phase > 0.28 && phase < 0.42) {
    return base - 0.18 * Math.sin(((phase - 0.28) / 0.14) * Math.PI);
  }
  return base;
}

function respSample(phase: number): number {
  return Math.sin(phase * Math.PI * 2) * 0.35;
}

function pulseSample(phase: number): number {
  return spo2Sample(phase);
}

function sampleAt(type: WaveformType, timeSec: number, heartRate: number): number {
  const period = type === "resp" ? 4.5 : 60 / heartRate;
  const phase = (timeSec % period) / period;
  let raw = 0;
  if (type === "ecg") {
    raw = ecgSample(phase);
  } else if (type === "spo2") {
    raw = spo2Sample(phase);
  } else if (type === "resp") {
    raw = respSample(phase);
  } else if (type === "pulse") {
    raw = pulseSample(phase);
  }
  const noise = (Math.random() - 0.5) * 0.035;
  return raw + noise;
}

function getBeatPhase(timeSec: number, heartRate: number): number {
  const period = 60 / heartRate;
  return (timeSec % period) / period;
}

export default function ICUMonitorWaveform({
  type,
  label,
  value,
  unit,
  color,
  heartRate = 75,
  className,
  size = "default",
}: ICUMonitorWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const heartRateRef = useRef(heartRate);
  const waveColor = color ?? (
    type === "ecg" ? "#00ff41" :
    type === "spo2" ? "#38bdf8" :
    type === "resp" ? "#f97316" : "#22c55e"
  );
  const canvasHeight = size === "large" ? "h-[160px]" : "h-[100px]";

  useEffect(() => {
    heartRateRef.current = heartRate;
  }, [heartRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let timeSec = 0;
    let flickerPhase = 0;
    let scanLineY = 0;
    const buffer: number[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buffer.length = 0;
      for (let i = 0; i < Math.floor(rect.width); i++) {
        buffer.push(0);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const drawGrid = (w: number, h: number, gridColor: string) => {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      const stepX = 24;
      const stepY = 16;
      for (let x = 0; x < w; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const drawWaveform = (
      w: number,
      h: number,
      midY: number,
      amplitude: number,
      alpha: number,
      blur: number,
      lineWidth: number
    ) => {
      ctx.beginPath();
      for (let i = 0; i < buffer.length; i++) {
        const x = i;
        const y = midY - buffer[i] * amplitude;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = waveColor;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = blur;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      if (buffer.length !== w) {
        resize();
      }

      const hr = heartRateRef.current;
      timeSec += 0.016;
      flickerPhase += 0.18;
      scanLineY = (scanLineY + 0.6) % h;

      const beatPhase = getBeatPhase(timeSec, hr);
      const isBeatFlash = type === "ecg" && beatPhase > 0.16 && beatPhase < 0.22;
      const isSpo2Pulse = (type === "spo2" || type === "pulse") && beatPhase > 0.05 && beatPhase < 0.35;

      const newSample = sampleAt(type, timeSec, hr);
      buffer.shift();
      buffer.push(newSample);

      // Phosphor persistence — partial erase creates trailing glow
      ctx.fillStyle = "rgba(5, 10, 8, 0.42)";
      ctx.fillRect(0, 0, w, h);

      let gridColor = "rgba(56, 189, 248, 0.07)";
      if (type === "ecg") {
        gridColor = "rgba(0, 255, 65, 0.07)";
      } else if (type === "resp") {
        gridColor = "rgba(249, 115, 22, 0.07)";
      } else if (type === "pulse") {
        gridColor = "rgba(34, 197, 94, 0.07)";
      }
      drawGrid(w, h, gridColor);

      const midY = h * 0.55;
      let ampFactor = 0.32;
      if (type === "ecg") {
        ampFactor = 0.38;
      } else if (type === "resp") {
        ampFactor = 0.26;
      }
      const amplitude = h * ampFactor;

      // Primary flicker — hospital monitor intensity variation
      const baseFlicker = 0.72 + Math.sin(flickerPhase) * 0.18 + Math.sin(flickerPhase * 2.7) * 0.08;
      const beatBoost = isBeatFlash ? 0.25 : isSpo2Pulse ? 0.12 : 0;
      const flicker = Math.min(1, baseFlicker + beatBoost + (Math.random() - 0.5) * 0.06);

      // Phosphor ghost trail
      const isEcg = type === "ecg";
      drawWaveform(w, h, midY, amplitude, flicker * 0.22, 14, isEcg ? 3 : 2.5);
      // Main trace
      drawWaveform(w, h, midY, amplitude, flicker, isBeatFlash ? 12 : 6, isEcg ? 2 : 1.8);

      // Beat flash overlay on R-wave
      if (isBeatFlash) {
        ctx.fillStyle = `rgba(0, 255, 65, ${0.06 + Math.random() * 0.04})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Horizontal scan line (CRT-style)
      ctx.fillStyle = `rgba(0, 255, 65, ${0.03 + Math.sin(flickerPhase) * 0.02})`;
      ctx.fillRect(0, scanLineY, w, 2);

      // Trailing erase bar at right edge
      const eraseX = w - 20;
      ctx.fillStyle = "#050a08";
      ctx.fillRect(eraseX, 0, 20, h);

      // Sweep highlight at trace head
      const headGradient = ctx.createLinearGradient(eraseX - 30, 0, eraseX, 0);
      headGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      headGradient.addColorStop(0.6, `${waveColor}18`);
      headGradient.addColorStop(1, `${waveColor}44`);
      ctx.fillStyle = headGradient;
      ctx.fillRect(eraseX - 30, 0, 30, h);

      // Flicker numeric readout without React re-renders
      if (valueRef.current) {
        const numFlicker =
          0.78 +
          Math.sin(flickerPhase * 1.4) * 0.14 +
          (isBeatFlash || isSpo2Pulse ? 0.12 : 0) +
          (Math.random() - 0.5) * 0.08;
        valueRef.current.style.opacity = String(Math.min(1, numFlicker));
        if (isBeatFlash && type === "ecg") {
          valueRef.current.style.textShadow = `0 0 12px ${waveColor}, 0 0 24px ${waveColor}88`;
        } else {
          valueRef.current.style.textShadow = `0 0 6px ${waveColor}66`;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [type, waveColor]);

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border border-emerald-900/60 bg-[#050a08]",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-900/40 bg-black/40">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400/90 animate-pulse">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span
            ref={valueRef}
            className="text-2xl font-bold font-mono tabular-nums transition-none"
            style={{ color: waveColor, textShadow: `0 0 6px ${waveColor}66` }}
          >
            {value}
          </span>
          <span className="text-xs font-mono text-emerald-500/70">{unit}</span>
        </div>
      </div>
      <canvas ref={canvasRef} className={cn("w-full block", canvasHeight)} />
      <div className="absolute top-12 left-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-mono text-red-400/90 uppercase animate-pulse">Live</span>
      </div>
      {/* Subtle CRT vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.35) 100%)",
        }}
      />
    </div>
  );
}
