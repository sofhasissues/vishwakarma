"use client";
import { useState } from "react";
import { CheckCircle, Circle, Clock, ChevronDown } from "lucide-react";

const MOCK_ITEMS = [
  { id: "1", skill_name: "Data Visualization", resource_url: "https://www.tableau.com/learn", status: "in-progress", progress_pct: 45, deadline: "2026-04-01" },
  { id: "2", skill_name: "SQL Advanced", resource_url: "https://www.kaggle.com/learn/sql", status: "pending", progress_pct: 0, deadline: "2026-04-15" },
  { id: "3", skill_name: "Excel Dashboards", resource_url: "https://chandoo.org/wp/excel-dashboards", status: "pending", progress_pct: 0, deadline: "2026-04-22" },
  { id: "4", skill_name: "Data Modeling", resource_url: "https://www.edx.org/learn/data-modeling", status: "pending", progress_pct: 0, deadline: "2026-05-01" },
];

const statusIcon = (status: string) => {
  if (status === "completed") return <CheckCircle size={16} color="var(--success)" />;
  if (status === "in-progress") return <Clock size={16} color="var(--warning)" />;
  return <Circle size={16} color="var(--text-muted)" />;
};

const statusColor: Record<string, string> = {
  completed: "var(--success)",
  "in-progress": "var(--warning)",
  pending: "var(--text-muted)",
};

export default function TrackerPage() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [jobDeadline, setJobDeadline] = useState("2026-05-31");

  function updateStatus(id: string, status: string) {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, status, progress_pct: status === "completed" ? 100 : item.progress_pct } : item
    ));
  }

  function updateProgress(id: string, pct: number) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, progress_pct: pct } : item));
  }

  const completed = items.filter(i => i.status === "completed").length;
  const overallPct = Math.round((completed / items.length) * 100);

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

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Progress Tracker</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>Track your skills and certifications toward your job deadline.</p>

        {/* Job deadline */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Job Application Deadline</p>
            <input type="date" value={jobDeadline} onChange={e => setJobDeadline(e.target.value)} style={{
              background: "none", border: "none", color: "var(--text-primary)", fontSize: "1rem", fontWeight: 600, outline: "none", cursor: "pointer",
            }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: overallPct === 100 ? "var(--success)" : "var(--accent)" }}>{overallPct}%</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{completed}/{items.length} complete</p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", marginBottom: "2rem", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${overallPct}%`, background: "var(--accent)", borderRadius: "2px", transition: "width 0.3s" }} />
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "10px", padding: "1.25rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  {statusIcon(item.status)}
                  <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>{item.skill_name}</span>
                </div>
                <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)} style={{
                  background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "6px",
                  color: statusColor[item.status], fontSize: "0.75rem", padding: "0.25rem 0.5rem", cursor: "pointer", outline: "none",
                }}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Progress</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.progress_pct}%</span>
                </div>
                <input type="range" min={0} max={100} value={item.progress_pct}
                  onChange={e => updateProgress(item.id, parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <a href={item.resource_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none" }}>
                  View Resource →
                </a>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Due: {item.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
