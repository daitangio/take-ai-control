import { useState, type FormEvent } from "react";
import { useAuth } from "../state/AuthContext";

export function LoginForm() {
  const { login, register, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(email, password);
        setToast("Account created!");
      } else {
        await login(email, password);
      }
    } catch {
      // Error is already set in AuthContext
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Nello</h2>
        <p className="login-subtitle">
          {isRegister ? "Create an account" : "Sign in to your boards"}
        </p>

        {toast && <div className="toast">{toast}</div>}
        {error && <div className="login-error">{error}</div>}

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        <label htmlFor="login-password">Password</label>
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
            ? "Please wait..."
            : isRegister
              ? "Register"
              : "Login"}
        </button>

        <button
          type="button"
          className="login-toggle"
          onClick={() => {
            setIsRegister(!isRegister);
            setToast(null);
          }}
        >
          {isRegister
            ? "Already have an account? Sign in"
            : "No account? Create one"}
        </button>
      </form>
    </div>
  );
}
