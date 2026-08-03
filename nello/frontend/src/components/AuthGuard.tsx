import { useState, type ReactNode } from "react";
import { AuthProvider, useAuth } from "../state/AuthContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

function Inner({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");

  if (!token) {
    if (mode === "register") {
      return <RegisterForm onSwitchToLogin={() => setMode("login")} />;
    }
    return <LoginForm onSwitchToRegister={() => setMode("register")} />;
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Inner>{children}</Inner>
    </AuthProvider>
  );
}
