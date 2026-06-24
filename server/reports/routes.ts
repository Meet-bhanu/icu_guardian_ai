import type { Express, Request, Response } from "express";
import { generatePatientProgressPdf, isPdfBuffer } from "./generatePdf";
import {
  createReport,
  getReportById,
  listReports,
  readReportPdf,
} from "./store";
import { getDemoPatientIds, getDemoPatientName, getPatientProgressData, seedDemoReports } from "./seed";
import type { ReportType } from "@shared/reports";

function sendPdf(res: Response, buffer: Buffer, fileName: string) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", buffer.length);
  res.send(buffer);
}

export async function initReports(): Promise<void> {
  await seedDemoReports();
}

export function registerReportRoutes(app: Express) {
  app.get("/api/reports/patients", (_req: Request, res: Response) => {
    const patients = getDemoPatientIds().map((id) => ({
      id,
      name: getDemoPatientName(id),
    }));
    res.json(patients);
  });

  app.get("/api/reports", async (req: Request, res: Response) => {
    try {
      const patientId = typeof req.query.patientId === "string" ? req.query.patientId : undefined;
      const type = typeof req.query.type === "string" ? (req.query.type as ReportType) : undefined;
      const reports = await listReports({ patientId, type });
      res.json(reports);
    } catch (error) {
      console.error("[Reports] list failed:", error);
      res.status(500).json({ error: "Failed to list reports" });
    }
  });

  app.get("/api/reports/:id", async (req: Request, res: Response) => {
    try {
      const report = await getReportById(req.params.id);
      if (!report) {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      res.json(report);
    } catch (error) {
      console.error("[Reports] get failed:", error);
      res.status(500).json({ error: "Failed to get report" });
    }
  });

  app.get("/api/reports/:id/download", async (req: Request, res: Response) => {
    try {
      const report = await getReportById(req.params.id);
      if (!report) {
        res.status(404).json({ error: "Report not found" });
        return;
      }

      const pdfBuffer = await readReportPdf(report.id);
      if (!pdfBuffer || !isPdfBuffer(pdfBuffer)) {
        res.status(404).json({ error: "PDF file not found" });
        return;
      }

      sendPdf(res, pdfBuffer, report.fileName);
    } catch (error) {
      console.error("[Reports] download failed:", error);
      res.status(500).json({ error: "Failed to download report" });
    }
  });

  app.post("/api/reports/generate", async (req: Request, res: Response) => {
    try {
      const { patientId } = req.body as { patientId?: string };
      if (!patientId) {
        res.status(400).json({ error: "patientId is required" });
        return;
      }

      const progressData = getPatientProgressData(patientId);
      if (!progressData) {
        res.status(404).json({ error: "Patient not found" });
        return;
      }

      const pdfBuffer = await generatePatientProgressPdf(progressData);
      const fileName = `ICU-Progress-Report-${patientId}-${progressData.reportDate}.pdf`;
      sendPdf(res, pdfBuffer, fileName);
    } catch (error) {
      console.error("[Reports] generate failed:", error);
      res.status(500).json({ error: "Failed to generate report PDF" });
    }
  });

  app.post("/api/reports/upload", async (req: Request, res: Response) => {
    try {
      const {
        patientId,
        patientName,
        title,
        type,
        date,
        fileName,
        fileBase64,
        summary,
        observations,
        recommendations,
      } = req.body as {
        patientId?: string;
        patientName?: string;
        title?: string;
        type?: ReportType;
        date?: string;
        fileName?: string;
        fileBase64?: string;
        summary?: string;
        observations?: string;
        recommendations?: string;
      };

      if (!patientId || !title || !type || !fileName || !fileBase64) {
        res.status(400).json({ error: "patientId, title, type, fileName, and fileBase64 are required" });
        return;
      }

      if (!fileName.toLowerCase().endsWith(".pdf")) {
        res.status(400).json({ error: "Only PDF files are allowed" });
        return;
      }

      const pdfBuffer = Buffer.from(fileBase64, "base64");
      if (!isPdfBuffer(pdfBuffer)) {
        res.status(400).json({ error: "Uploaded file is not a valid PDF" });
        return;
      }

      const resolvedName = patientName ?? getDemoPatientName(patientId) ?? "Unknown Patient";
      const report = await createReport(
        {
          patientId,
          patientName: resolvedName,
          title,
          type,
          date: date ?? new Date().toISOString().slice(0, 10),
          fileName,
          summary,
          observations,
          recommendations,
          source: "uploaded",
        },
        pdfBuffer,
      );

      res.status(201).json(report);
    } catch (error) {
      console.error("[Reports] upload failed:", error);
      res.status(500).json({ error: "Failed to upload report" });
    }
  });
}
