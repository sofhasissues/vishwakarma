"use client";

export default function ResumeCard({ data }: { data: any }) {
  return (
    <div 
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "16px", padding: "2.5rem" }}
      className="hover-lift animate-fade-in"
    >
      <h2 style={{ 
        fontWeight: 600, 
        fontSize: "1.1rem", 
        marginBottom: "2rem", 
        color: "var(--text-primary)",
        letterSpacing: "-0.02em"
      }}>
        Parsed Intelligence
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Candidate Name</p>
          <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)" }}>{data.full_name || "—"}</p>
        </div>
        <div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact Email</p>
          <p style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{data.email || "—"}</p>
        </div>
      </div>

      <div style={{ marginTop: "2.5rem" }}>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Expertise & Skills</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
          {data.skills?.map((s: string) => (
            <span key={s} style={{
              background: "var(--bg-elevated)", color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              padding: "0.4rem 1rem", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 500,
            }}>{s}</span>
          ))}
        </div>
      </div>

      {data.education?.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Academic Background</p>
          {data.education.map((e: any, i: number) => (
            <div key={i} style={{ marginBottom: "1rem", borderLeft: "2px solid var(--border-subtle)", paddingLeft: "1.5rem" }}>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{e.degree} — {e.field}</p>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{e.institution} {e.cgpa ? `· ${e.cgpa} CGPA` : ""}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
