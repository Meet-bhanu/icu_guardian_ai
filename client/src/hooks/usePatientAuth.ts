import { useAuth } from "@/_core/hooks/useAuth";
import { useMemo } from "react";
import {
  clearPatientSession,
  getPatientSession,
  type PatientSession,
} from "@/lib/patientSession";

export function usePatientAuth() {
  const auth = useAuth();
  const demoSession = getPatientSession();

  const patientUser = useMemo(() => {
    if (auth.user?.role === "patient") {
      return auth.user;
    }
    if (demoSession) {
      return {
        id: 0,
        openId: demoSession.patientId,
        name: demoSession.name,
        email: demoSession.email,
        loginMethod: "demo",
        role: "patient" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };
    }
    return null;
  }, [auth.user, demoSession]);

  const session = demoSession as PatientSession | null;

  const logout = async () => {
    clearPatientSession();
    await auth.logout();
  };

  return {
    user: patientUser,
    session,
    loading: auth.loading,
    isPatient: Boolean(patientUser),
    logout,
  };
}
