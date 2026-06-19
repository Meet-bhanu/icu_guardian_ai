import { useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateWaveformData } from "@/lib/mockData";

const waveforms = [
  { title: "ECG — Heart Rate", color: "#ef4444", base: 72, variance: 15 },
  { title: "SpO₂ — Oxygen Level", color: "#3b82f6", base: 96, variance: 3 },
  { title: "Respiration Rate", color: "#f97316", base: 18, variance: 5 },
  { title: "Pulse Waveform", color: "#22c55e", base: 80, variance: 20 },
];

function WaveformChart({ title, color, data }: { title: string; color: string; data: { time: number; value: number }[] }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(v: number) => [v.toFixed(1), ""]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default function WaveformsPage() {
  const charts = useMemo(
    () =>
      waveforms.map((w) => ({
        ...w,
        data: generateWaveformData(60, w.base, w.variance),
      })),
    []
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Waveforms</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time physiological waveforms — John Smith (P001)</p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="1h">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">Last 15 min</SelectItem>
                <SelectItem value="1h">Last 1 hour</SelectItem>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon"><ZoomOut className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon"><ZoomIn className="w-4 h-4" /></Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {charts.map((chart) => (
            <WaveformChart
              key={chart.title}
              title={chart.title}
              color={chart.color}
              data={chart.data}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
