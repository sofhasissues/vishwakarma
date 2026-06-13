"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── Animated cursor orbs ──────────────────────────────────────────────────
function CursorOrbs() {
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const c1 = useRef({ x: 400, y: 300 });
  const c2 = useRef({ x: 800, y: 500 });
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    pos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const onMove = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      c1.current.x = lerp(c1.current.x, pos.current.x - 250, 0.05);
      c1.current.y = lerp(c1.current.y, pos.current.y - 250, 0.05);
      c2.current.x = lerp(c2.current.x, pos.current.x + 80, 0.03);
      c2.current.y = lerp(c2.current.y, pos.current.y + 80, 0.03);
      if (orb1.current) orb1.current.style.transform = `translate(${c1.current.x}px,${c1.current.y}px)`;
      if (orb2.current) orb2.current.style.transform = `translate(${c2.current.x}px,${c2.current.y}px)`;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf.current!); };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div ref={orb1} style={{ position: "absolute", top: 0, left: 0, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, hsla(250,90%,65%,0.18) 0%, transparent 65%)", willChange: "transform" }} />
      <div ref={orb2} style={{ position: "absolute", top: 0, left: 0, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, hsla(190,80%,60%,0.14) 0%, transparent 65%)", willChange: "transform" }} />
    </div>
  );
}

// ── Star field ────────────────────────────────────────────────────────────
function Stars() {
  const [stars, setStars] = useState<any[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 80 }).map(() => ({
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      delay: Math.random() * 4 + "s",
      dur: Math.random() * 3 + 2 + "s",
    })));
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", top: s.top, left: s.left,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "white", opacity: s.opacity,
          animation: `twinkle ${s.dur} ease-in-out infinite`,
          animationDelay: s.delay,
        }} />
      ))}
      <style>{`@keyframes twinkle { 0%,100%{opacity:var(--op,0.2)} 50%{opacity:0.8} }`}</style>
    </div>
  );
}

// ── Grid overlay ──────────────────────────────────────────────────────────
function Grid() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
      backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
      backgroundSize: "60px 60px",
      maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 0%, transparent 100%)",
      WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 0%, transparent 100%)",
    }} />
  );
}

// ── Floating resume cards ──────────────────────────────────────────────────
function FloatingCards() {
  const cards = [
    { top: "12%", left: "3%",  rot: "-8deg",  delay: "0s",   dur: "8s",  w: 90,  h: 115 },
    { top: "55%", left: "1%",  rot: "6deg",   delay: "1.5s", dur: "10s", w: 70,  h: 90  },
    { top: "8%",  right: "4%", rot: "11deg",  delay: "0.7s", dur: "9s",  w: 80,  h: 100 },
    { top: "48%", right: "2%", rot: "-5deg",  delay: "2s",   dur: "7s",  w: 65,  h: 85  },
    { top: "78%", right: "6%", rot: "14deg",  delay: "1s",   dur: "11s", w: 55,  h: 70  },
  ];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          position: "absolute", top: c.top, left: (c as any).left, right: (c as any).right,
          animation: `cardFloat${i % 3} ${c.dur} ease-in-out infinite`,
          animationDelay: c.delay,
        }}>
          <svg width={c.w} height={c.h} viewBox={`0 0 ${c.w} ${c.h}`} fill="none"
            style={{ transform: `rotate(${c.rot})`, filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.6))" }}>
            <rect x="1" y="1" width={c.w-2} height={c.h-2} rx="5"
              fill="hsl(230,25%,10%)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            <rect x="8" y="12" width={c.w * 0.4} height="5" rx="2.5" fill="hsla(250,70%,70%,0.5)"/>
            {[20,27,33,39,47,53,59].map((y, j) => (
              <rect key={j} x="8" y={y} width={c.w * (0.5 + Math.random() * 0.35)} height="2" rx="1"
                fill={`hsla(220,20%,${35 + j * 2}%,0.6)`}/>
            ))}
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes cardFloat0 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.02)} }
        @keyframes cardFloat1 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-28px) scale(1.01)} }
        @keyframes cardFloat2 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-16px) scale(1.02)} }
      `}</style>
    </div>
  );
}

// ── Word rotator ──────────────────────────────────────────────────────────
const WORDS = ["hired.", "confident.", "unstoppable.", "chosen.", "ready."];
function WordRotator() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % WORDS.length); setVisible(true); }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, []);
  return (
    <span style={{
      display: "inline-block",
      background: "linear-gradient(135deg, hsl(250,90%,75%), hsl(190,80%,65%))",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
      fontStyle: "italic", fontWeight: 300,
    }}>
      {WORDS[idx]}
    </span>
  );
}

// ── Stats counter ─────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 700,
        letterSpacing: "-0.04em", color: "hsl(220,40%,96%)",
        marginBottom: "0.3rem",
      }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: "hsl(220,15%,50%)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function SplashPage() {
  const [entered, setEntered] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');

        .splash-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          padding: 2rem;
          overflow: hidden;
        }

        .splash-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 1rem;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(10px);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: hsl(220,20%,65%);
          margin-bottom: 2.5rem;
          animation: fadeSlideUp 0.8s ease 0.1s both;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: hsl(130,60%,55%);
          box-shadow: 0 0 8px hsl(130,60%,55%);
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.7} }

        .splash-headline {
          font-size: clamp(2.8rem, 8vw, 5.5rem);
          font-weight: 700;
          line-height: 1.02;
          letter-spacing: -0.045em;
          color: hsl(220,40%,96%);
          text-align: center;
          max-width: 800px;
          margin-bottom: 2rem;
          animation: fadeSlideUp 0.8s ease 0.2s both;
        }

        .splash-sub {
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: hsl(220,15%,58%);
          text-align: center;
          max-width: 560px;
          line-height: 1.8;
          font-weight: 400;
          margin-bottom: 3rem;
          animation: fadeSlideUp 0.8s ease 0.35s both;
        }
        .splash-sub strong {
          color: hsl(220,30%,82%);
          font-weight: 500;
        }

        .splash-ctas {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 4rem;
          animation: fadeSlideUp 0.8s ease 0.5s both;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 2rem;
          border-radius: 12px;
          background: hsl(220,40%,96%);
          color: hsl(224,40%,6%);
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          cursor: pointer;
          border: none;
          font-family: inherit;
          letter-spacing: -0.01em;
          transition: transform 150ms ease, box-shadow 150ms ease, opacity 150ms;
          box-shadow: 0 0 0 0 rgba(255,255,255,0.2);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.15);
          opacity: 0.94;
        }
        .btn-primary svg { transition: transform 200ms ease; }
        .btn-primary:hover svg { transform: translateX(3px); }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 2rem;
          border-radius: 12px;
          background: transparent;
          color: hsl(220,20%,65%);
          font-weight: 500;
          font-size: 0.95rem;
          text-decoration: none;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: inherit;
          letter-spacing: -0.01em;
          transition: border-color 150ms, color 150ms, transform 150ms;
        }
        .btn-secondary:hover {
          border-color: rgba(255,255,255,0.25);
          color: hsl(220,40%,92%);
          transform: translateY(-2px);
        }

        .splash-stats {
          display: flex;
          gap: 4rem;
          flex-wrap: wrap;
          justify-content: center;
          padding: 2.5rem 3rem;
          border-radius: 20px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          animation: fadeSlideUp 0.8s ease 0.65s both;
          margin-bottom: 4rem;
        }

        .splash-personas {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeSlideUp 0.8s ease 0.8s both;
        }

        .persona-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 1.1rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 0.82rem;
          color: hsl(220,15%,60%);
          font-weight: 400;
          cursor: default;
          transition: border-color 200ms, color 200ms, background 200ms;
        }
        .persona-chip:hover {
          border-color: rgba(255,255,255,0.2);
          color: hsl(220,30%,82%);
          background: rgba(255,255,255,0.07);
        }
        .persona-chip span { opacity: 0.6; }

        .splash-divider {
          width: 1px;
          height: 80px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent);
          margin: 3rem auto 0;
          animation: fadeSlideUp 0.8s ease 0.9s both;
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Page transition overlay */
        .page-transition {
          position: fixed; inset: 0; z-index: 1000;
          background: hsl(224,40%,6%);
          pointer-events: ${entered ? "all" : "none"};
          opacity: ${entered ? 1 : 0};
          transition: opacity 0.5s ease;
        }

        /* Bottom scroll hint */
        @keyframes scrollBounce {
          0%,100% { transform: translateY(0); opacity: 0.4; }
          50%      { transform: translateY(6px); opacity: 0.8; }
        }
      `}</style>

      {/* Background layers */}
      <Stars />
      <Grid />
      <CursorOrbs />
      <FloatingCards />

      {/* Page transition flash */}
      <div className="page-transition" />

      <main className="splash-root">

        {/* Badge */}
        <div className="splash-badge">
          <div className="badge-dot" />
          AI-Native Career Intelligence · Now Live
        </div>

        {/* Headline */}
        <h1 className="splash-headline">
          You deserve to be <br />
          <WordRotator />
        </h1>

        {/* Sub-copy */}
        <p className="splash-sub">
          The job market is brutal. The competition is fierce. <strong>You already have what it takes</strong> —
          Vishwakarma makes sure the world sees it. Upload your resume and watch your
          career trajectory transform in under two minutes.
        </p>

        {/* CTAs */}
        <div className="splash-ctas">
          <Link
            href="/analyze"
            className="btn-primary"
            onClick={() => setEntered(true)}
          >
            Analyse My Resume
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
        </div>

        {/* Stats */}
        <div className="splash-stats">
          <Stat value="2 min" label="Average analysis time" />
          <Stat value="87%" label="Avg ATS score improvement" />
          <Stat value="6×" label="More interviews landed" />
          <Stat value="Free" label="No credit card needed" />
        </div>

        {/* Persona chips */}
        <div className="splash-personas">
          {[
            { icon: "🎓", label: "Fresh graduate? You're exactly who we built this for." },
            { icon: "🔁", label: "Career switcher? We'll map your new path." },
            { icon: "📈", label: "Already working? Level up your profile." },
          ].map(({ icon, label }) => (
            <div key={label} className="persona-chip">
              <span>{icon}</span> {label}
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="splash-divider" />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
          animation: "scrollBounce 2s ease-in-out infinite",
          marginTop: "1.5rem", opacity: 0.4,
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M5 11l5 5 5-5" stroke="hsl(220,20%,60%)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

      </main>
    </>
  );
}
