import { useState, type FormEvent } from "react";
import { useLingui } from "@lingui/macro";
import { useAuth } from "../state/AuthContext";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { t } = useLingui();
  const { register, loading, error } = useAuth();
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
          {t`Create your account`}
        </p>

        {error && <div className="login-error">{error}</div>}

        <label htmlFor="register-email">{t`Email`}</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <label htmlFor="register-key">{t`Invitation key`}</label>
        <input
          id="register-key"
          type="text"
          value={keyPass}
          onChange={(e) => setKeyPass(e.target.value)}
          required
        />

        <label htmlFor="register-password">{t`Password`}</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={12}
        />

        <button type="submit" disabled={loading}>
          {loading ? t`Please wait...` : t`Register`}
        </button>

        <p className="login-subtitle">
          <button type="button" className="login-toggle" onClick={onSwitchToLogin}>
            {t`Already have an account? Login`}
          </button>
        </p>
      </form>
    </div>
  );
}
