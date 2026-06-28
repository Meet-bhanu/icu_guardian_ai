import AppLayout, { patientNavItems } from "@/components/AppLayout";
import { usePatientAuth } from "@/hooks/usePatientAuth";

function getInitials(name?: string | null): string {
  if (!name) return "PT";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const { user, session, logout } = usePatientAuth();

  return (
    <AppLayout
      navItems={patientNavItems}
      userName={user?.name ?? "Patient"}
      userRole={`${session?.bedNo ?? "ICU-01"} · ${session?.patientId ?? "P001"}`}
      userInitials={getInitials(user?.name)}
      logoutPath="/login"
      onLogout={logout}
      searchPlaceholder="Search your records..."
    >
      {children}
    </AppLayout>
  );
}
