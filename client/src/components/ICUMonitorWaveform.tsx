import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type WaveformType = "ecg" | "spo2";

interface ICUMonitorWaveformProps {
  type: WaveformType;
  label: string;
  value: number;
  unit: string;
  color?: string;
  heartRate?: number;
  className?: string;
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

function sampleAt(type: WaveformType, timeSec: number, heartRate: number): number {
  const period = 60 / heartRate;
  const phase = (timeSec % period) / period;
  const raw = type === "ecg" ? ecgSample(phase) : spo2Sample(phase);
  const noise = (Math.random() - 0.5) * 0.02;
  return raw + noise;
}

export default function ICUMonitorWaveform({
  type,
  label,
  value,
  unit,
  color,
  heartRate = 75,
  className,
}: ICUMonitorWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveColor = color ?? (type === "ecg" ? "#00ff41" : "#38bdf8");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let timeSec = 0;
    let sweepY = 0;
    let flickerPhase = 0;
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

    const drawGrid = (w: number, h: number) => {
      ctx.strokeStyle = "rgba(0, 255, 65, 0.08)";
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

      timeSec += 0.016;
      flickerPhase += 0.12;
      sweepY = (sweepY + 1.8) % (h + 20);

      const newSample = sampleAt(type, timeSec, heartRate);
      buffer.shift();
      buffer.push(newSample);

      ctx.fillStyle = "#050a08";
      ctx.fillRect(0, 0, w, h);

      drawGrid(w, h);

      const midY = h * 0.55;
      const amplitude = h * (type === "ecg" ? 0.38 : 0.32);
      const flicker = 0.88 + Math.sin(flickerPhase) * 0.12;

      ctx.beginPath();
      for (let i = 0; i < buffer.length; i++) {
        const x = i;
        const y = midY - buffer[i] * amplitude;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = waveColor;
      ctx.globalAlpha = flicker;
      ctx.lineWidth = type === "ecg" ? 2 : 1.8;
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      const eraseX = w - 18;
      ctx.fillStyle = "#050a08";
      ctx.fillRect(eraseX, 0, 18, h);

      const gradient = ctx.createLinearGradient(0, sweepY - 8, 0, sweepY + 8);
      gradient.addColorStop(0, "rgba(0, 255, 65, 0)");
      gradient.addColorStop(0.5, "rgba(0, 255, 65, 0.12)");
      gradient.addColorStop(1, "rgba(0, 255, 65, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, sweepY - 8, w, 16);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [type, waveColor, heartRate]);

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border border-emerald-900/60 bg-[#050a08]",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-900/40 bg-black/40">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400/90">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tabular-nums" style={{ color: waveColor }}>
            {value}
          </span>
          <span className="text-xs font-mono text-emerald-500/70">{unit}</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full h-[100px] block" />
      <div className="absolute top-12 left-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-mono text-red-400/90 uppercase">Live</span>
      </div>
    </div>
  );
}
