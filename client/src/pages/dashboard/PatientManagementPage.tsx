import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Eye, Pencil, KeyRound, Trash2, FileKey, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createPatientApi,
  listPatientsApi,
  listDoctorsApi,
  resetPasswordApi,
  toggleUserStatusApi,
  deleteUserApi,
  updatePatientApi,
  type CreatedCredentials,
} from "@/lib/authApi";
import CredentialsDialog from "@/components/auth/CredentialsDialog";
import { Link } from "wouter";
import { Spinner } from "@/components/ui/spinner";

type PatientRow = {
  id: number;
  patientPublicId: string | null;
  bedNumber: string | null;
  status: string;
  assignedDoctorId: number | null;
  doctorName: string | null;
  user: { id: number; name: string | null; username: string | null; isActive: boolean } | null;
};

const emptyForm = {
  fullName: "",
  age: "",
  gender: "Male",
  phone: "",
  email: "",
  address: "",
  bloodGroup: "",
  medicalHistory: "",
  emergencyContact: "",
  assignedDoctorId: "",
  bedNumber: "",
  admissionDate: new Date().toISOString().split("T")[0],
};

export default function PatientManagementPage() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [doctors, setDoctors] = useState<{ userId: number; user: { name: string | null } | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editPatient, setEditPatient] = useState<PatientRow | null>(null);
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentialsName, setCredentialsName] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsRes, doctorsRes] = await Promise.all([listPatientsApi(), listDoctorsApi()]);
      setPatients(patientsRes.patients as PatientRow[]);
      setDoctors(doctorsRes.doctors as typeof doctors);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createPatientApi(form);
      setCredentials(res.credentials);
      setCredentialsName(form.fullName);
      setCredentialsOpen(true);
      setFormOpen(false);
      setForm(emptyForm);
      toast.success("Patient registered successfully");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPatient) return;
    setSubmitting(true);
    try {
      await updatePatientApi(editPatient.id, {
        fullName: form.fullName,
        age: form.age,
        gender: form.gender,
        phone: form.phone,
        email: form.email,
        address: form.address,
        bloodGroup: form.bloodGroup,
        medicalHistory: form.medicalHistory,
        emergencyContact: form.emergencyContact,
        assignedDoctorId: form.assignedDoctorId || null,
        bedNumber: form.bedNumber,
        admissionDate: form.admissionDate,
      });
      toast.success("Patient updated");
      setEditOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update patient");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (userId: number, name: string) => {
    try {
      const res = await resetPasswordApi(userId);
      setCredentials({ username: res.username, temporaryPassword: res.temporaryPassword });
      setCredentialsName(name);
      setCredentialsOpen(true);
      toast.success("Password reset successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    }
  };

  const handleToggleStatus = async (userId: number, isActive: boolean) => {
    try {
      await toggleUserStatusApi(userId, !isActive);
      toast.success(isActive ? "Account deactivated" : "Account activated");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async (patient: PatientRow) => {
    if (!patient.user) return;
    if (!confirm(`Delete patient ${patient.user.name}? This cannot be undone.`)) return;
    try {
      await deleteUserApi(patient.user.id);
      toast.success("Patient deleted");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete patient");
    }
  };

  const openEdit = (patient: PatientRow) => {
    setEditPatient(patient);
    setForm({
      fullName: patient.user?.name ?? "",
      age: "",
      gender: "Male",
      phone: "",
      email: "",
      address: "",
      bloodGroup: "",
      medicalHistory: "",
      emergencyContact: "",
      assignedDoctorId: patient.assignedDoctorId ? String(patient.assignedDoctorId) : "",
      bedNumber: patient.bedNumber ?? "",
      admissionDate: new Date().toISOString().split("T")[0],
    });
    setEditOpen(true);
  };

  const statusColor = (status: string) => {
    if (status === "critical") return "bg-red-100 text-red-700";
    if (status === "discharged") return "bg-gray-100 text-gray-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <AppLayout searchPlaceholder="Search patients...">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="hh-page-title">Patient Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Register and manage ICU patients</p>
          </div>
          <Button onClick={() => { setForm(emptyForm); setFormOpen(true); }} className="font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Register New Patient
          </Button>
        </div>

        <Card className="hh-card-elevated overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Bed Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No patients registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono font-semibold">{patient.patientPublicId ?? "—"}</TableCell>
                      <TableCell className="font-medium">{patient.user?.name ?? "—"}</TableCell>
                      <TableCell>{patient.doctorName ?? "Unassigned"}</TableCell>
                      <TableCell>{patient.bedNumber ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className={statusColor(patient.status)}>{patient.status}</Badge>
                        {!patient.user?.isActive && (
                          <Badge variant="outline" className="ml-1 text-red-600">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/patients/${patient.id}`}>
                                <Eye className="w-4 h-4 mr-2" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(patient)}>
                              <Pencil className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            {patient.user && (
                              <>
                                <DropdownMenuItem onClick={() => handleResetPassword(patient.user!.id, patient.user!.name ?? "")}>
                                  <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(patient.user!.id, patient.user!.isActive)}>
                                  {patient.user.isActive ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(patient.user!.id, patient.user!.name ?? "")}>
                                  <FileKey className="w-4 h-4 mr-2" /> Generate New Credentials
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(patient)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Register Form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name *" id="fullName">
              <Input id="fullName" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </FormField>
            <FormField label="Age" id="age">
              <Input id="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </FormField>
            <FormField label="Gender" id="gender">
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Male", "Female", "Other"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Phone Number" id="phone">
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </FormField>
            <FormField label="Email *" id="email">
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField label="Blood Group" id="bloodGroup">
              <Input id="bloodGroup" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} />
            </FormField>
            <FormField label="Address" id="address" className="sm:col-span-2">
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </FormField>
            <FormField label="Medical History" id="medicalHistory" className="sm:col-span-2">
              <Textarea id="medicalHistory" value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} />
            </FormField>
            <FormField label="Emergency Contact" id="emergencyContact" className="sm:col-span-2">
              <Input id="emergencyContact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
            </FormField>
            <FormField label="Assigned Doctor" id="assignedDoctorId">
              <Select value={form.assignedDoctorId} onValueChange={(v) => setForm({ ...form, assignedDoctorId: v })}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.userId} value={String(d.userId)}>
                      {d.user?.name ?? `Doctor #${d.userId}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="ICU Bed Number" id="bedNumber">
              <Input id="bedNumber" value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} />
            </FormField>
            <FormField label="Admission Date" id="admissionDate">
              <Input id="admissionDate" type="date" value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} />
            </FormField>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Patient"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Form */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Patient</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <FormField label="Full Name" id="editName">
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </FormField>
            <FormField label="Bed Number" id="editBed">
              <Input value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} />
            </FormField>
            <FormField label="Assigned Doctor" id="editDoctor">
              <Select value={form.assignedDoctorId} onValueChange={(v) => setForm({ ...form, assignedDoctorId: v })}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.userId} value={String(d.userId)}>{d.user?.name ?? `Doctor #${d.userId}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CredentialsDialog
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        credentials={credentials}
        type="patient"
        displayName={credentialsName}
      />
    </AppLayout>
  );
}

function FormField({
  label,
  id,
  children,
  className,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
