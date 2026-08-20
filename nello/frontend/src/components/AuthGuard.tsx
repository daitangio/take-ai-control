import { useState, type ReactNode } from "react";
import { AuthProvider, useAuth } from "../state/AuthContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { IntroPage } from "./IntroPage";

function Inner({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [mode, setMode] = useState<"intro" | "login" | "register">("intro");

  if (!token) {
    if (mode === "intro") {
      return <IntroPage onSignIn={() => setMode("login")} onRegister={() => setMode("register")} />;
    }
    if (mode === "register") {
      return <RegisterForm onSwitchToLogin={() => setMode("login")} onBackToIntro={() => setMode("intro")} />;
    }
    return <LoginForm onSwitchToRegister={() => setMode("register")} onBackToIntro={() => setMode("intro")} />;
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
