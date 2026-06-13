"use client";
import { useState } from "react";

export default function ATSCard({ data }: { data: any }) {
  const [expanded, setExpanded] = useState(false);
  const score = data.ats_score;
  const color = score >= 75 ? "var(--success)" : score >= 50 ? "var(--warning)" : "var(--destructive)";

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ fontWeight: 600, fontSize: "0.95rem" }}>ATS Compatibility</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "2rem", fontWeight: 700, color }}>{score}</span>
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px", marginBottom: "1rem" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: "3px", transition: "width 0.5s" }} />
      </div>

      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>{data.summary}</p>

      <button onClick={() => setExpanded(!expanded)} style={{
        background: "none", border: "none", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer", padding: 0,
      }}>
        {expanded ? "Hide details" : "Show details"}
      </button>

      {expanded && (
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {data.missing_keywords?.length > 0 && (
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--warning)", fontWeight: 600, marginBottom: "0.5rem" }}>MISSING KEYWORDS</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {data.missing_keywords.map((k: string) => (
                  <span key={k} style={{ background: "#1a1200", color: "var(--warning)", padding: "0.2rem 0.6rem", borderRadius: "100px", fontSize: "0.75rem" }}>{k}</span>
                ))}
              </div>
            </div>
          )}
          {data.formatting_issues?.length > 0 && (
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--destructive)", fontWeight: 600, marginBottom: "0.5rem" }}>FORMATTING ISSUES</p>
              {data.formatting_issues.map((i: string, idx: number) => (
                <p key={idx} style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>· {i}</p>
              ))}
            </div>
          )}
          {data.suggested_fixes?.length > 0 && (
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600, marginBottom: "0.5rem" }}>SUGGESTED FIXES</p>
              {data.suggested_fixes.map((f: string, idx: number) => (
                <p key={idx} style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>· {f}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
