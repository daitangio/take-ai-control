import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { login, register, setToken, getToken } from "../api";

interface AuthState {
  token: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokenState, setTokenState] = useState<string | null>(getToken());
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async (e: string, p: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await login(e, p);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setEmail(e);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      console.debug("[nello:api] login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (e: string, p: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await register(e, p);
      setToken(res.access_token);
      setTokenState(res.access_token);
      setEmail(e);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      console.debug("[nello:api] register failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setEmail(null);
    setError(null);
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        token: tokenState,
        email,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
