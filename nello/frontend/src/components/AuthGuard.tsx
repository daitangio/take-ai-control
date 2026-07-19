import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "../state/AuthContext";
import { LoginForm } from "./LoginForm";

function Inner({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  if (!token) {
    return <LoginForm />;
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
