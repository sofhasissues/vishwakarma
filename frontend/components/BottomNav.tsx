"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Map, Mic, FileText, Settings } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracker", label: "Tracker", icon: Map },
  { href: "/interview", label: "Interview", icon: Mic },
  { href: "/resume-builder", label: "Resume", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav 
      className="glass-panel"
      style={{
        position: "fixed", bottom: "16px", left: "16px", right: "16px",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        zIndex: 200, height: "64px", padding: "0 8px", borderRadius: "16px",
        boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-subtle)",
        background: "rgba(10, 10, 15, 0.8)", backdropFilter: "blur(12px)"
      }}
    >
      {links.map(({ href, label, icon: Icon }) => (
        <Link 
          key={href} 
          href={href} 
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "0.4rem", textDecoration: "none",
            color: path === href ? "var(--text-primary)" : "var(--text-muted)",
            transition: "var(--transition-fast)",
            position: "relative", padding: "8px 12px", borderRadius: "12px",
            background: path === href ? "var(--bg-elevated)" : "transparent"
          }}
          className="hover-lift"
        >
          <Icon size={18} style={{ opacity: path === href ? 1 : 0.6 }} />
          <span style={{ 
            fontSize: "0.65rem", 
            fontWeight: 600, 
            textTransform: "uppercase", 
            letterSpacing: "0.04em" 
          }}>
            {label}
          </span>
          {path === href && (
            <div style={{
              position: "absolute", bottom: "-2px", left: "25%", right: "25%",
              height: "2px", background: "var(--accent)", borderRadius: "2px"
            }} />
          )}
        </Link>
      ))}
    </nav>
  );
}
