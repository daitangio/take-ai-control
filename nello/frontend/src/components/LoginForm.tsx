import { useState, type FormEvent } from "react";
import { useAuth } from "../state/AuthContext";
import { useTranslation } from "react-i18next";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onBackToIntro?: () => void;
}

export function LoginForm({ onSwitchToRegister, onBackToIntro }: LoginFormProps) {
  const { login, loading, error } = useAuth();
  const { t } = useTranslation();
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
          {t("auth.loginSubtitle")}
        </p>

        {toast && <div className="toast">{toast}</div>}
        {error && <div className="login-error">{error}</div>}

        <label htmlFor="login-email">{t("auth.email")}</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <label htmlFor="login-password">{t("auth.password")}</label>
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
            ? t("auth.pleaseWait")
            : t("auth.login")}
        </button>

        <p className="login-subtitle">
          <button type="button" className="login-toggle" onClick={onSwitchToRegister}>
            {t("auth.toRegister")}
          </button>
        </p>
        {onBackToIntro && (
          <button type="button" className="login-back" onClick={onBackToIntro}>
            {t("auth.backToIntro")}
          </button>
        )}
      </form>
    </div>
  );
}
