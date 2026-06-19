export const patients = [
  { id: "P001", name: "John Smith", age: 67, gender: "Male", bedNo: "ICU-01", doctor: "Dr. Sarah Chen", status: "Critical" as const },
  { id: "P002", name: "Maria Garcia", age: 54, gender: "Female", bedNo: "ICU-02", doctor: "Dr. James Wilson", status: "Stable" as const },
  { id: "P003", name: "Robert Johnson", age: 72, gender: "Male", bedNo: "ICU-03", doctor: "Dr. Sarah Chen", status: "Warning" as const },
  { id: "P004", name: "Emily Davis", age: 45, gender: "Female", bedNo: "ICU-04", doctor: "Dr. Lisa Park", status: "Stable" as const },
  { id: "P005", name: "Michael Brown", age: 61, gender: "Male", bedNo: "ICU-05", doctor: "Dr. James Wilson", status: "Critical" as const },
  { id: "P006", name: "Anna Williams", age: 38, gender: "Female", bedNo: "ICU-06", doctor: "Dr. Lisa Park", status: "Stable" as const },
];

export const dashboardStats = {
  totalPatients: 24,
  criticalPatients: 3,
  todayAdmissions: 5,
  dischargesToday: 2,
};

export const liveVitals = {
  heartRate: 112,
  spO2: 94,
  bloodPressure: "145/92",
  respiratoryRate: 22,
};

export const recentAlerts = [
  { id: 1, title: "High Heart Rate", patientId: "P001", time: "2 min ago", severity: "critical" as const },
  { id: 2, title: "Low SpO2 Level", patientId: "P005", time: "8 min ago", severity: "critical" as const },
  { id: 3, title: "Bed Exit Detected", patientId: "P003", time: "15 min ago", severity: "warning" as const },
  { id: 4, title: "Medication Due", patientId: "P002", time: "22 min ago", severity: "info" as const },
  { id: 5, title: "BP Above Threshold", patientId: "P001", time: "35 min ago", severity: "warning" as const },
];

export const aiMonitoringStatus = {
  cameras: "Active",
  aiDetection: "Running",
  systemHealth: "Healthy",
};

export const alerts = [
  { id: 1, title: "High Heart Rate", patientId: "P001", timestamp: "2026-06-19 14:32", severity: "critical" as const, status: "Active" },
  { id: 2, title: "Low SpO2 Level", patientId: "P005", timestamp: "2026-06-19 14:26", severity: "critical" as const, status: "Active" },
  { id: 3, title: "Bed Exit Detected", patientId: "P003", timestamp: "2026-06-19 14:19", severity: "warning" as const, status: "Acknowledged" },
  { id: 4, title: "Medication Due", patientId: "P002", timestamp: "2026-06-19 14:12", severity: "info" as const, status: "Resolved" },
  { id: 5, title: "BP Above Threshold", patientId: "P001", timestamp: "2026-06-19 13:59", severity: "warning" as const, status: "Active" },
  { id: 6, title: "Fall Detection", patientId: "P004", timestamp: "2026-06-19 13:45", severity: "critical" as const, status: "Resolved" },
];

export const medications = [
  { id: 1, name: "Metoprolol", dosage: "50mg", frequency: "Twice daily", time: "08:00 AM", status: "Given" as const },
  { id: 2, name: "Furosemide", dosage: "40mg", frequency: "Once daily", time: "10:00 AM", status: "Given" as const },
  { id: 3, name: "Heparin", dosage: "5000 IU", frequency: "Every 8 hrs", time: "02:00 PM", status: "Due in 00:25" as const },
  { id: 4, name: "Morphine", dosage: "2mg", frequency: "As needed", time: "04:00 PM", status: "Scheduled" as const },
  { id: 5, name: "Insulin", dosage: "10 units", frequency: "Before meals", time: "06:00 PM", status: "Scheduled" as const },
];

export const doctors = [
  { id: 1, name: "Dr. Sarah Chen", specialty: "Cardiology", status: "Active" as const, image: null },
  { id: 2, name: "Dr. James Wilson", specialty: "Pulmonology", status: "Busy" as const, image: null },
  { id: 3, name: "Dr. Lisa Park", specialty: "Neurology", status: "Active" as const, image: null },
  { id: 4, name: "Dr. Michael Torres", specialty: "ICU Specialist", status: "Active" as const, image: null },
  { id: 5, name: "Dr. Emily Foster", specialty: "Anesthesiology", status: "Busy" as const, image: null },
  { id: 6, name: "Dr. David Kim", specialty: "Internal Medicine", status: "Active" as const, image: null },
];

export const familyContacts = [
  { id: 1, name: "Jane Smith", relationship: "Wife", phone: "+1 (555) 123-4567" },
  { id: 2, name: "Tom Smith", relationship: "Son", phone: "+1 (555) 234-5678" },
  { id: 3, name: "Carlos Garcia", relationship: "Brother", phone: "+1 (555) 345-6789" },
  { id: 4, name: "Susan Johnson", relationship: "Daughter", phone: "+1 (555) 456-7890" },
  { id: 5, name: "Mark Davis", relationship: "Husband", phone: "+1 (555) 567-8901" },
  { id: 6, name: "Linda Brown", relationship: "Sister", phone: "+1 (555) 678-9012" },
];

export const reports = [
  { id: 1, date: "2026-06-19", title: "Daily ICU Report", type: "current" as const },
  { id: 2, date: "2026-06-18", title: "Daily ICU Report", type: "past" as const },
  { id: 3, date: "2026-06-17", title: "Daily ICU Report", type: "past" as const },
  { id: 4, date: "2026-06-15", title: "Blood Panel Results", type: "lab" as const },
  { id: 5, date: "2026-06-14", title: "Chest X-Ray", type: "scan" as const },
  { id: 6, date: "2026-06-12", title: "CT Scan Report", type: "scan" as const },
];

export const reportDetail = {
  summary: "Patient shows gradual improvement in vital signs over the past 24 hours. Heart rate has stabilized within normal range. Oxygen saturation remains at acceptable levels with supplemental oxygen support.",
  observations: "Heart rate trending downward from 118 to 98 bpm. Blood pressure within target range. Respiratory rate normalizing. Patient responsive and alert. No signs of infection.",
  recommendations: "Continue current medication regimen. Monitor SpO2 levels closely. Schedule follow-up chest X-ray in 48 hours. Consider reducing oxygen support if SpO2 remains above 95% for 12 hours.",
};

export function generateWaveformData(points: number, baseValue: number, variance: number) {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: baseValue + Math.sin(i * 0.3) * variance + (Math.random() - 0.5) * variance * 0.5,
  }));
}

export function generateTrendData(days: number, baseValue: number, variance: number) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return Array.from({ length: days }, (_, i) => ({
    day: labels[i % 7],
    value: baseValue + Math.sin(i * 0.8) * variance + (Math.random() - 0.5) * 10,
  }));
}
