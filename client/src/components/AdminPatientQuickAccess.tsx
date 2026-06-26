import { useLocation } from "wouter";
import AdminPatientSelector from "@/components/AdminPatientSelector";
import { useAdminSelectedPatient } from "@/hooks/useAdminSelectedPatient";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function AdminPatientQuickAccess() {
  const { patientId, setPatientId } = useAdminSelectedPatient();
  const [, setLocation] = useLocation();

  return (
    <div className="hidden lg:flex items-center gap-2 shrink-0">
      <AdminPatientSelector
        patientId={patientId}
        onPatientChange={setPatientId}
        className="w-[200px] h-9"
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 shrink-0 h-9"
        onClick={() => setLocation(`/dashboard/patients/${patientId}`)}
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Open profile
      </Button>
    </div>
  );
}
