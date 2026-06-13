"use client";

const verdictColor: Record<string, string> = {
  strong: "var(--success)",
  acceptable: "var(--warning)",
  weak: "var(--destructive)",
};

export default function CGPACard({ data }: { data: any }) {
  if (!data || !data.institution_tier) return null;
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.75rem" }}>
      <h2 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "1.25rem" }}>Academic Context</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "0.875rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Institution</p>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--accent)" }}>{data.institution_tier}</p>
        </div>
        <div style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "0.875rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Percentile</p>
          <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{data.cgpa_percentile}</p>
        </div>
        <div style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "0.875rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Verdict</p>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: verdictColor[data.cgpa_verdict] || "var(--text-primary)", textTransform: "capitalize" }}>{data.cgpa_verdict}</p>
        </div>
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>{data.market_context}</p>
      <p style={{ fontSize: "0.8rem", color: "var(--accent)" }}>→ {data.advice}</p>
    </div>
  );
}
