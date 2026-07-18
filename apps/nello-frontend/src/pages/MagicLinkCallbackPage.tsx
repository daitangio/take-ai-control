import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyMagicToken } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export function MagicLinkCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Missing token");
      return;
    }

    void (async () => {
      try {
        const response = await verifyMagicToken(token);
        setAuth(response.jwt, response.email);
        navigate("/boards", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to verify token");
      }
    })();
  }, [navigate, params, setAuth]);

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>Signing you in…</h1>
        {error ? <p className="error-text">{error}</p> : <p className="muted">Verifying magic link.</p>}
      </section>
    </main>
  );
}
