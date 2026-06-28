import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, MoreHorizontal, KeyRound, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createDoctorApi,
  listDoctorsApi,
  resetPasswordApi,
  toggleUserStatusApi,
  deleteUserApi,
  type CreatedCredentials,
} from "@/lib/authApi";
import CredentialsDialog from "@/components/auth/CredentialsDialog";
import { Spinner } from "@/components/ui/spinner";

type DoctorRow = {
  id: number;
  doctorPublicId: string | null;
  department: string | null;
  specialization: string | null;
  phone: string | null;
  user: { id: number; name: string | null; email: string | null; username: string | null; isActive: boolean } | null;
};

const emptyForm = {
  doctorName: "",
  department: "",
  specialization: "",
  email: "",
  phone: "",
};

export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentialsName, setCredentialsName] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listDoctorsApi();
      setDoctors(res.doctors as DoctorRow[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load doctors");
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
      const res = await createDoctorApi(form);
      setCredentials(res.credentials);
      setCredentialsName(form.doctorName);
      setCredentialsOpen(true);
      setFormOpen(false);
      setForm(emptyForm);
      toast.success("Doctor registered successfully");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create doctor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (userId: number, name: string) => {
    try {
      const res = await resetPasswordApi(userId);
      setCredentials({ doctorId: undefined, username: res.username, temporaryPassword: res.temporaryPassword });
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

  const handleDelete = async (doctor: DoctorRow) => {
    if (!doctor.user) return;
    if (!confirm(`Delete doctor ${doctor.user.name}?`)) return;
    try {
      await deleteUserApi(doctor.user.id);
      toast.success("Doctor deleted");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete doctor");
    }
  };

  return (
    <AppLayout searchPlaceholder="Search doctors...">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="hh-page-title">Doctor Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Register and manage ICU doctors and nurses</p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Register New Doctor
          </Button>
        </div>

        <Card className="hh-card-elevated overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No doctors registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-mono font-semibold">{doctor.doctorPublicId ?? "—"}</TableCell>
                      <TableCell className="font-medium">{doctor.user?.name ?? "—"}</TableCell>
                      <TableCell>{doctor.department ?? "—"}</TableCell>
                      <TableCell>{doctor.specialization ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className={doctor.user?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {doctor.user?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {doctor.user && (
                              <>
                                <DropdownMenuItem onClick={() => handleResetPassword(doctor.user!.id, doctor.user!.name ?? "")}>
                                  <KeyRound className="w-4 h-4 mr-2" /> Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(doctor.user!.id, doctor.user!.isActive)}>
                                  {doctor.user.isActive ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(doctor)}>
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Register New Doctor</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><Label>Doctor Name *</Label><Input required value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} /></div>
            <div><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
            <div><Label>Email *</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CredentialsDialog
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        credentials={credentials}
        type="doctor"
        displayName={credentialsName}
      />
    </AppLayout>
  );
}
