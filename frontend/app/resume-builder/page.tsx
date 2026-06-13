"use client";
import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import axios from "axios";

export default function ResumeBuilderPage() {
  const [targetRole, setTargetRole] = useState("Data Analyst");
  const [rawData, setRawData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      let parsed = {};
      try { parsed = JSON.parse(rawData); } catch { parsed = { summary: rawData }; }

      const res = await axios.post("/api/resume-builder/generate-text", {
        parsed_data: parsed,
        target_role: targetRole,
        skill_gaps: [],
      }, { timeout: 60000 });
      setResult(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Generation failed");
    }
    setLoading(false);
  }

  async function copyText() {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <nav style={{
        borderBottom: "1px solid var(--border)", padding: "0 2rem", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "var(--bg-base)", zIndex: 100,
      }}>
        <a href="/" style={{ fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none", color: "var(--text-primary)" }}>
          Vishwakarma
        </a>
        <a href="/dashboard" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Resume Builder</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>
          Generate an ATS-optimized resume tailored to your target role.
        </p>

        {!result ? (
          <>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Target Role</label>
              <input value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{
                width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-surface)",
                border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
              }} />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Your Background (paste your current resume text or JSON from dashboard)
              </label>
              <textarea
                value={rawData}
                onChange={e => setRawData(e.target.value)}
                placeholder="Paste your resume text, skills, experience... anything you have"
                rows={12}
                style={{
                  width: "100%", padding: "0.875rem", background: "var(--bg-surface)",
                  border: "1px solid var(--border)", borderRadius: "8px",
                  color: "var(--text-primary)", fontSize: "0.875rem", outline: "none",
                  resize: "vertical", lineHeight: 1.6,
                }}
              />
            </div>

            {error && (
              <div style={{ color: "var(--destructive)", fontSize: "0.875rem", marginBottom: "1rem", padding: "0.75rem", background: "#1a0a0a", borderRadius: "6px" }}>
                {error}
              </div>
            )}

            <button onClick={handleGenerate} disabled={loading || !rawData.trim()} style={{
              width: "100%", padding: "0.875rem", borderRadius: "8px",
              background: rawData.trim() ? "var(--accent)" : "var(--bg-elevated)",
              color: rawData.trim() ? "#fff" : "var(--text-muted)",
              fontWeight: 600, fontSize: "0.95rem", border: "none",
              cursor: rawData.trim() ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            }}>
              {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Generate ATS Resume
            </button>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>Your ATS-Optimized Resume</h2>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={copyText} style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--border)",
                  background: "var(--bg-surface)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem",
                }}>
                  {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={() => setResult(null)} style={{
                  padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--border)",
                  background: "var(--bg-surface)", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem",
                }}>
                  Regenerate
                </button>
              </div>
            </div>

            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "12px", padding: "2rem",
              fontFamily: "monospace", fontSize: "0.8rem", lineHeight: 1.8,
              color: "var(--text-secondary)", whiteSpace: "pre-wrap",
              maxHeight: "70vh", overflowY: "auto",
            }}>
              {result.text}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
