"use client";

import { useEffect, useRef, useState } from "react";

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

export default function GlobalBackgrounds() {
  return (
    <>
      <GridBackground />
      <DotGrid />
      <CursorOrbs />
      <Particles />
    </>
  );
}
