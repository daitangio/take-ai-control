import { useState, type FormEvent } from "react";
import { useAuth } from "../state/AuthContext";
import { useTranslation } from "react-i18next";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register, loading, error } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [keyPass, setKeyPass] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await register(email, keyPass, password);
    } catch {
      // Error is already set in AuthContext
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Nello RuleZ</h2>
        <p className="login-subtitle">
          {t("auth.registerSubtitle")}
        </p>

        {error && <div className="login-error">{error}</div>}

        <label htmlFor="register-email">{t("auth.email")}</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <label htmlFor="register-key">{t("auth.invitationKey")}</label>
        <input
          id="register-key"
          type="text"
          value={keyPass}
          onChange={(e) => setKeyPass(e.target.value)}
          required
        />

        <label htmlFor="register-password">{t("auth.password")}</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={12}
        />

        <button type="submit" disabled={loading}>
          {loading ? t("auth.pleaseWait") : t("auth.register")}
        </button>

        <p className="login-subtitle">
          <button type="button" className="login-toggle" onClick={onSwitchToLogin}>
            {t("auth.toLogin")}
          </button>
        </p>
      </form>
    </div>
  );
}
