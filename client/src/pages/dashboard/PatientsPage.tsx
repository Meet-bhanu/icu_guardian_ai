import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePatientAuth } from "@/hooks/usePatientAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { setAdminSelectedPatientId } from "@/hooks/useAdminSelectedPatient";
import { getPatientsList, savePatientsList, type Patient } from "@/lib/patientData";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const statusStyles = {
  Critical: "bg-red-100 text-red-700 hover:bg-red-100",
  Stable: "bg-green-100 text-green-700 hover:bg-green-100",
  Warning: "bg-orange-100 text-orange-700 hover:bg-orange-100",
};

export default function PatientsPage() {
  const { isPatient } = usePatientAuth();
  const [, setLocation] = useLocation();

  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");

  // Dialog controls
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    age: "",
    gender: "Male",
    bedNo: "",
    doctor: "Dr. Sarah Chen",
    status: "Stable" as "Stable" | "Warning" | "Critical",
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    if (isPatient) {
      setLocation("/dashboard");
    } else {
      setPatientsList(getPatientsList());
    }
  }, [isPatient, setLocation]);

  if (isPatient) {
    return null;
  }

  const filteredPatients = patientsList.filter((patient) => {
    const matchesStatus =
      statusFilter === "all" ||
      patient.status.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDoctor = true;
    if (doctorFilter !== "all") {
      if (doctorFilter === "chen") matchesDoctor = patient.doctor === "Dr. Sarah Chen";
      else if (doctorFilter === "wilson") matchesDoctor = patient.doctor === "Dr. James Wilson";
      else if (doctorFilter === "park") matchesDoctor = patient.doctor === "Dr. Lisa Park";
    }
    return matchesStatus && matchesDoctor;
  });

  const openAddDialog = () => {
    setFormData({
      id: `P00${patientsList.length + 1}`,
      name: "",
      age: "",
      gender: "Male",
      bedNo: `ICU-0${patientsList.length + 1}`,
      doctor: "Dr. Sarah Chen",
      status: "Stable",
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim()) {
      toast.error("Please enter a Patient ID");
      return;
    }
    if (patientsList.some((p) => p.id.toUpperCase() === formData.id.trim().toUpperCase())) {
      toast.error("Patient ID already exists");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Please enter a Name");
      return;
    }
    
    const newPatient: Patient = {
      id: formData.id.trim().toUpperCase(),
      name: formData.name.trim(),
      age: parseInt(formData.age, 10) || 45,
      gender: formData.gender,
      bedNo: formData.bedNo.trim() || "ICU-01",
      doctor: formData.doctor,
      status: formData.status,
    };

    const newList = [...patientsList, newPatient];
    setPatientsList(newList);
    savePatientsList(newList);
    setIsAddOpen(false);
    toast.success(`Patient ${newPatient.name} added successfully`);
  };

  const openEditDialog = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatientId(patient.id);
    setFormData({
      id: patient.id,
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      bedNo: patient.bedNo,
      doctor: patient.doctor,
      status: patient.status,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a Name");
      return;
    }

    const newList = patientsList.map((p) => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          name: formData.name.trim(),
          age: parseInt(formData.age, 10) || p.age,
          gender: formData.gender,
          bedNo: formData.bedNo.trim() || p.bedNo,
          doctor: formData.doctor,
          status: formData.status,
        };
      }
      return p;
    });

    setPatientsList(newList);
    savePatientsList(newList);
    setIsEditOpen(false);
    toast.success("Patient details updated successfully");
  };

  const openDeleteDialog = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPatientId(patientId);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedPatientId) return;
    const newList = patientsList.filter((p) => p.id !== selectedPatientId);
    setPatientsList(newList);
    savePatientsList(newList);
    setIsDeleteOpen(false);
    toast.success("Patient deleted successfully");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and monitor all ICU patients</p>
          </div>
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90 gap-2 font-semibold shadow-sm">
            <Plus className="w-4 h-4" />
            Add Patient
          </Button>
        </div>

        <Card className="p-4 shadow-sm border border-border">
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                <SelectItem value="chen">Dr. Sarah Chen</SelectItem>
                <SelectItem value="wilson">Dr. James Wilson</SelectItem>
                <SelectItem value="park">Dr. Lisa Park</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Age</TableHead>
                  <TableHead className="font-semibold text-gray-700">Gender</TableHead>
                  <TableHead className="font-semibold text-gray-700">Bed No.</TableHead>
                  <TableHead className="font-semibold text-gray-700">Doctor</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No patients found matching the criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer hover:bg-gray-50/80 transition-colors"
                      onClick={() => {
                        setAdminSelectedPatientId(patient.id);
                        setLocation(`/dashboard/patients/${patient.id}`);
                      }}
                    >
                      <TableCell className="font-mono text-sm font-semibold text-gray-600">{patient.id}</TableCell>
                      <TableCell className="font-semibold">
                        <span className="text-primary hover:underline">{patient.name}</span>
                      </TableCell>
                      <TableCell className="text-gray-600">{patient.age}</TableCell>
                      <TableCell className="text-gray-600">{patient.gender}</TableCell>
                      <TableCell className="text-gray-600 font-medium">{patient.bedNo}</TableCell>
                      <TableCell className="text-gray-600">{patient.doctor}</TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs font-semibold shadow-none border-0", statusStyles[patient.status])}>
                          {patient.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          <Link href={`/dashboard/patients/${patient.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/5 font-semibold gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                            onClick={(e) => openEditDialog(patient, e)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                            onClick={(e) => openDeleteDialog(patient.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Add Patient Details</DialogTitle>
              <DialogDescription>
                Register a new ICU patient. Ensure correct bed and assigned doctor details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-id" className="text-right font-medium">Patient ID</Label>
                <Input
                  id="add-id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="P001"
                  className="col-span-3 h-10 font-mono"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-name" className="text-right font-medium">Full Name</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  className="col-span-3 h-10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-age" className="text-right font-medium">Age</Label>
                <Input
                  id="add-age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="65"
                  className="col-span-3 h-10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-gender" className="text-right font-medium">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger id="add-gender" className="col-span-3 h-10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-bed" className="text-right font-medium">Bed No.</Label>
                <Input
                  id="add-bed"
                  value={formData.bedNo}
                  onChange={(e) => setFormData({ ...formData, bedNo: e.target.value })}
                  placeholder="ICU-01"
                  className="col-span-3 h-10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-doctor" className="text-right font-medium">Doctor</Label>
                <Select
                  value={formData.doctor}
                  onValueChange={(val) => setFormData({ ...formData, doctor: val })}
                >
                  <SelectTrigger id="add-doctor" className="col-span-3 h-10">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Sarah Chen">Dr. Sarah Chen</SelectItem>
                    <SelectItem value="Dr. James Wilson">Dr. James Wilson</SelectItem>
                    <SelectItem value="Dr. Lisa Park">Dr. Lisa Park</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-status" className="text-right font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val as "Stable" | "Warning" | "Critical" })}
                >
                  <SelectTrigger id="add-status" className="col-span-3 h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stable">Stable</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit" className="font-semibold">Add Patient</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Edit Patient Details</DialogTitle>
              <DialogDescription>
                Modify active clinical records for patient {formData.id}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium text-gray-500">Patient ID</Label>
                <Input value={formData.id} disabled className="col-span-3 h-10 font-mono bg-gray-50" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right font-medium">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  className="col-span-3 h-10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-age" className="text-right font-medium">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="65"
                  className="col-span-3 h-10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-gender" className="text-right font-medium">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger id="edit-gender" className="col-span-3 h-10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-bed" className="text-right font-medium">Bed No.</Label>
                <Input
                  id="edit-bed"
                  value={formData.bedNo}
                  onChange={(e) => setFormData({ ...formData, bedNo: e.target.value })}
                  placeholder="ICU-01"
                  className="col-span-3 h-10"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-doctor" className="text-right font-medium">Doctor</Label>
                <Select
                  value={formData.doctor}
                  onValueChange={(val) => setFormData({ ...formData, doctor: val })}
                >
                  <SelectTrigger id="edit-doctor" className="col-span-3 h-10">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Sarah Chen">Dr. Sarah Chen</SelectItem>
                    <SelectItem value="Dr. James Wilson">Dr. James Wilson</SelectItem>
                    <SelectItem value="Dr. Lisa Park">Dr. Lisa Park</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val as "Stable" | "Warning" | "Critical" })}
                >
                  <SelectTrigger id="edit-status" className="col-span-3 h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stable">Stable</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="font-semibold">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Delete Patient Record?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete patient {selectedPatientId}? This action cannot be undone and will erase all monitoring logs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white font-semibold">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
