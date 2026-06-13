"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      if (mode === "register") {
        const res = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.detail || "Registration failed");
          setLoading(false);
          return;
        }
      }
      const result = await signIn("credentials", {
        email, password, redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
            Vishwakarma
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            AI-native career intelligence
          </p>
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "2rem" }}>

          {/* Toggle */}
          <div style={{ display: "flex", background: "var(--bg-elevated)", borderRadius: "8px", padding: "4px", marginBottom: "1.5rem" }}>
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "0.5rem", borderRadius: "6px", border: "none", cursor: "pointer",
                background: mode === m ? "var(--bg-surface)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: mode === m ? 600 : 400, fontSize: "0.875rem",
                transition: "all 0.15s",
              }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} style={{
            width: "100%", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem",
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Form */}
          {mode === "register" && (
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Sophia Pradhan" style={{
                width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-elevated)",
                border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
              }} />
            </div>
          )}

          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={{
              width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-elevated)",
              border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
            }} />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{
              width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-elevated)",
              border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
            }} onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {error && (
            <div style={{ color: "var(--destructive)", fontSize: "0.8rem", marginBottom: "1rem", padding: "0.6rem", background: "#1a0a0a", borderRadius: "6px" }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "0.75rem", borderRadius: "8px",
            background: "var(--accent)", color: "#fff", fontWeight: 600,
            fontSize: "0.9rem", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          }}>
            {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </main>
  );
}
