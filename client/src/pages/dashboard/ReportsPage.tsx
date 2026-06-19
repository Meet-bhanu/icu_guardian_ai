import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, FileText } from "lucide-react";
import { reports, reportDetail } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type ReportTab = "current" | "past" | "lab" | "scan";

const tabMap: Record<ReportTab, string> = {
  current: "current",
  past: "past",
  lab: "lab",
  scan: "scan",
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("current");
  const [selectedId, setSelectedId] = useState(1);

  const filtered = reports.filter((r) => r.type === tabMap[activeTab]);
  const selected = reports.find((r) => r.id === selectedId) ?? filtered[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 text-sm mt-1">Patient reports and medical documentation</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Upload className="w-4 h-4" />
              Upload New Report
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportTab)}>
          <TabsList>
            <TabsTrigger value="current">Current Report</TabsTrigger>
            <TabsTrigger value="past">Past Reports</TabsTrigger>
            <TabsTrigger value="lab">Lab Reports</TabsTrigger>
            <TabsTrigger value="scan">Scan Reports</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report List */}
          <Card className="p-4 lg:col-span-1">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Available Reports</h2>
            <div className="space-y-2">
              {filtered.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedId(report.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    selected?.id === report.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-gray-50 border border-transparent"
                  )}
                >
                  <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.title}</p>
                    <p className="text-xs text-gray-500">{report.date}</p>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No reports found</p>
              )}
            </div>
          </Card>

          {/* Report Detail */}
          <Card className="p-6 lg:col-span-2">
            {selected ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selected.date}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2">Summary</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{reportDetail.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2">Observations</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{reportDetail.observations}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2">Recommendations</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{reportDetail.recommendations}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">Select a report to view details</p>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
