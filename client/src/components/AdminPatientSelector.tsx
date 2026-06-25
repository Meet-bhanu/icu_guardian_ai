import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPatientsList } from "@/lib/patientData";

interface AdminPatientSelectorProps {
  patientId: string;
  onPatientChange: (patientId: string) => void;
  className?: string;
}

export default function AdminPatientSelector({
  patientId,
  onPatientChange,
  className,
}: AdminPatientSelectorProps) {
  const patientsList = getPatientsList();

  return (
    <Select value={patientId} onValueChange={onPatientChange}>
      <SelectTrigger className={className ?? "w-[240px]"}>
        <SelectValue placeholder="Select patient" />
      </SelectTrigger>
      <SelectContent>
        {patientsList.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name} ({p.id}) · {p.bedNo}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
