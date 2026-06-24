import type { PatientReport, ReportPatient, ReportType } from "@shared/reports";

export type { PatientReport, ReportPatient, ReportType };

export async function fetchReportPatients(): Promise<ReportPatient[]> {
  const res = await fetch("/api/reports/patients");
  if (!res.ok) throw new Error("Failed to load patients");
  return res.json();
}

export async function fetchReports(patientId: string, type?: ReportType): Promise<PatientReport[]> {
  const params = new URLSearchParams({ patientId });
  if (type) params.set("type", type);
  const res = await fetch(`/api/reports?${params}`);
  if (!res.ok) throw new Error("Failed to load reports");
  return res.json();
}

export async function fetchReport(id: string): Promise<PatientReport> {
  const res = await fetch(`/api/reports/${id}`);
  if (!res.ok) throw new Error("Failed to load report");
  return res.json();
}

export async function downloadReportPdf(id: string, fileName: string): Promise<void> {
  const res = await fetch(`/api/reports/${id}/download`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Download failed" }));
    throw new Error(err.error ?? "Download failed");
  }

  const blob = await res.blob();
  if (blob.type && !blob.type.includes("pdf")) {
    throw new Error("Server did not return a PDF file");
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function generateProgressPdf(patientId: string): Promise<void> {
  const res = await fetch("/api/reports/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Generation failed" }));
    throw new Error(err.error ?? "Generation failed");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ICU-Progress-Report-${patientId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function uploadReportPdf(input: {
  patientId: string;
  patientName?: string;
  title: string;
  type: ReportType;
  date?: string;
  file: File;
  summary?: string;
  observations?: string;
  recommendations?: string;
}): Promise<PatientReport> {
  const arrayBuffer = await input.file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const fileBase64 = btoa(binary);

  const res = await fetch("/api/reports/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      patientId: input.patientId,
      patientName: input.patientName,
      title: input.title,
      type: input.type,
      date: input.date,
      fileName: input.file.name,
      fileBase64,
      summary: input.summary,
      observations: input.observations,
      recommendations: input.recommendations,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error ?? "Upload failed");
  }

  return res.json();
}
