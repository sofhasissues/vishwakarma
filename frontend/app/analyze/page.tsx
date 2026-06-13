"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Upload, Loader2, Lock } from "lucide-react";
import axios from "axios";
import ResumeCard from "@/components/ResumeCard";
import ATSCard from "@/components/ATSCard";
import GapsCard from "@/components/GapsCard";

// ── Cursor-following orbs ──────────────────────────────────────────────────
function CursorOrbs() {
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const orb3 = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const curr1 = useRef({ x: 200, y: 300 });
  const curr2 = useRef({ x: 0, y: 200 });
  const curr3 = useRef({ x: 0, y: 0 });
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    pos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    curr2.current.x = window.innerWidth - 300;
    curr3.current = { x: window.innerWidth / 2, y: window.innerHeight - 200 };
    const onMove = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      curr1.current.x = lerp(curr1.current.x, pos.current.x - 200, 0.04);
      curr1.current.y = lerp(curr1.current.y, pos.current.y - 200, 0.04);
      curr2.current.x = lerp(curr2.current.x, pos.current.x + 60,  0.025);
      curr2.current.y = lerp(curr2.current.y, pos.current.y - 120, 0.025);
      curr3.current.x = lerp(curr3.current.x, pos.current.x - 80,  0.015);
      curr3.current.y = lerp(curr3.current.y, pos.current.y + 80,  0.015);
      if (orb1.current) orb1.current.style.transform = `translate(${curr1.current.x}px, ${curr1.current.y}px)`;
      if (orb2.current) orb2.current.style.transform = `translate(${curr2.current.x}px, ${curr2.current.y}px)`;
      if (orb3.current) orb3.current.style.transform = `translate(${curr3.current.x}px, ${curr3.current.y}px)`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf.current!); };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div ref={orb1} style={{ position: "absolute", top: 0, left: 0, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, hsla(230, 85%, 60%, 0.25) 0%, transparent 70%)", willChange: "transform" }} />
      <div ref={orb2} style={{ position: "absolute", top: 0, left: 0, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, hsla(280, 70%, 55%, 0.2) 0%, transparent 70%)", willChange: "transform" }} />
      <div ref={orb3} style={{ position: "absolute", top: 0, left: 0, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, hsla(190, 80%, 55%, 0.2) 0%, transparent 70%)", willChange: "transform" }} />
    </div>
  );
}

// ── Dot grid background ────────────────────────────────────────────────────
function DotGrid() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.4 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="hsl(40,18%,52%)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>
    </div>
  );
}

// ── Floating paper sheets ──────────────────────────────────────────────────
function FloatingPaper() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {/* Sheet 1 — left */}
      <div style={{ position: "absolute", top: "12%", left: "4%", animation: "paperFloat1 7s ease-in-out infinite" }}>
        <svg width="80" height="100" viewBox="0 0 80 100" fill="none" style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }}>
          <rect x="1" y="1" width="78" height="98" rx="5" fill="hsl(40,20%,24%)" stroke="hsl(40,28%,44%)" strokeWidth="1.2"/>
          <rect x="10" y="14" width="28" height="5" rx="2.5" fill="hsl(40,35%,58%)"/>
          <rect x="10" y="27" width="60" height="2.5" rx="1.25" fill="hsl(40,18%,42%)"/>
          <rect x="10" y="34" width="48" height="2.5" rx="1.25" fill="hsl(40,18%,42%)"/>
          <rect x="10" y="41" width="54" height="2.5" rx="1.25" fill="hsl(40,18%,42%)"/>
          <rect x="10" y="48" width="40" height="2.5" rx="1.25" fill="hsl(40,18%,42%)"/>
          <rect x="10" y="59" width="55" height="2.5" rx="1.25" fill="hsl(40,16%,38%)"/>
          <rect x="10" y="66" width="44" height="2.5" rx="1.25" fill="hsl(40,16%,38%)"/>
          <rect x="10" y="73" width="50" height="2.5" rx="1.25" fill="hsl(40,16%,38%)"/>
          <rect x="10" y="80" width="36" height="2.5" rx="1.25" fill="hsl(40,16%,38%)"/>
          <rect x="10" y="55" width="60" height="0.8" rx="0.4" fill="hsl(40,28%,36%)"/>
        </svg>
      </div>
      {/* Sheet 2 — top right */}
      <div style={{ position: "absolute", top: "6%", right: "5%", animation: "paperFloat2 9s ease-in-out infinite" }}>
        <svg width="64" height="82" viewBox="0 0 64 82" fill="none" style={{ transform: "rotate(14deg)", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.45))" }}>
          <rect x="1" y="1" width="62" height="80" rx="4" fill="hsl(40,18%,22%)" stroke="hsl(40,25%,40%)" strokeWidth="1.2"/>
          <rect x="8" y="12" width="20" height="4" rx="2" fill="hsl(40,32%,52%)"/>
          <rect x="8" y="22" width="48" height="2" rx="1" fill="hsl(40,16%,40%)"/>
          <rect x="8" y="28" width="38" height="2" rx="1" fill="hsl(40,16%,40%)"/>
          <rect x="8" y="34" width="44" height="2" rx="1" fill="hsl(40,16%,40%)"/>
          <rect x="8" y="40" width="30" height="2" rx="1" fill="hsl(40,16%,40%)"/>
          <rect x="8" y="50" width="42" height="2" rx="1" fill="hsl(40,14%,36%)"/>
          <rect x="8" y="56" width="34" height="2" rx="1" fill="hsl(40,14%,36%)"/>
          <rect x="8" y="62" width="40" height="2" rx="1" fill="hsl(40,14%,36%)"/>
        </svg>
      </div>
      {/* Sheet 3 — mid right */}
      <div style={{ position: "absolute", top: "40%", right: "2%", animation: "paperFloat3 11s ease-in-out infinite" }}>
        <svg width="52" height="66" viewBox="0 0 52 66" fill="none" style={{ transform: "rotate(-10deg)", filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.4))" }}>
          <rect x="1" y="1" width="50" height="64" rx="3" fill="hsl(40,16%,20%)" stroke="hsl(40,22%,38%)" strokeWidth="1"/>
          <rect x="7" y="10" width="16" height="3.5" rx="1.5" fill="hsl(40,28%,50%)"/>
          <rect x="7" y="19" width="38" height="1.8" rx="0.9" fill="hsl(40,14%,38%)"/>
          <rect x="7" y="24" width="30" height="1.8" rx="0.9" fill="hsl(40,14%,38%)"/>
          <rect x="7" y="29" width="34" height="1.8" rx="0.9" fill="hsl(40,14%,38%)"/>
          <rect x="7" y="37" width="32" height="1.8" rx="0.9" fill="hsl(40,14%,35%)"/>
          <rect x="7" y="42" width="26" height="1.8" rx="0.9" fill="hsl(40,14%,35%)"/>
          <rect x="7" y="47" width="30" height="1.8" rx="0.9" fill="hsl(40,14%,35%)"/>
        </svg>
      </div>
      <style>{`
        @keyframes paperFloat1 {
          0%,100% { transform: translateY(0px) rotate(-5deg); }
          50%      { transform: translateY(-20px) rotate(-3deg); }
        }
        @keyframes paperFloat2 {
          0%,100% { transform: translateY(0px) rotate(14deg); }
          50%      { transform: translateY(-26px) rotate(16deg); }
        }
        @keyframes paperFloat3 {
          0%,100% { transform: translateY(0px) rotate(-10deg); }
          50%      { transform: translateY(-16px) rotate(-8deg); }
        }
      `}</style>
    </div>
  );
}

// ── Floating skill chips ───────────────────────────────────────────────────
const SKILL_CHIPS = [
  { label: "Python",           color: "hsl(210,65%,60%)", delay: "0s",    top: "24%", left:  "2.5%", anim: "chipFloat1" },
  { label: "SQL",              color: "hsl(150,50%,52%)", delay: "1.2s",  top: "58%", left:  "1.5%", anim: "chipFloat2" },
  { label: "Excel",            color: "hsl(145,42%,48%)", delay: "0.5s",  top: "74%", left:  "3.5%", anim: "chipFloat1" },
  { label: "Power BI",         color: "hsl(38,75%,60%)",  delay: "0.8s",  top: "20%", right: "12%",  anim: "chipFloat2" },
  { label: "Tableau",          color: "hsl(200,60%,56%)", delay: "1.5s",  top: "54%", right: "9%",   anim: "chipFloat1" },
  { label: "Machine Learning", color: "hsl(270,45%,65%)", delay: "0.3s",  top: "80%", right: "7%",   anim: "chipFloat2" },
];

function SkillChips() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
      {SKILL_CHIPS.map(({ label, color, delay, top, left, right, anim }: any) => (
        <div key={label} style={{ position: "absolute", top, left, right, animation: `${anim} 6s ease-in-out infinite`, animationDelay: delay }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.32rem 0.8rem", borderRadius: "100px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${color}55`,
            backdropFilter: "blur(10px)",
            whiteSpace: "nowrap",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 500, color: "hsl(40,18%,70%)", letterSpacing: "0.02em" }}>{label}</span>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes chipFloat1 { 0%,100% { transform: translateY(0); opacity: 0.65; } 50% { transform: translateY(-12px); opacity: 1; } }
        @keyframes chipFloat2 { 0%,100% { transform: translateY(0); opacity: 0.65; } 50% { transform: translateY(-18px); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── ATS score floating widget ──────────────────────────────────────────────
function ATSWidget() {
  const r = 28, circ = 2 * Math.PI * r;
  const score = 87;
  const offset = circ * (1 - score / 100);
  return (
    <div style={{ position: "absolute", top: "30%", right: "4%", animation: "widgetFloat 8s ease-in-out infinite", zIndex: 2, pointerEvents: "none" }}>
      <div style={{
        background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.11)",
        borderRadius: "16px", padding: "1.1rem 1.4rem",
        backdropFilter: "blur(20px)", minWidth: "158px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        <p style={{ fontSize: "0.6rem", color: "hsl(40,14%,52%)", letterSpacing: "0.11em", textTransform: "uppercase", marginBottom: "0.8rem" }}>ATS Score</p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
            <circle cx="32" cy="32" r={r} fill="none"
              stroke="hsl(120,38%,54%)" strokeWidth="5"
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 32 32)"
              style={{ filter: "drop-shadow(0 0 5px hsl(120,38%,38%))" }}
            />
            <text x="32" y="37" textAnchor="middle" fill="hsl(40,20%,84%)" fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif">{score}</text>
          </svg>
          <div>
            <p style={{ fontSize: "0.75rem", color: "hsl(120,32%,62%)", fontWeight: 600, marginBottom: "0.35rem" }}>Good</p>
            <p style={{ fontSize: "0.62rem", color: "hsl(40,12%,46%)", lineHeight: 1.6 }}>3 keywords<br/>missing</p>
          </div>
        </div>
      </div>
      <style>{`@keyframes widgetFloat { 0%,100% { transform: translateY(0px) rotate(0.5deg); } 50% { transform: translateY(-14px) rotate(-0.5deg); } }`}</style>
    </div>
  );
}

// ── Feature pills ──────────────────────────────────────────────────────────
const FEATURES = [
  { label: "ATS Scoring",     desc: "Keyword alignment against live job descriptions" },
  { label: "Skill Gap Radar", desc: "Know exactly what the market wants that you lack" },
  { label: "Roadmap",         desc: "Week-by-week plan to close every gap" },
  { label: "Job Matches",     desc: "Live listings ranked by your profile fit" },
  { label: "AI Interviewer",  desc: "Voice-based mock interviews with instant feedback" },
  { label: "Resume Builder",  desc: "Export a clean, ATS-optimised PDF in minutes" },
];

// ── Stressed → Confident journey strip ────────────────────────────────────
function JourneyStrip() {
  return (
    <section style={{ maxWidth: "680px", margin: "0 auto", padding: "0 2rem 3.5rem", display: "flex", alignItems: "center" }}>
      {/* Stressed figure */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem" }}>
        <svg width="72" height="88" viewBox="0 0 64 80" fill="none">
          <circle cx="32" cy="16" r="11" stroke="hsl(35,42%,60%)" strokeWidth="2" fill="none"/>
          <path d="M27 22 Q32 19.5 37 22" stroke="hsl(35,42%,60%)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M42 6 L45 3 L48 6"  stroke="hsl(38,58%,64%)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
          <path d="M16 9 L19 6 L22 9"  stroke="hsl(38,58%,64%)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
          <line x1="44" y1="11" x2="49" y2="9" stroke="hsl(38,52%,60%)" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
          <path d="M32 27 C30 37 24 44 22 55" stroke="hsl(35,36%,57%)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M30 32 C23 36 17 39 15 43" stroke="hsl(35,36%,57%)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M33 33 C39 37 44 38 47 41" stroke="hsl(35,36%,57%)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M22 55 C19 64 17 71 15 78" stroke="hsl(35,36%,57%)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M22 55 C25 63 27 69 27 78" stroke="hsl(35,36%,57%)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <rect x="34" y="64" width="20" height="3" rx="1.2" fill="hsl(40,24%,48%)" opacity="0.85" transform="rotate(-10 34 64)"/>
          <rect x="37" y="70" width="16" height="3" rx="1.2" fill="hsl(40,22%,44%)" opacity="0.7"  transform="rotate(6 37 70)"/>
          <rect x="33" y="75" width="22" height="3" rx="1.2" fill="hsl(40,22%,42%)" opacity="0.55" transform="rotate(-3 33 75)"/>
        </svg>
        <span style={{ fontSize: "0.68rem", color: "hsl(40,18%,50%)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Before</span>
      </div>

      {/* Arrow */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "0 0.75rem", flexShrink: 0 }}>
        <svg width="100" height="22" viewBox="0 0 100 22" fill="none">
          <line x1="0" y1="11" x2="90" y2="11" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 3"/>
          <path d="M87 6 L97 11 L87 16" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: "0.6rem", color: "hsl(40,12%,44%)", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>vishwakarma</span>
      </div>

      {/* Confident figure */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.85rem" }}>
        <svg width="72" height="88" viewBox="0 0 64 80" fill="none">
          <circle cx="32" cy="14" r="11" stroke="hsl(130,38%,58%)" strokeWidth="2" fill="none"/>
          <path d="M27 18 Q32 23.5 37 18" stroke="hsl(130,38%,58%)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <line x1="32" y1="25" x2="32" y2="55" stroke="hsl(130,34%,56%)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M32 33 C25 27 18 24 14 21" stroke="hsl(130,34%,56%)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M32 33 C39 27 46 24 50 21" stroke="hsl(130,34%,56%)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          <path d="M32 55 C27 63 24 70 22 78" stroke="hsl(130,34%,56%)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M32 55 C37 63 40 70 42 78" stroke="hsl(130,34%,56%)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M43 3 L46.5 7 L54 -1" stroke="hsl(130,48%,62%)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="10" y1="28" x2="10" y2="22" stroke="hsl(40,62%,66%)" strokeWidth="1.5" opacity="0.9" strokeLinecap="round"/>
          <line x1="7"  y1="25" x2="13" y2="25" stroke="hsl(40,62%,66%)" strokeWidth="1.5" opacity="0.9" strokeLinecap="round"/>
          <line x1="54" y1="30" x2="54" y2="24" stroke="hsl(40,62%,66%)" strokeWidth="1.5" opacity="0.9" strokeLinecap="round"/>
          <line x1="51" y1="27" x2="57" y2="27" stroke="hsl(40,62%,66%)" strokeWidth="1.5" opacity="0.9" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: "0.68rem", color: "hsl(130,30%,54%)", letterSpacing: "0.07em", textTransform: "uppercase" }}>After</span>
      </div>
    </section>
  );
}

// ── Grid Background ─────────────────────────────────────────────────────────
function GridBackground() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden",
      backgroundSize: "40px 40px",
      backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
      maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)",
      WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)",
    }} />
  );
}

// ── Floating Tech Particles ────────────────────────────────────────────────
function Particles() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: 25 }).map(() => ({
        width: Math.random() * 4 + 2 + "px",
        height: Math.random() * 4 + 2 + "px",
        backgroundColor: `hsla(${Math.random() * 60 + 200}, 80%, 70%, ${Math.random() * 0.5 + 0.2})`,
        top: Math.random() * 100 + "%",
        left: Math.random() * 100 + "%",
        animationDuration: `${Math.random() * 15 + 15}s`,
        animationDelay: `-${Math.random() * 15}s`,
      }))
    );
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.width,
          height: p.height,
          backgroundColor: p.backgroundColor,
          borderRadius: "50%",
          top: p.top,
          left: p.left,
          boxShadow: "0 0 10px 2px rgba(255,255,255,0.15)",
          animation: `floatUp ${p.animationDuration} linear infinite`,
          animationDelay: p.animationDelay,
        }} />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-200px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [targetLocation, setTargetLocation] = useState("Bangalore");
  const [step, setStep] = useState<"landing" | "parsing" | "results">("landing");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const [ats, setAts] = useState<any>(null);
  const [gaps, setGaps] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAnalyze() {
    if (!file) return;
    setStep("parsing");
    setError(null);
    try {
      setLoadingMsg("Parsing your resume…");
      const form1 = new FormData();
      form1.append("file", file);
      const parsedRes = await axios.post(
        `/api/resume/parse?target_role=${encodeURIComponent(targetRole)}&target_location=${encodeURIComponent(targetLocation)}`,
        form1, { timeout: 60000 }
      );
      setParsed(parsedRes.data);
      setLoadingMsg("Running ATS check & market analysis…");
      const form2 = new FormData();
      form2.append("file", file);
      const [atsRes, gapsRes] = await Promise.all([
        axios.post(`/api/intelligence/ats?target_role=${encodeURIComponent(targetRole)}`, form2, { timeout: 60000 }),
        axios.post(`/api/analysis/gaps?target_role=${encodeURIComponent(targetRole)}&target_location=${encodeURIComponent(targetLocation)}`, form2, { timeout: 120000 }),
      ]);
      setAts(atsRes.data);
      setGaps(gapsRes.data);
      setStep("results");
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const errorMsg = Array.isArray(detail)
        ? detail.map((d: any) => d?.msg || JSON.stringify(d)).join(", ")
        : typeof detail === "string" ? detail : e?.message || "Something went wrong.";
      setError(errorMsg);
      setStep("landing");
    }
  }

  return (
    <>

      <main style={{ minHeight: "100vh", background: "transparent", position: "relative", zIndex: 1 }}>

        {/* ── Nav ─────────────────────────────────────────────────────── */}
        <nav style={{
          padding: "0 2.5rem", height: "68px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0,
          background: "rgba(11, 11, 13, 0.78)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)", zIndex: 100,
        }}>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.04em", color: "var(--text-primary)" }}>
            vishwakarma
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href="/dashboard" style={{ fontSize: "0.875rem", color: "var(--text-secondary)", textDecoration: "none", padding: "0.5rem 0.9rem", borderRadius: "8px" }} className="nav-link">
              Dashboard
            </Link>
            <Link href="/login" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", background: "var(--bg-elevated)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.5rem 1.1rem", borderRadius: "8px", textDecoration: "none" }} className="nav-btn">
              Sign in
            </Link>
          </div>
        </nav>

        {/* ── Landing ─────────────────────────────────────────────────── */}
        {step === "landing" && (
          <>
            {/* Hero — relative so paper/chips/widget are positioned inside */}
            <section className="landing-hero" style={{ position: "relative" }}>
              <FloatingPaper />
              <SkillChips />
              <ATSWidget />

              {/* Content sits above the illustrations */}
              <div style={{ position: "relative", zIndex: 2 }}>
                <div className="eyebrow">AI-Native Career Intelligence</div>

                <h1 className="hero-heading">
                  From resume to<br />
                  <em>job-ready.</em>
                </h1>

                <p className="hero-sub">
                  Upload your resume. In under two minutes, get an ATS score,
                  a skill-gap breakdown, and a market view of what roles
                  actually want from you right now.
                </p>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/dashboard" className="cta-primary">
                    Go to Dashboard <ArrowRight size={15} />
                  </Link>
                  <button className="cta-secondary" onClick={() => dropRef.current?.scrollIntoView({ behavior: "smooth" })}>
                    Try free — no signup
                  </button>
                </div>

                <div style={{ width: "1px", height: "80px", background: "rgba(255,255,255,0.08)", margin: "5rem auto 0" }} />
              </div>
            </section>

            {/* Before → After strip */}
            <JourneyStrip />

            {/* Feature strip */}
            <section className="feature-strip">
              {FEATURES.map((f) => (
                <div className="feature-cell" key={f.label}>
                  <div className="feature-dot" />
                  <div>
                    <p className="feature-label">{f.label}</p>
                    <p className="feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Upload panel */}
            <section id="upload" className="upload-section" ref={dropRef}>
              <div className="upload-eyebrow">Free analysis · PDF or DOCX · No account needed</div>

              <div className="upload-panel">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
                  {[
                    { label: "Target role", value: targetRole, set: setTargetRole },
                    { label: "Location", value: targetLocation, set: setTargetLocation },
                  ].map(({ label, value, set }) => (
                    <div key={label}>
                      <label className="field-label">{label}</label>
                      <input value={value} onChange={(e) => set(e.target.value)} className="field-input" />
                    </div>
                  ))}
                </div>

                <div
                  className={`drop-zone${file ? " drop-zone--filled" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={22} strokeWidth={1.5} />
                  <span className="drop-label">{file ? file.name : "Drop PDF or DOCX here, or click to browse"}</span>
                  <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>

                {error && <div className="error-banner">{error}</div>}

                <button onClick={handleAnalyze} disabled={!file} className={`analyze-btn${file ? "" : " analyze-btn--disabled"}`}>
                  Analyse my resume
                </button>

                <div className="locked-row">
                  <span className="locked-label">Sign in to unlock</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {["Roadmap", "Job matching", "AI Interview", "Resume builder", "Progress tracker", "Deadline reminders"].map((f) => (
                      <span className="locked-chip" key={f}><Lock size={9} strokeWidth={2} /> {f}</span>
                    ))}
                  </div>
                  <Link href="/login" className="locked-cta">Create free account →</Link>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── Parsing loader ───────────────────────────────────────────── */}
        {step === "parsing" && (
          <div className="loader-center">
            <Loader2 size={32} strokeWidth={1.5} className="spin" />
            <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>{loadingMsg}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>This takes about 60–90 seconds</p>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────────── */}
        {step === "results" && (
          <div style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Your resume analysis</h1>
              <button onClick={() => { setStep("landing"); setFile(null); setParsed(null); setAts(null); setGaps(null); }}
                style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
                Start over
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {parsed && <ResumeCard data={parsed} />}
              {ats && <ATSCard data={ats} />}
              {gaps && <GapsCard data={gaps} />}
            </div>
            <div className="upsell-block">
              <p className="upsell-eyebrow">Next steps</p>
              <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
                Get your week-by-week roadmap, job matches & AI interview practice
              </h2>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1.75rem", lineHeight: 1.7 }}>
                Create a free account to save this analysis and unlock every tool.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/login" className="cta-primary" style={{ fontSize: "0.875rem" }}>Create free account <ArrowRight size={14} /></Link>
                <Link href="/dashboard" className="cta-secondary" style={{ fontSize: "0.875rem" }}>Go to dashboard</Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
