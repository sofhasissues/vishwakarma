"use client";
import { useState } from "react";
import axios from "axios";

const verdictStyle: Record<string, { bg: string; color: string; label: string }> = {
  can_get_now: { bg: "#0a1f0a", color: "var(--success)", label: "Can get now" },
  after_roadmap: { bg: "#1a1200", color: "var(--warning)", label: "After roadmap" },
  out_of_reach: { bg: "#1a0a0a", color: "var(--destructive)", label: "Out of reach" },
};

export default function JobMatchCard({ jobs, parsedResume }: { jobs: any; parsedResume: any }) {
  const [tab, setTab] = useState<"can_get_now" | "after_roadmap" | "out_of_reach">("can_get_now");
  const [coverLetter, setCoverLetter] = useState<any>(null);
  const [loadingCover, setLoadingCover] = useState<string | null>(null);

  async function generateCoverLetter(job: any) {
    setLoadingCover(job.title + job.company);
    try {
      const res = await axios.post("/api/intelligence/cover-letter", {
        parsed_resume: parsedResume,
        job_title: job.title,
        company: job.company,
        job_skills: job.skills_required || [],
      });
      setCoverLetter({ job, letter: res.data });
    } catch { }
    setLoadingCover(null);
  }

  const tabs = ["can_get_now", "after_roadmap", "out_of_reach"] as const;
  const currentJobs = jobs[tab] || [];

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.75rem" }}>
      <h2 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "1.25rem" }}>Job Match Analysis</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "0.35rem 0.875rem", borderRadius: "100px", border: "none", cursor: "pointer", fontSize: "0.8rem",
            background: tab === t ? verdictStyle[t].bg : "var(--bg-elevated)",
            color: tab === t ? verdictStyle[t].color : "var(--text-muted)",
            fontWeight: tab === t ? 600 : 400,
          }}>
            {verdictStyle[t].label} ({(jobs[t] || []).length})
          </button>
        ))}
      </div>

      {/* Jobs list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {currentJobs.length === 0 && (
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
            No jobs in this category
          </p>
        )}
        {currentJobs.map((job: any, i: number) => (
          <div key={i} style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
            borderRadius: "8px", padding: "1rem",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.4rem" }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: "0.9rem" }}>{job.title}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{job.company} · {job.location}</p>
              </div>
              <span style={{
                fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "100px",
                background: verdictStyle[tab].bg, color: verdictStyle[tab].color,
              }}>
                {job.match_score}%
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{job.reason}</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none",
                  padding: "0.25rem 0.75rem", border: "1px solid var(--accent)", borderRadius: "6px",
                }}>
                  View Job
                </a>
              )}
              <button onClick={() => generateCoverLetter(job)} disabled={loadingCover === job.title + job.company} style={{
                fontSize: "0.75rem", color: "var(--text-muted)", background: "none",
                padding: "0.25rem 0.75rem", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer",
              }}>
                {loadingCover === job.title + job.company ? "Generating..." : "Cover Letter"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cover letter modal */}
      {coverLetter && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem",
        }} onClick={() => setCoverLetter(null)}>
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px",
            padding: "2rem", maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: 600 }}>Cover Letter — {coverLetter.job.company}</h3>
              <button onClick={() => setCoverLetter(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>×</button>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Subject: {coverLetter.letter.subject}</p>
            <div style={{ whiteSpace: "pre-wrap", fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {coverLetter.letter.body}
            </div>
            <button onClick={() => navigator.clipboard.writeText(coverLetter.letter.body)} style={{
              marginTop: "1rem", padding: "0.5rem 1rem", background: "var(--accent)", color: "#fff",
              border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem",
            }}>
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
