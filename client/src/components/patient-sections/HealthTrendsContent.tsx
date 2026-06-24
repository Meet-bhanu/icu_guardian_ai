import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { generateTrendData } from "@/lib/mockData";
import { getHealthMetricsForPatient } from "@/lib/patientData";

const trendCharts = [
  { title: "Heart Rate", color: "#ef4444", base: 85, variance: 15, unit: "bpm" },
  { title: "SpO₂", color: "#3b82f6", base: 96, variance: 3, unit: "%" },
  { title: "Blood Pressure", color: "#22c55e", base: 125, variance: 15, unit: "mmHg" },
  { title: "Temperature", color: "#f97316", base: 37.2, variance: 0.5, unit: "°C" },
];

function CircularProgress({ value, color, label }: { value: number; color: string; label: string }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (value / 100) * circumference;

  return (
    <Card className="p-6 flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{value}%</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 mt-3 text-center">{label}</p>
    </Card>
  );
}

interface HealthTrendsContentProps {
  patientId: string;
  patientName: string;
}

export default function HealthTrendsContent({ patientId, patientName }: HealthTrendsContentProps) {
  const healthMetrics = getHealthMetricsForPatient(patientId);
  const charts = useMemo(
    () =>
      trendCharts.map((c) => ({
        ...c,
        data: generateTrendData(7, c.base, c.variance),
      })),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Health Trends</h2>
        <p className="text-gray-500 text-sm mt-1">
          Historical health analytics — {patientName} ({patientId})
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {healthMetrics.map((m) => (
          <CircularProgress key={m.label} value={m.value} color={m.color} label={m.label} />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {charts.map((chart) => (
          <Card key={chart.title} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">{chart.title}</h3>
              <span className="text-xs text-gray-500">{chart.unit}</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chart.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        ))}
      </div>
    </div>
  );
}
