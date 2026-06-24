import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import PatientLayout from "@/components/PatientLayout";
import PatientDetailLayout, { usePatientDetailRoute } from "@/components/PatientDetailLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileUp, Loader2, Upload } from "lucide-react";
import {
  fetchReportPatients,
  uploadReportPdf,
  type ReportPatient,
  type ReportType,
} from "@/lib/reportsApi";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { getPatientById } from "@/lib/patientData";
import { toast } from "sonner";

function UploadForm({
  patientId,
  setPatientId,
  lockPatient,
  backPath,
  successPath,
  Layout,
}: {
  patientId: string;
  setPatientId: (id: string) => void;
  lockPatient: boolean;
  backPath: string;
  successPath: string;
  Layout: React.ComponentType<{ children: React.ReactNode }>;
}) {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [patients, setPatients] = useState<ReportPatient[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReportType>("past");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState("");
  const [observations, setObservations] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (lockPatient) {
      const patient = getPatientById(patientId);
      if (patient) {
        setPatients([{ id: patient.id, name: patient.name }]);
      }
      return;
    }
    fetchReportPatients()
      .then((list) => {
        setPatients(list);
        if (list.length > 0 && !list.find((p) => p.id === patientId)) {
          setPatientId(list[0].id);
        }
      })
      .catch(() => toast.error("Failed to load patients"));
  }, [lockPatient, patientId, setPatientId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a PDF file");
      e.target.value = "";
      return;
    }

    setFile(selected);
    if (!title) {
      setTitle(selected.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a PDF file to upload");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a report title");
      return;
    }

    const patient = patients.find((p) => p.id === patientId);
    setUploading(true);

    try {
      await uploadReportPdf({
        patientId,
        patientName: patient?.name ?? undefined,
        title: title.trim(),
        type,
        date,
        file,
        summary: summary.trim() || undefined,
        observations: observations.trim() || undefined,
        recommendations: recommendations.trim() || undefined,
      });

      toast.success("Report uploaded successfully");
      setLocation(successPath);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={backPath}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Past Report</h1>
            <p className="text-gray-500 text-sm mt-1">
              Upload an existing PDF report. Downloads will serve the actual PDF file.
            </p>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              {lockPatient ? (
                <Input id="patient" value={`${patients[0]?.name ?? patientId} (${patientId})`} disabled />
              ) : (
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Report Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="past">Past Report</SelectItem>
                    <SelectItem value="lab">Lab Report</SelectItem>
                    <SelectItem value="scan">Scan Report</SelectItem>
                    <SelectItem value="current">Current Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Report Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Discharge Summary, Blood Panel Results"
              />
            </div>

            <div className="space-y-2">
              <Label>PDF File</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="space-y-2">
                    <FileUp className="w-10 h-10 text-primary mx-auto" />
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Click to select a PDF file</p>
                    <p className="text-xs text-gray-400">Only .pdf files are accepted</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary (optional)</Label>
              <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observations (optional)</Label>
              <Textarea id="observations" value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations (optional)</Label>
              <Textarea id="recommendations" value={recommendations} onChange={(e) => setRecommendations(e.target.value)} rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="gap-2 flex-1" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Report
              </Button>
              <Link href={backPath}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export function PatientDetailUploadPage() {
  const { patientId } = usePatientDetailRoute();
  const [id, setId] = useState(patientId);

  return (
    <PatientDetailLayout activeSegment="reports">
      <UploadForm
        patientId={id}
        setPatientId={setId}
        lockPatient
        backPath={`/dashboard/patients/${patientId}/reports`}
        successPath={`/dashboard/patients/${patientId}/reports`}
        Layout={({ children }) => <>{children}</>}
      />
    </PatientDetailLayout>
  );
}

export function PatientPortalUploadPage() {
  const { session } = usePatientAuth();
  const patientId = session?.patientId ?? "P001";
  const [id, setId] = useState(patientId);

  return (
    <UploadForm
      patientId={id}
      setPatientId={setId}
      lockPatient
      backPath="/patient/reports"
      successPath="/patient/reports"
      Layout={PatientLayout}
    />
  );
}

export default function UploadPastReportsPage() {
  const [patientId, setPatientId] = useState("P001");

  return (
    <UploadForm
      patientId={patientId}
      setPatientId={setPatientId}
      lockPatient={false}
      backPath="/dashboard/patients"
      successPath={`/dashboard/patients/${patientId}/reports`}
      Layout={AppLayout}
    />
  );
}
