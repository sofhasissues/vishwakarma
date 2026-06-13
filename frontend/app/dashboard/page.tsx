"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Upload, Loader2, ChevronRight, Copy, Check } from "lucide-react";
import axios from "axios";
import ResumeCard from "@/components/ResumeCard";
import GapsCard from "@/components/GapsCard";
import RoadmapCard from "@/components/RoadmapCard";
import ATSCard from "@/components/ATSCard";
import JobMatchCard from "@/components/JobMatchCard";
import CGPACard from "@/components/CGPACard";

const api = axios.create({ baseURL: "" });


type Step = "upload" | "parsing" | "done";

export default function Dashboard() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const [copied, setCopied] = useState(false);

  function copyUserId() {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Data Analyst");
  const [targetLocation, setTargetLocation] = useState("Bangalore");
  const [parsed, setParsed] = useState<any>(null);
  const [ats, setAts] = useState<any>(null);
  const [gaps, setGaps] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [jobMatches, setJobMatches] = useState<any>(null);
  const [cgpa, setCgpa] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  async function handleAnalyze() {
    if (!file) return;
    setStep("parsing");
    setError(null);

    try {
      // 1. Parse resume
      setLoadingMsg("Parsing your resume...");
      const form1 = new FormData();
      form1.append("file", file);
      const parsedRes = await api.post(
        `/api/resume/parse?target_role=${encodeURIComponent(targetRole)}&target_location=${encodeURIComponent(targetLocation)}`,
        form1, { timeout: 60000 }
      );
      setParsed(parsedRes.data);

      // 2. ATS check (parallel with skill gap analysis)
      setLoadingMsg("Running ATS analysis & scraping job market...");
      const form2 = new FormData();
      form2.append("file", file);
      const [atsRes, gapsRes] = await Promise.all([
        api.post(`/api/intelligence/ats?target_role=${encodeURIComponent(targetRole)}`, form2, { timeout: 60000 }),
        api.post(`/api/analysis/gaps?target_role=${encodeURIComponent(targetRole)}&target_location=${encodeURIComponent(targetLocation)}`, form2, { timeout: 180000 }).catch(() => null),
      ]);
      setAts(atsRes.data);
      if (gapsRes) setGaps(gapsRes.data);

      // 3. CGPA context (if available)
      const edu = parsedRes.data.education?.[0];
      if (edu?.cgpa && edu?.institution) {
        const cgpaRes = await api.post("/api/intelligence/cgpa-context", {
          cgpa: edu.cgpa,
          institution: edu.institution,
          target_role: targetRole,
        }, { timeout: 30000 }).catch(() => null);
        if (cgpaRes) setCgpa(cgpaRes.data);
      }

      // 4. Roadmap from gaps
      setLoadingMsg("Building your personalized roadmap...");
      if (gapsRes?.data?.missing_skills) {
        const roadmapRes = await api.post("/api/roadmap/from-gaps", {
          skill_gaps: gapsRes.data.missing_skills,
          existing_skills: parsedRes.data.skills,
          target_role: targetRole,
          target_location: targetLocation,
        }, { timeout: 60000 }).catch(() => null);
        if (roadmapRes) setRoadmap(roadmapRes.data);
      }

      // 5. Job matching
      setLoadingMsg("Matching you to jobs...");
      const candidateSkills = parsedRes.data.skills || [];
      if (candidateSkills.length > 0) {
        const marketRes = await api.get(
          `/api/analysis/market?role=${encodeURIComponent(targetRole)}&location=${encodeURIComponent(targetLocation)}`,
          { timeout: 180000 }
        ).catch(() => null);
        const marketJobs = marketRes?.data?.jobs || [];
        if (marketJobs.length > 0) {
          const matchRes = await api.post("/api/intelligence/match-jobs", {
            candidate_skills: candidateSkills,
            jobs: marketJobs,
          }, { timeout: 60000 }).catch(() => null);
          if (matchRes) setJobMatches(matchRes.data);
        }
      }

      setStep("done");
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Something went wrong.";
      setError(msg);
      setStep("upload");
    }
  }

  function resetAll() {
    setStep("upload"); setFile(null); setParsed(null); setAts(null);
    setGaps(null); setRoadmap(null); setJobMatches(null); setCgpa(null);
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
        {step === "done" && (
          <a href="/interview" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--accent)", fontSize: "0.875rem", textDecoration: "none", fontWeight: 500 }}>
            Start Interview <ChevronRight size={14} />
          </a>
        )}
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem" }}>
        {step === "upload" && (
          <>
            {/* User ID banner */}
            {userId && (
              <div style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "0.875rem 1.25rem",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.25rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Your User ID</p>
                  <p style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-secondary)", wordBreak: "break-all" }}>{userId}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Use this in <a href="/settings" style={{ color: "var(--accent)", textDecoration: "none" }}>Notification Settings</a></p>
                </div>
                <button onClick={copyUserId} title="Copy user ID" style={{
                  flexShrink: 0,
                  background: copied ? "var(--accent-subtle)" : "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.5rem 0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: copied ? "var(--accent)" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}

            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
              Analyze your resume
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>
              Upload your resume. Get ATS score, skill gaps, job matches, and a personalized roadmap.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Target Role</label>
                <input value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{
                  width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-surface)",
                  border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
                }} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Target Location</label>
                <input value={targetLocation} onChange={e => setTargetLocation(e.target.value)} style={{
                  width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-surface)",
                  border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
                }} />
              </div>
            </div>

            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              border: `2px dashed ${file ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "12px", padding: "3rem 2rem", cursor: "pointer",
              background: file ? "var(--accent-subtle)" : "var(--bg-surface)",
              transition: "all 0.2s", marginBottom: "1.5rem",
            }}>
              <Upload size={28} color={file ? "var(--accent)" : "var(--text-muted)"} style={{ marginBottom: "0.75rem" }} />
              <span style={{ fontWeight: 500, color: file ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.95rem" }}>
                {file ? file.name : "Click to upload resume"}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>PDF or DOCX</span>
              <input type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>

            {error && (
              <div style={{ color: "var(--destructive)", fontSize: "0.875rem", marginBottom: "1rem", padding: "0.75rem", background: "#1a0a0a", borderRadius: "6px", border: "1px solid #3a1010" }}>
                {error}
              </div>
            )}

            <button onClick={handleAnalyze} disabled={!file} style={{
              width: "100%", padding: "0.875rem", borderRadius: "8px",
              background: file ? "var(--accent)" : "var(--bg-elevated)",
              color: file ? "#fff" : "var(--text-muted)",
              fontWeight: 600, fontSize: "0.95rem", border: "none",
              cursor: file ? "pointer" : "not-allowed",
            }}>
              Analyze Resume
            </button>
          </>
        )}

        {step === "parsing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1.5rem" }}>
            <Loader2 size={36} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>{loadingMsg}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>This takes about 2-3 minutes</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {step === "done" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Your Career Analysis</h1>
              <button onClick={resetAll} style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
                Start over
              </button>
            </div>
            {parsed && <ResumeCard data={parsed} />}
            {ats && <ATSCard data={ats} />}
            {cgpa && <CGPACard data={cgpa} />}
            {gaps && <GapsCard data={gaps} />}
            {roadmap && <RoadmapCard data={roadmap} />}
            {jobMatches && <JobMatchCard jobs={jobMatches} parsedResume={parsed} />}
          </div>
        )}
      </div>
    </main>
  );
}
