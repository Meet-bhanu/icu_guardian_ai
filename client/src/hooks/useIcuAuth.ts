import { useCallback, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type SafeUser = {
  id: string;
  openId: string;
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  loginMethod: string | null;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
  patient?: Record<string, unknown>;
  doctor?: Record<string, unknown>;
};

type IcuAuthState = {
  user: SafeUser | null;
  loading: boolean;
  isAuthenticated: boolean;
};

// Demo user mapping (temporary until Firestore is properly configured)
const DEMO_USER_MAP: Record<string, { role: string; name: string }> = {
  "superadmin@healthhalo.demo": { role: "admin", name: "Administrator" },
  "doc0001@healthhalo.demo": { role: "doctor", name: "Dr. John Smith" },
  "icu0001@healthhalo.demo": { role: "patient", name: "Jane Doe" },
};

let cachedUser: SafeUser | null = null;

function createSafeUser(firebaseUser: FirebaseUser, role: string): SafeUser {
  const demoInfo = DEMO_USER_MAP[firebaseUser.email || ""] || { role: "patient", name: "Demo User" };
  return {
    id: firebaseUser.uid,
    openId: firebaseUser.uid,
    username: firebaseUser.email?.replace("@healthhalo.demo", "") || null,
    name: demoInfo.name,
    email: firebaseUser.email,
    phone: null,
    role: role,
    isActive: true,
    loginMethod: "email",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString(),
  };
}

export function useIcuAuth() {
  const [state, setState] = useState<IcuAuthState>({
    user: cachedUser,
    loading: !cachedUser,
    isAuthenticated: Boolean(cachedUser),
  });

  const refresh = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const email = currentUser.email || "";
      const demoInfo = DEMO_USER_MAP[email];
      if (demoInfo) {
        const user = createSafeUser(currentUser, demoInfo.role);
        cachedUser = user;
        setState({ user, loading: false, isAuthenticated: true });
        return user;
      }
    }
    cachedUser = null;
    setState({ user: null, loading: false, isAuthenticated: false });
    return null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const email = firebaseUser.email || "";
        const demoInfo = DEMO_USER_MAP[email];
        if (demoInfo) {
          const user = createSafeUser(firebaseUser, demoInfo.role);
          cachedUser = user;
          setState({ user, loading: false, isAuthenticated: true });
        } else {
          cachedUser = null;
          setState({ user: null, loading: false, isAuthenticated: false });
        }
      } else {
        cachedUser = null;
        setState({ user: null, loading: false, isAuthenticated: false });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (credentials: { username: string; password: string; role: string }) => {
    try {
      const email = `${credentials.username}@healthhalo.demo`;
      const userCredential = await signInWithEmailAndPassword(auth, email, credentials.password);
      
      const demoInfo = DEMO_USER_MAP[email];
      if (!demoInfo) {
        await signOut(auth);
        throw new Error("User not found. Please contact administrator.");
      }
      
      if (demoInfo.role !== credentials.role) {
        await signOut(auth);
        throw new Error(`Invalid role. This account is registered as ${demoInfo.role}.`);
      }
      
      const user = createSafeUser(userCredential.user, demoInfo.role);
      cachedUser = user;
      setState({ user, loading: false, isAuthenticated: true });
      return user;
    } catch (error: any) {
      await signOut(auth);
      cachedUser = null;
      setState({ user: null, loading: false, isAuthenticated: false });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } finally {
      cachedUser = null;
      sessionStorage.removeItem("icu-admin-logged-in");
      sessionStorage.removeItem("icu-patient-session");
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  }, []);

  return { ...state, login, logout, refresh };
}
