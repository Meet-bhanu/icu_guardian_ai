import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, FileText, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  downloadReportPdf,
  fetchReports,
  generateProgressPdf,
  type PatientReport,
  type ReportType,
} from "@/lib/reportsApi";
import { toast } from "sonner";

const tabMap: Record<ReportTab, ReportType> = {
  current: "current",
  past: "past",
  lab: "lab",
  scan: "scan",
};

type ReportTab = "current" | "past" | "lab" | "scan";

interface ReportsContentProps {
  patientId: string;
  patientName?: string;
  uploadPath?: string;
  initialTab?: ReportTab;
}

export default function ReportsContent({
  patientId,
  patientName,
  uploadPath,
  initialTab = "current",
}: ReportsContentProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>(initialTab);
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchReports(patientId, tabMap[activeTab])
      .then((list) => {
        setReports(list);
        setSelectedId(list[0]?.id ?? null);
      })
      .catch(() => toast.error("Failed to load reports"))
      .finally(() => setLoading(false));
  }, [patientId, activeTab]);

  const selected = reports.find((r) => r.id === selectedId) ?? reports[0];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (activeTab === "current" && !selected) {
        await generateProgressPdf(patientId);
        toast.success("Progress report downloaded as PDF");
        return;
      }

      if (!selected) {
        toast.error("No report selected");
        return;
      }

      await downloadReportPdf(selected.id, selected.fileName);
      toast.success("Report downloaded as PDF");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-500 text-sm mt-1">
            {patientName
              ? `Medical documentation for ${patientName} (${patientId})`
              : "Patient reports and medical documentation"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleDownload}
            disabled={downloading || loading}
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF
          </Button>
          {uploadPath && (
            <Link href={uploadPath}>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Upload className="w-4 h-4" />
                Upload Past Report
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as ReportTab);
          setSelectedId(null);
        }}
      >
        <TabsList>
          <TabsTrigger value="current">Current Report</TabsTrigger>
          <TabsTrigger value="past">Past Reports</TabsTrigger>
          <TabsTrigger value="lab">Lab Reports</TabsTrigger>
          <TabsTrigger value="scan">Scan Reports</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Reports</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedId(report.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    selected?.id === report.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-gray-50 border border-transparent",
                  )}
                >
                  <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.title}</p>
                    <p className="text-xs text-gray-500">{report.date}</p>
                  </div>
                </button>
              ))}
              {reports.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No reports found. Upload a past report or generate a progress PDF.
                </p>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6 lg:col-span-2">
          {selected ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selected.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{selected.date}</p>
              </div>
              <div className="space-y-4">
                {selected.summary && (
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.summary}</p>
                  </div>
                )}
                {selected.observations && (
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">Observations</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.observations}</p>
                  </div>
                )}
                {selected.recommendations && (
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">Recommendations</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.recommendations}</p>
                  </div>
                )}
                
                {/* AI Validation Feedback Trigger Card */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      AI Diagnostic Insights
                    </h5>
                    <p className="text-[11px] text-gray-500 font-medium">
                      This medical summary was automatically parsed and extracted by the HealthHalo AI agent.
                    </p>
                  </div>
                  <a href="/feedback?prefill_ai_rating=5">
                    <Button size="sm" variant="outline" className="text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 h-8 shrink-0">
                      Rate AI Accuracy
                    </Button>
                  </a>
                </div>
              </div>
              <Button variant="outline" className="gap-2" onClick={handleDownload} disabled={downloading}>
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download {selected.fileName}
              </Button>
            </div>
          ) : activeTab === "current" && !loading ? (
            <div className="text-center py-12 space-y-4">
              <FileText className="w-12 h-12 text-primary mx-auto opacity-60" />
              <p className="text-gray-600">Generate a fresh progress report PDF.</p>
              <Button className="gap-2" onClick={handleDownload} disabled={downloading}>
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Generate & Download Progress PDF
              </Button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">Select a report to view details</p>
          )}
        </Card>
      </div>
    </div>
  );
}
