import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { requestMagicLink } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const jwt = useAuthStore((state) => state.jwt);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (jwt) {
    return <Navigate to="/boards" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await requestMagicLink(email);
      if (response.mockToken) {
        navigate(`/auth/callback?token=${encodeURIComponent(response.mockToken)}`);
        return;
      }
      setMessage(response.message ?? "Check your email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>nello</h1>
        <p className="muted">Sign in with your email magic link.</p>
        <form className="stack" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
          <button type="submit" className="primary-button" disabled={loading || !email.trim()}>
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>
        {message ? <p className="success-text">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}
      </section>
    </main>
  );
}
