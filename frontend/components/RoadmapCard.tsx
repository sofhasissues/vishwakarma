"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

export default function RoadmapCard({ data }: { data: any }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <h2 style={{ fontWeight: 600, fontSize: "0.95rem" }}>Your Roadmap</h2>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{data.total_weeks} weeks</span>
      </div>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>{data.summary}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {data.weekly_plan?.map((week: any) => (
          <div key={week.week} style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden",
          }}>
            <button
              onClick={() => setExpanded(expanded === week.week ? null : week.week)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.875rem 1rem", background: "none", border: "none", cursor: "pointer",
                color: "var(--text-primary)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{
                  width: "24px", height: "24px", borderRadius: "50%", background: "var(--accent-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 600, color: "var(--accent)", flexShrink: 0,
                }}>{week.week}</span>
                <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{week.focus}</span>
              </div>
              {expanded === week.week ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
            </button>

            {expanded === week.week && (
              <div style={{ padding: "0 1rem 1rem" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Tasks</p>
                <ul style={{ paddingLeft: "1.1rem", marginBottom: "0.875rem" }}>
                  {week.tasks?.map((t: string, i: number) => (
                    <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.2rem" }}>{t}</li>
                  ))}
                </ul>

                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Resources</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.875rem" }}>
                  {week.resources?.map((r: any, i: number) => (
                    <a key={i} href={r.url || "#"} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", alignItems: "center", gap: "0.4rem",
                      fontSize: "0.85rem", color: "var(--accent)", textDecoration: "none",
                    }}>
                      <ExternalLink size={12} />
                      {r.title}
                    </a>
                  ))}
                </div>

                <div style={{ background: "var(--accent-subtle)", borderRadius: "6px", padding: "0.6rem 0.875rem" }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600, marginBottom: "0.2rem" }}>DELIVERABLE</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{week.deliverable}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
