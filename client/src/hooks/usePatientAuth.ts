import { useMemo } from "react";
import { useIcuAuth } from "@/hooks/useIcuAuth";

export function usePatientAuth() {
  const auth = useIcuAuth();

  const patientUser = useMemo(() => {
    if (auth.user?.role === "patient") {
      return auth.user;
    }
    return null;
  }, [auth.user]);

  const session = useMemo(() => {
    if (!patientUser) return null;
    const patient = patientUser.patient as {
      patientPublicId?: string;
      bedNumber?: string;
    } | undefined;
    return {
      patientId: patient?.patientPublicId ?? "",
      name: patientUser.name ?? "",
      email: patientUser.email ?? "",
      role: "patient" as const,
      bedNo: patient?.bedNumber ?? "",
    };
  }, [patientUser]);

  return {
    user: patientUser,
    session,
    loading: auth.loading,
    isPatient: Boolean(patientUser),
    logout: auth.logout,
  };
}
