"use client";

const priorityColor: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b6b80",
};

export default function GapsCard({ data }: { data: any }) {
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.75rem" }}>
      <h2 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.5rem" }}>Skill Gap Analysis</h2>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>{data.summary}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Strong Skills</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {data.strong_skills?.map((s: string) => (
              <span key={s} style={{
                background: "#0a1f0a", color: "#22c55e",
                padding: "0.2rem 0.6rem", borderRadius: "100px", fontSize: "0.75rem",
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Skill Gaps</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {data.missing_skills?.map((gap: any) => (
          <div key={gap.skill} style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
            borderRadius: "8px", padding: "1rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{gap.skill}</span>
              <span style={{
                fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                color: priorityColor[gap.priority] || "var(--text-muted)",
              }}>{gap.priority}</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{gap.reason}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {gap.market_demand} JDs require this
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
