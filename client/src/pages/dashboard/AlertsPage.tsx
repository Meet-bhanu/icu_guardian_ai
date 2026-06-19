import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { alerts } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const severityConfig = {
  critical: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", badge: "bg-red-100 text-red-700" },
  warning: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", badge: "bg-orange-100 text-orange-700" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700" },
};

export default function AlertsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    if (filter === "critical") return a.severity === "critical";
    if (filter === "warning") return a.severity === "warning";
    if (filter === "info") return a.severity === "info";
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 text-sm mt-1">System alerts and notifications</p>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {filtered.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            return (
              <Card key={alert.id} className={cn("p-4", config.bg)}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg bg-white shadow-sm")}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-500">Patient {alert.patientId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={cn("text-xs", config.badge)}>{alert.severity}</Badge>
                    <Badge variant="outline" className="text-xs">{alert.status}</Badge>
                    <span className="text-xs text-gray-400 hidden sm:block">{alert.timestamp}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
