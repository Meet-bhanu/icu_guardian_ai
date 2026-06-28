import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  AlertTriangle,
  Heart,
  Droplets,
  Gauge,
  Wind,
  Camera,
  Brain,
  Shield,
  Activity,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  recentAlerts,
  aiMonitoringStatus,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { getPatientsList } from "@/lib/patientData";
import { setAdminSelectedPatientId } from "@/hooks/useAdminSelectedPatient";
import { useEffect, useState } from "react";

const severityStyles = {
  critical: "bg-red-50 text-red-700 border-red-200/50 hover:bg-red-50",
  warning: "bg-orange-50 text-orange-700 border-orange-200/50 hover:bg-orange-50",
  info: "bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-50",
};

// Vitals generator based on status with slight variation for realism
function getPatientVitals(status: "Critical" | "Warning" | "Stable", seed: string) {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  if (status === "Critical") {
    return {
      heartRate: 110 + (hash % 25), // 110 - 135
      spO2: 86 + (hash % 5),        // 86 - 90
      bloodPressure: `${145 + (hash % 20)}/${92 + (hash % 10)}`,
      respRate: 24 + (hash % 5),    // 24 - 28
    };
  }
  if (status === "Warning") {
    return {
      heartRate: 92 + (hash % 12),  // 92 - 104
      spO2: 91 + (hash % 4),        // 91 - 94
      bloodPressure: `${132 + (hash % 12)}/${85 + (hash % 6)}`,
      respRate: 19 + (hash % 4),    // 19 - 22
    };
  }
  return {
    heartRate: 68 + (hash % 12),    // 68 - 80
    spO2: 96 + (hash % 4),          // 96 - 99
    bloodPressure: `${118 + (hash % 8)}/${76 + (hash % 6)}`,
    respRate: 12 + (hash % 4),      // 12 - 15
  };
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [patientsList, setPatientsList] = useState<any[]>([]);

  useEffect(() => {
    setPatientsList(getPatientsList());
  }, []);

  const handlePatientSelect = (patientId: string) => {
    setAdminSelectedPatientId(patientId);
    setLocation(`/dashboard/patients/${patientId}`);
  };

  // Calculate dynamic stats
  const totalCount = patientsList.length;
  const criticalCount = patientsList.filter(p => p.status === "Critical").length;
  const warningCount = patientsList.filter(p => p.status === "Warning").length;
  const stableCount = patientsList.filter(p => p.status === "Stable").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="hh-page-title">ICU Command Center</h1>
            <p className="hh-page-subtitle">Real-time overview of active patients, telemetry streams, and AI diagnostics</p>
          </div>
          <Button onClick={() => setLocation("/dashboard/patients")} className="w-full md:w-auto font-bold flex items-center gap-1.5">
            Manage ICU Patients
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Dynamic Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border border-border shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-semibold">Total Patients</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{totalCount}</p>
            <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">Beds occupied in ICU ward</p>
          </Card>
          
          <Card className="p-5 border border-red-100 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-semibold">Critical Status</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-red-600">{criticalCount}</p>
            <p className="text-[11px] text-red-600/80 mt-1.5 font-medium">High risk intervention required</p>
          </Card>
          
          <Card className="p-5 border border-amber-100 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-semibold">Warning Status</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-amber-600">{warningCount}</p>
            <p className="text-[11px] text-amber-600/80 mt-1.5 font-medium">Under strict observation</p>
          </Card>
          
          <Card className="p-5 border border-emerald-100 shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-semibold">Stable Status</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">{stableCount}</p>
            <p className="text-[11px] text-emerald-600/80 mt-1.5 font-medium">Vitals within normal range</p>
          </Card>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Patient Telemetry Table */}
          <Card className="p-5 lg:col-span-2 flex flex-col min-h-[480px]">
            <div className="flex items-center justify-between mb-5 border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Bedside Telemetry Overview</h2>
                <p className="text-xs text-muted-foreground">Live telemetry feeds from active patient monitors</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              {patientsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm">
                  <Users className="w-12 h-12 stroke-1 mb-2 text-gray-300" />
                  No patients currently admitted to ICU.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {patientsList.map((patient) => {
                    const vitals = getPatientVitals(patient.status, patient.id);
                    
                    return (
                      <div 
                        key={patient.id} 
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-gray-50/50 px-2 rounded-xl transition-all cursor-pointer"
                        onClick={() => handlePatientSelect(patient.id)}
                      >
                        {/* Info Block */}
                        <div className="space-y-1 min-w-[150px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md">
                              {patient.bedNo}
                            </span>
                            <span className="font-bold text-gray-950 group-hover:text-primary transition-colors text-sm">
                              {patient.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">
                            {patient.age}y/o · {patient.gender} · {patient.doctor}
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex items-center">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
                            patient.status === "Critical" ? "bg-red-50 text-red-700 border-red-200" :
                            patient.status === "Warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              patient.status === "Critical" ? "bg-red-500 animate-pulse" :
                              patient.status === "Warning" ? "bg-amber-500" :
                              "bg-emerald-500"
                            )} />
                            {patient.status}
                          </span>
                        </div>
                        
                        {/* Live Vitals Grid */}
                        <div className="grid grid-cols-4 gap-2 flex-1 max-w-sm sm:max-w-none">
                          {/* HR */}
                          <div className={cn(
                            "px-2 py-1.5 rounded-lg border flex flex-col items-center justify-center text-center",
                            patient.status === "Critical" ? "bg-red-50/50 border-red-200" : "bg-gray-50/50 border-gray-100"
                          )}>
                            <div className="flex items-center gap-1 text-[9px] text-gray-500 font-semibold">
                              <Heart className={cn("w-3 h-3 shrink-0", patient.status === "Critical" ? "text-red-500 animate-pulse" : "text-gray-400")} />
                              <span>HR</span>
                            </div>
                            <span className={cn("text-xs font-bold font-mono mt-0.5", 
                              vitals.heartRate > 100 || vitals.heartRate < 60 ? "text-red-600 font-extrabold" : "text-gray-800"
                            )}>
                              {vitals.heartRate}
                            </span>
                          </div>
                          
                          {/* SpO2 */}
                          <div className={cn(
                            "px-2 py-1.5 rounded-lg border flex flex-col items-center justify-center text-center",
                            vitals.spO2 < 92 ? "bg-red-50/50 border-red-200" : "bg-gray-50/50 border-gray-100"
                          )}>
                            <div className="flex items-center gap-1 text-[9px] text-gray-500 font-semibold">
                              <Droplets className={cn("w-3 h-3 shrink-0", vitals.spO2 < 92 ? "text-red-500 animate-bounce" : "text-blue-500")} />
                              <span>SpO₂</span>
                            </div>
                            <span className={cn("text-xs font-bold font-mono mt-0.5", 
                              vitals.spO2 < 92 ? "text-red-600 font-extrabold" : "text-gray-800"
                            )}>
                              {vitals.spO2}%
                            </span>
                          </div>
                          
                          {/* BP */}
                          <div className="px-2 py-1.5 rounded-lg border bg-gray-50/50 border-gray-100 flex flex-col items-center justify-center text-center">
                            <div className="flex items-center gap-1 text-[9px] text-gray-500 font-semibold">
                              <Gauge className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>BP</span>
                            </div>
                            <span className="text-xs font-bold font-mono mt-0.5 text-gray-800">
                              {vitals.bloodPressure}
                            </span>
                          </div>
                          
                          {/* RR */}
                          <div className="px-2 py-1.5 rounded-lg border bg-gray-50/50 border-gray-100 flex flex-col items-center justify-center text-center">
                            <div className="flex items-center gap-1 text-[9px] text-gray-500 font-semibold">
                              <Wind className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>RR</span>
                            </div>
                            <span className="text-xs font-bold font-mono mt-0.5 text-gray-800">
                              {vitals.respRate}
                            </span>
                          </div>
                        </div>
                        
                        {/* Go to panel button */}
                        <div className="flex items-center justify-end sm:self-center shrink-0">
                          <button className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-primary hover:text-white transition-all group-hover:translate-x-0.5 border border-gray-200/50 group-hover:border-primary">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
          
          {/* Right Column: AI safety shield & Recent Alerts */}
          <div className="space-y-6 lg:col-span-1">
            {/* AI Status Card */}
            <Card className="p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  AI Watchdog Shield
                </h2>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                  ACTIVE
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Camera className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-gray-700">Bedside Vision Feed</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px] hover:bg-emerald-100">
                    {aiMonitoringStatus.cameras}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Brain className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-gray-700">Fall & Positional AI</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px] hover:bg-emerald-100">
                    {aiMonitoringStatus.aiDetection}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-gray-700">Vitals Anomalies</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[10px] hover:bg-emerald-100">
                    {aiMonitoringStatus.systemHealth}
                  </Badge>
                </div>
                
                <div className="pt-3 border-t border-gray-100 mt-2 text-center">
                  <a 
                    href="/feedback?prefill_ai_rating=5"
                    className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>Rate Watchdog Accuracy</span>
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  </a>
                </div>
              </div>
            </Card>
            
            {/* Recent Telemetry Alerts Card */}
            <Card className="p-5 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                  Recent ICU Alerts
                </h2>
                <Button variant="link" size="sm" onClick={() => setLocation("/dashboard/alerts")} className="text-xs text-primary font-bold p-0 h-auto">
                  View All
                </Button>
              </div>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer hover:border-gray-200"
                    onClick={() => {
                      setAdminSelectedPatientId(alert.patientId);
                      setLocation(`/dashboard/patients/${alert.patientId}`);
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        alert.severity === "critical" ? "bg-red-500 animate-pulse" :
                        alert.severity === "warning" ? "bg-amber-500" : "bg-blue-500"
                      )} />
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-950 truncate">{alert.title}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Patient {alert.patientId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn("text-[9px] font-extrabold uppercase border px-1.5 py-0.5", severityStyles[alert.severity])}>
                        {alert.severity}
                      </Badge>
                      <span className="text-[10px] text-gray-400 font-mono font-medium">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
