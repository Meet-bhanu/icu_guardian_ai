import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import type { PatientReport, ReportType } from "@shared/reports";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data/reports");
const FILES_DIR = path.join(DATA_DIR, "files");
const INDEX_PATH = path.join(DATA_DIR, "index.json");

async function ensureDirs() {
  await fs.mkdir(FILES_DIR, { recursive: true });
}

async function readIndex(): Promise<PatientReport[]> {
  await ensureDirs();
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf-8");
    return JSON.parse(raw) as PatientReport[];
  } catch {
    return [];
  }
}

async function writeIndex(reports: PatientReport[]) {
  await ensureDirs();
  await fs.writeFile(INDEX_PATH, JSON.stringify(reports, null, 2), "utf-8");
}

export async function listReports(filters?: {
  patientId?: string;
  type?: ReportType;
}): Promise<PatientReport[]> {
  let reports = await readIndex();
  if (filters?.patientId) {
    reports = reports.filter((r) => r.patientId === filters.patientId);
  }
  if (filters?.type) {
    reports = reports.filter((r) => r.type === filters.type);
  }
  return reports.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getReportById(id: string): Promise<PatientReport | null> {
  const reports = await readIndex();
  return reports.find((r) => r.id === id) ?? null;
}

export async function getReportPdfPath(id: string): Promise<string> {
  return path.join(FILES_DIR, `${id}.pdf`);
}

export async function readReportPdf(id: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(await getReportPdfPath(id));
  } catch {
    return null;
  }
}

export async function saveReportPdf(id: string, pdfBuffer: Buffer): Promise<void> {
  await ensureDirs();
  await fs.writeFile(path.join(FILES_DIR, `${id}.pdf`), pdfBuffer);
}

export async function createReport(
  report: Omit<PatientReport, "id" | "uploadedAt">,
  pdfBuffer: Buffer,
): Promise<PatientReport> {
  const id = randomUUID();
  const entry: PatientReport = {
    ...report,
    id,
    uploadedAt: new Date().toISOString(),
  };

  await saveReportPdf(id, pdfBuffer);
  const reports = await readIndex();
  reports.push(entry);
  await writeIndex(reports);
  return entry;
}

export async function deleteReport(id: string): Promise<boolean> {
  const reports = await readIndex();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) return false;

  reports.splice(index, 1);
  await writeIndex(reports);

  try {
    await fs.unlink(path.join(FILES_DIR, `${id}.pdf`));
  } catch {
    // file may already be missing
  }
  return true;
}

export function getDataDir() {
  return DATA_DIR;
}
