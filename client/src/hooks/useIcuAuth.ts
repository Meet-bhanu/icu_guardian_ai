import { useCallback, useEffect, useState } from "react";
import {
  getMeApi,
  loginApi,
  logoutApi,
  type LoginCredentials,
  type SafeUser,
} from "@/lib/authApi";

type IcuAuthState = {
  user: SafeUser | null;
  loading: boolean;
  isAuthenticated: boolean;
};

let cachedUser: SafeUser | null = null;
let fetchPromise: Promise<SafeUser | null> | null = null;

async function fetchCurrentUser(): Promise<SafeUser | null> {
  try {
    const { user } = await getMeApi();
    cachedUser = user;
    return user;
  } catch {
    cachedUser = null;
    return null;
  }
}

export function useIcuAuth() {
  const [state, setState] = useState<IcuAuthState>({
    user: cachedUser,
    loading: !cachedUser,
    isAuthenticated: Boolean(cachedUser),
  });

  const refresh = useCallback(async () => {
    if (!fetchPromise) {
      fetchPromise = fetchCurrentUser().finally(() => {
        fetchPromise = null;
      });
    }
    const user = await fetchPromise;
    setState({ user, loading: false, isAuthenticated: Boolean(user) });
    return user;
  }, []);

  useEffect(() => {
    if (!cachedUser) {
      refresh();
    }
  }, [refresh]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user } = await loginApi(credentials);
    cachedUser = user;
    setState({ user, loading: false, isAuthenticated: true });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      cachedUser = null;
      sessionStorage.removeItem("icu-admin-logged-in");
      sessionStorage.removeItem("icu-patient-session");
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  }, []);

  return { ...state, login, logout, refresh };
}
