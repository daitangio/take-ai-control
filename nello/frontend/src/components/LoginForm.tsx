import { useState, type FormEvent } from "react";
import { useLingui } from "@lingui/macro";
import { useAuth } from "../state/AuthContext";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { t } = useLingui();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [toast, _setToast] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
        await login(email, password);
    } catch {
      // Error is already set in AuthContext
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Nello RuleZ</h2>
        <p className="login-subtitle">
          {t`Sign in to your boards`}
        </p>

        {toast && <div className="toast">{toast}</div>}
        {error && <div className="login-error">{error}</div>}

        <label htmlFor="login-email">{t`Email`}</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <label htmlFor="login-password">{t`Password`}</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={1}
        />

        <button type="submit" disabled={loading}>
          {loading
            ? t`Please wait...`
            : t`Login`}
        </button>

        <p className="login-subtitle">
          <button type="button" className="login-toggle" onClick={onSwitchToRegister}>
            {t`Don't have an account? Register`}
          </button>
        </p>
      </form>
    </div>
  );
}
