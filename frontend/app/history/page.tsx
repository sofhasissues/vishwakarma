"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    // For demo, use a mock user ID — replace with real auth later
    axios.get("/api/history/interview/demo-user")
      .then(res => setHistory(res.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const avgScore = history.length
    ? Math.round(history.reduce((a, h) => a + (h.overall_score || 0), 0) / history.length)
    : 0;

  const scoreColor = (s: number) => s >= 7 ? "var(--success)" : s >= 5 ? "var(--warning)" : "var(--destructive)";

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
        <a href="/interview" style={{ fontSize: "0.875rem", color: "var(--accent)", textDecoration: "none" }}>New Interview →</a>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Interview History</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>Track your performance over time.</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", textAlign: "center" }}>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>{history.length}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Sessions</p>
          </div>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", textAlign: "center" }}>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: scoreColor(avgScore) }}>{avgScore}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/10</span></p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Avg Score</p>
          </div>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", textAlign: "center" }}>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--success)" }}>
              {history.filter(h => h.recommendation === "yes" || h.recommendation === "strong yes").length}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Positive Outcomes</p>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Loading...</p>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No interviews yet.</p>
            <a href="/interview" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Start your first interview →</a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {history.map((h, i) => (
              <div key={i} onClick={() => setSelected(selected?.id === h.id ? null : h)} style={{
                background: "var(--bg-surface)", border: `1px solid ${selected?.id === h.id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "10px", padding: "1.25rem", cursor: "pointer", transition: "border-color 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "0.95rem" }}>{h.target_role} — {h.round_type === "technical" ? "Technical" : "HR"} Round</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      {new Date(h.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 700, color: scoreColor(h.overall_score) }}>
                      {h.overall_score}<span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>/10</span>
                    </span>
                    <span style={{
                      fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "100px",
                      background: h.recommendation?.includes("yes") ? "#0a1f0a" : "#1a1200",
                      color: h.recommendation?.includes("yes") ? "var(--success)" : "var(--warning)",
                      textTransform: "capitalize", fontWeight: 600,
                    }}>
                      {h.recommendation}
                    </span>
                  </div>
                </div>

                {selected?.id === h.id && h.feedback && (
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Feedback</p>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {h.feedback.detailed_feedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
